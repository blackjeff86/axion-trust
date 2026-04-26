import { AccessRequestStatus, DocumentAccessGrantStatus, MembershipStatus, OrganizationRole } from "@prisma/client";
import type { AccessManagementState } from "@/app/(secure)/gestao-acessos/access-data";
import { resolveDocumentGrantStatus } from "@/lib/auth-context";
import { recordAuditActivity } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { provisionExternalUser } from "@/lib/user-accounts";

function formatDateTime(value: Date) {
  return value.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: Date) {
  return value.toLocaleDateString("pt-BR");
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function getGrantStatusPresentation(grant: {
  status: DocumentAccessGrantStatus;
  revokedAt: Date | null;
  expiresAt: Date;
}) {
  const resolvedStatus = resolveDocumentGrantStatus(grant);
  const daysUntilExpiration = Math.ceil((grant.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (resolvedStatus === DocumentAccessGrantStatus.revoked) {
    return {
      label: "Revogado" as const,
      className: "bg-rose-100 text-rose-700",
    };
  }

  if (resolvedStatus === DocumentAccessGrantStatus.expired) {
    return {
      label: "Expirado" as const,
      className: "bg-slate-100 text-slate-700",
    };
  }

  if (daysUntilExpiration <= 30) {
    return {
      label: "Expira em breve" as const,
      className: "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "Ativo" as const,
    className: "bg-emerald-100 text-emerald-700",
  };
}

export async function getAccessManagementStateFromDb(organizationId: string): Promise<AccessManagementState> {
  const [requests, grants, auditEvents] = await Promise.all([
    prisma.accessRequest.findMany({
      where: { organizationId },
      include: {
        document: true,
      },
      orderBy: { requestedAt: "desc" },
    }),
    prisma.documentAccessGrant.findMany({
      where: { organizationId },
      include: {
        document: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditActivity.count({
      where: { organizationId },
    }),
  ]);

  const pendingRequests = requests
    .filter((request) => request.status === AccessRequestStatus.pending)
    .map((request) => ({
      id: request.id,
      requester: request.requesterName,
      email: request.requesterEmail,
      company: request.requesterCompany,
      document: request.document.name,
      requestedAt: formatDateTime(request.requestedAt),
      reason: request.reason,
      documentType: request.documentType ?? "Documento privado",
      reviewTag: request.reviewTag ?? null,
      ndaAcceptedAt: request.ndaAcceptedAt ? formatDateTime(request.ndaAcceptedAt) : null,
    }));

  const deniedRequests = requests
    .filter((request) => request.status === AccessRequestStatus.denied)
    .map((request) => ({
      id: request.id,
      requester: request.requesterName,
      email: request.requesterEmail,
      company: request.requesterCompany,
      document: request.document.name,
      requestedAt: formatDateTime(request.requestedAt),
      reason: request.reason,
      documentType: request.documentType ?? "Documento privado",
      reviewTag: request.reviewTag ?? null,
      ndaAcceptedAt: request.ndaAcceptedAt ? formatDateTime(request.ndaAcceptedAt) : null,
      deniedAt: request.reviewedAt ? formatDateTime(request.reviewedAt) : formatDateTime(request.updatedAt),
    }));

  const accessGrants = grants.map((grant) => {
    const status = getGrantStatusPresentation(grant);

    return {
      id: grant.id,
      requester: grant.user.name,
      email: grant.user.email,
      company: grant.user.company ?? "Sem empresa",
      document: grant.document.name,
      approvedAt: formatDateTime(grant.createdAt),
      expiresAt: formatDate(grant.expiresAt),
      status: status.label,
      statusClass: status.className,
      ndaAcceptedAt: grant.ndaAcceptedAt ? formatDateTime(grant.ndaAcceptedAt) : null,
    };
  });

  return {
    pendingRequests,
    accessGrants,
    deniedRequests,
    stats: {
      pending: pendingRequests.length,
      active: accessGrants.filter((grant) => grant.status === "Ativo").length,
      expiring: accessGrants.filter((grant) => grant.status === "Expira em breve").length,
      auditEvents,
    },
  };
}

export async function reviewAccessRequest(input: {
  organizationId: string;
  requestId: string;
  decision: "approve" | "deny";
  reviewer: {
    name: string;
    userId: string;
    memberId: string;
  };
  expiresInDays?: number;
}) {
  const request = await prisma.accessRequest.findFirst({
    where: {
      id: input.requestId,
      organizationId: input.organizationId,
    },
    include: {
      document: true,
      requesterUser: true,
    },
  });

  if (!request) {
    throw new Error("ACCESS_RECORD_NOT_FOUND");
  }

  if (request.status !== AccessRequestStatus.pending) {
    throw new Error("ACCESS_REQUEST_ALREADY_REVIEWED");
  }

  const requester =
    request.requesterUser ??
    (await provisionExternalUser({
      email: request.requesterEmail,
      name: request.requesterName,
      company: request.requesterCompany,
    }));

  if (input.decision === "approve") {
    const reviewedAt = new Date();
    const expiresAt = addDays(reviewedAt, input.expiresInDays ?? 365);

    await prisma.$transaction(async (tx) => {
      await tx.accessRequest.update({
        where: { id: request.id },
        data: {
          requesterUserId: requester.id,
          status: AccessRequestStatus.approved,
          reviewedAt,
          reviewedByMemberId: input.reviewer.memberId,
        },
      });

      await tx.documentAccessGrant.upsert({
        where: {
          organizationId_documentId_userId: {
            organizationId: input.organizationId,
            documentId: request.documentId,
            userId: requester.id,
          },
        },
        update: {
          grantedByMemberId: input.reviewer.memberId,
          sourceRequestId: request.id,
          expiresAt,
          revokedAt: null,
          status: DocumentAccessGrantStatus.active,
        },
        create: {
          organizationId: input.organizationId,
          documentId: request.documentId,
          userId: requester.id,
          grantedByMemberId: input.reviewer.memberId,
          sourceRequestId: request.id,
          expiresAt,
          status: DocumentAccessGrantStatus.active,
        },
      });
    });

    await recordAuditActivity({
      organizationId: input.organizationId,
      type: "access.approved",
      title: "Solicitacao aprovada",
      description: `${request.requesterName} recebeu acesso ao documento ${request.document.name}.`,
      actor: input.reviewer.name,
      actorUserId: input.reviewer.userId,
      actorMemberId: input.reviewer.memberId,
      entityType: "AccessRequest",
      entityId: request.id,
    });
  } else {
    await prisma.accessRequest.update({
      where: { id: request.id },
      data: {
        requesterUserId: requester.id,
        status: AccessRequestStatus.denied,
        reviewedAt: new Date(),
        reviewedByMemberId: input.reviewer.memberId,
      },
    });

    await recordAuditActivity({
      organizationId: input.organizationId,
      type: "access.denied",
      title: "Solicitacao negada",
      description: `${request.requesterName} teve o acesso ao documento ${request.document.name} negado.`,
      actor: input.reviewer.name,
      actorUserId: input.reviewer.userId,
      actorMemberId: input.reviewer.memberId,
      entityType: "AccessRequest",
      entityId: request.id,
    });
  }

  return getAccessManagementStateFromDb(input.organizationId);
}

export async function revokeDocumentGrant(input: {
  organizationId: string;
  grantId: string;
  reviewer: {
    name: string;
    userId: string;
    memberId: string;
  };
}) {
  const grant = await prisma.documentAccessGrant.findFirst({
    where: {
      id: input.grantId,
      organizationId: input.organizationId,
    },
    include: {
      document: true,
      user: true,
    },
  });

  if (!grant) {
    throw new Error("ACCESS_RECORD_NOT_FOUND");
  }

  await prisma.documentAccessGrant.update({
    where: { id: grant.id },
    data: {
      revokedAt: new Date(),
      status: DocumentAccessGrantStatus.revoked,
    },
  });

  await recordAuditActivity({
    organizationId: input.organizationId,
    type: "access.revoked",
    title: "Grant revogado",
    description: `${grant.user.name} perdeu o acesso ao documento ${grant.document.name}.`,
    actor: input.reviewer.name,
    actorUserId: input.reviewer.userId,
    actorMemberId: input.reviewer.memberId,
    entityType: "DocumentAccessGrant",
    entityId: grant.id,
  });

  return getAccessManagementStateFromDb(input.organizationId);
}

export async function listOrganizationMembers(organizationId: string) {
  return prisma.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function inviteOrganizationMember(input: {
  organizationId: string;
  name: string;
  email: string;
  title?: string;
  role: OrganizationRole;
  temporaryPassword: string;
  inviter: {
    name: string;
    userId: string;
    memberId: string;
  };
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedName = input.name.trim();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  const passwordHash = await import("bcryptjs").then(({ hash }) => hash(input.temporaryPassword, 10));

  const user =
    existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: normalizedName,
            title: input.title?.trim() || existingUser.title,
            company: existingUser.company,
            passwordHash,
            userType: "internal",
          },
        })
      : await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: normalizedName,
            title: input.title?.trim() || null,
            company: null,
            passwordHash,
            userType: "internal",
          },
        });

  const membership = await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId: user.id,
      },
    },
    update: {
      role: input.role,
      status: MembershipStatus.invited,
      title: input.title?.trim() || null,
      invitedByUserId: input.inviter.userId,
    },
    create: {
      organizationId: input.organizationId,
      userId: user.id,
      role: input.role,
      status: MembershipStatus.invited,
      title: input.title?.trim() || null,
      invitedByUserId: input.inviter.userId,
    },
    include: {
      user: true,
    },
  });

  await recordAuditActivity({
    organizationId: input.organizationId,
    type: "member.invited",
    title: "Novo membro convidado",
    description: `${membership.user.name} foi convidado como ${input.role}.`,
    actor: input.inviter.name,
    actorUserId: input.inviter.userId,
    actorMemberId: input.inviter.memberId,
    entityType: "OrganizationMember",
    entityId: membership.id,
  });

  return membership;
}
