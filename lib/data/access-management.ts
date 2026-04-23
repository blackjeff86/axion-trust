import { prisma } from "@/lib/db";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/data/constants";
import { getDataRoomWorkspace } from "@/app/(secure)/data-room-seguro/data-room-data";
import type {
  AccessManagementState,
  ApprovedAccess,
  DeniedAccess,
  PendingRequest,
} from "@/app/(secure)/gestao-acessos/access-data";
import { initialApprovedAccesses } from "@/app/(secure)/gestao-acessos/access-data";

type AccessAction = "approve" | "deny" | "restore" | "revoke" | "reset";

function addOneYearLabel() {
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  return expirationDate.toLocaleDateString("pt-BR");
}

function nowLabel() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function getAccessManagementStateFromDb(
  organizationId = DEFAULT_ORGANIZATION_ID,
): Promise<AccessManagementState> {
  const [requests, approvedAccesses] = await Promise.all([
    prisma.accessRequest.findMany({
      where: { organizationId },
      include: { document: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.approvedAccess.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const pendingRequests: PendingRequest[] = requests
    .filter((request) => request.status === "Pendente")
    .map((request) => ({
      id: request.id,
      requester: request.requester,
      email: request.email,
      company: request.company,
      document: request.document.name,
      requestedAt: request.requestedAtLabel,
      reason: request.reason,
      documentType: request.documentType ?? "Documento privado",
      reviewTag: request.reviewTag,
    }));

  const deniedAccesses: DeniedAccess[] = requests
    .filter((request) => request.status === "Negado")
    .map((request) => ({
      id: request.id,
      requester: request.requester,
      email: request.email,
      company: request.company,
      document: request.document.name,
      requestedAt: request.requestedAtLabel,
      reason: request.reason,
      documentType: request.documentType ?? "Documento privado",
      reviewTag: request.reviewTag,
      deniedAt: request.deniedAt ?? request.updatedAt.toLocaleString("pt-BR"),
    }));

  return {
    pendingRequests,
    approvedAccesses: approvedAccesses.map((access) => ({
      id: access.id,
      requester: access.requester,
      email: access.email,
      company: access.company,
      document: access.document,
      approvedAt: access.approvedAt,
      expiresAt: access.expiresAt,
      status: access.status,
      statusClass: access.statusClass,
    })) as ApprovedAccess[],
    deniedAccesses,
  };
}

export async function applyAccessManagementAction({
  action,
  id,
  organizationId = DEFAULT_ORGANIZATION_ID,
}: {
  action: AccessAction;
  id?: string;
  organizationId?: string;
}) {
  if (action === "reset") {
    const workspace = getDataRoomWorkspace();

    await prisma.$transaction(async (tx) => {
      await tx.approvedAccess.deleteMany({ where: { organizationId } });
      await tx.accessRequest.deleteMany({ where: { organizationId } });

      await tx.accessRequest.createMany({
        data: workspace.requests.map((request) => ({
          id: request.id,
          organizationId,
          documentId: request.documentId,
          requester: request.requester,
          company: request.company,
          email: request.email,
          requestedAtLabel: request.requestedAtLabel,
          reason: request.reason,
          status: request.status,
          documentType: "Documento privado",
        })),
      });

      await tx.approvedAccess.createMany({
        data: initialApprovedAccesses.map((access) => ({
          id: access.id,
          organizationId,
          requester: access.requester,
          email: access.email,
          company: access.company,
          document: access.document,
          approvedAt: access.approvedAt,
          expiresAt: access.expiresAt,
          status: access.status,
          statusClass: access.statusClass,
        })),
      });

      await tx.auditActivity.create({
        data: {
          organizationId,
          type: "access.reset",
          title: "Gestao de acessos restaurada",
          description: "Solicitacoes e acessos demonstrativos foram restaurados para o baseline do banco local.",
          actor: "Ricardo Menezes",
          entityType: "AccessManagement",
        },
      });
    });

    return getAccessManagementStateFromDb(organizationId);
  }

  if (!id) {
    return getAccessManagementStateFromDb(organizationId);
  }

  if (action === "approve") {
    const request = await prisma.accessRequest.findFirst({
      where: { id, organizationId },
      include: { document: true },
    });

    if (!request) {
      throw new Error("ACCESS_RECORD_NOT_FOUND");
    }

    await prisma.accessRequest.updateMany({
      where: { id, organizationId },
      data: { status: "Aprovado", deniedAt: null },
    });

    await prisma.approvedAccess.upsert({
      where: { id: `acc-${request.id}` },
      update: {
        requester: request.requester,
        email: request.email,
        company: request.company,
        document: request.document.name,
        approvedAt: nowLabel(),
        expiresAt: addOneYearLabel(),
        status: "Ativo",
        statusClass: "bg-emerald-100 text-emerald-700",
      },
      create: {
        id: `acc-${request.id}`,
        organizationId,
        requester: request.requester,
        email: request.email,
        company: request.company,
        document: request.document.name,
        approvedAt: nowLabel(),
        expiresAt: addOneYearLabel(),
        status: "Ativo",
        statusClass: "bg-emerald-100 text-emerald-700",
      },
    });
  }

  if (action === "deny") {
    const updateResult = await prisma.accessRequest.updateMany({
      where: { id, organizationId },
      data: {
        status: "Negado",
        deniedAt: nowLabel(),
      },
    });

    if (updateResult.count === 0) {
      throw new Error("ACCESS_RECORD_NOT_FOUND");
    }
  }

  if (action === "restore") {
    const updateResult = await prisma.accessRequest.updateMany({
      where: { id, organizationId },
      data: {
        status: "Pendente",
        deniedAt: null,
      },
    });

    if (updateResult.count === 0) {
      throw new Error("ACCESS_RECORD_NOT_FOUND");
    }
  }

  if (action === "revoke") {
    const deleteResult = await prisma.approvedAccess.deleteMany({
      where: { id, organizationId },
    });

    if (deleteResult.count === 0) {
      throw new Error("ACCESS_RECORD_NOT_FOUND");
    }
  }

  await prisma.auditActivity.create({
    data: {
      organizationId,
      type: `access.${action}`,
      title: `Acao de acesso: ${action}`,
      description: `Acao ${action} aplicada ao registro ${id}.`,
      actor: "Ricardo Menezes",
      entityType: "Access",
      entityId: id,
    },
  });

  return getAccessManagementStateFromDb(organizationId);
}
