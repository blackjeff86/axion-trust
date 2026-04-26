import { cookies } from "next/headers";
import { DocumentAccessGrantStatus, MembershipStatus, type OrganizationRole } from "@prisma/client";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const ACTIVE_ORGANIZATION_COOKIE = "axion-active-organization";

type ActiveMembershipRecord = {
  id: string;
  organizationId: string;
  role: OrganizationRole;
  title: string | null;
  organization: {
    id: string;
    name: string;
    displayName: string;
    domain: string | null;
  };
};

export type AuthOrganizationSummary = {
  id: string;
  name: string;
  displayName: string;
  domain: string | null;
  role: OrganizationRole;
  title: string | null;
};

export type AuthContext = {
  session: Session;
  user: {
    id: string;
    email: string;
    name: string;
    company: string | null;
    title: string | null;
    userType: "internal" | "external";
  };
  organizations: AuthOrganizationSummary[];
  activeOrganizationId: string | null;
  activeOrganization: AuthOrganizationSummary | null;
  activeMembership: ActiveMembershipRecord | null;
  memberships: ActiveMembershipRecord[];
};

export class AuthContextError extends Error {
  constructor(
    public code: string,
    public status: number,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export function resolveDocumentGrantStatus(grant: {
  status: DocumentAccessGrantStatus;
  revokedAt: Date | null;
  expiresAt: Date;
}) {
  if (grant.revokedAt || grant.status === DocumentAccessGrantStatus.revoked) {
    return DocumentAccessGrantStatus.revoked;
  }

  if (grant.expiresAt.getTime() <= Date.now()) {
    return DocumentAccessGrantStatus.expired;
  }

  return DocumentAccessGrantStatus.active;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        where: {
          status: MembershipStatus.active,
        },
        include: {
          organization: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const cookieStore = await cookies();
  const preferredOrganizationId = cookieStore.get(ACTIVE_ORGANIZATION_COOKIE)?.value ?? null;

  const memberships = user.memberships as ActiveMembershipRecord[];
  const organizations = memberships.map((membership) => ({
    id: membership.organization.id,
    name: membership.organization.name,
    displayName: membership.organization.displayName,
    domain: membership.organization.domain,
    role: membership.role,
    title: membership.title,
  }));

  const activeOrganizationId =
    organizations.find((organization) => organization.id === preferredOrganizationId)?.id ??
    organizations[0]?.id ??
    null;

  const activeMembership =
    memberships.find((membership) => membership.organizationId === activeOrganizationId) ?? null;

  const activeOrganization =
    organizations.find((organization) => organization.id === activeOrganizationId) ?? null;

  return {
    session,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company ?? null,
      title: user.title ?? null,
      userType: user.userType,
    },
    organizations,
    activeOrganizationId,
    activeOrganization,
    activeMembership,
    memberships,
  };
}

export async function requireAuth() {
  const context = await getAuthContext();

  if (!context) {
    throw new AuthContextError("AUTH_REQUIRED", 401, "Autenticacao obrigatoria.");
  }

  return context;
}

export async function requireOrganizationMember(roles?: readonly OrganizationRole[]) {
  const context = await requireAuth();

  if (!context.activeMembership || !context.activeOrganizationId) {
    throw new AuthContextError("MEMBERSHIP_REQUIRED", 403, "Sem tenant ativo para esta sessao.");
  }

  if (roles && !roles.includes(context.activeMembership.role)) {
    throw new AuthContextError("ROLE_FORBIDDEN", 403, "Seu papel nao permite esta acao.");
  }

  return context;
}

export async function requireDocumentGrantOrPublic(documentId: string) {
  const document = await prisma.trustDocument.findUnique({
    where: { id: documentId },
  });

  const isPublished = document?.status === "Publicado";
  const normalizedVisibility = document?.visibility.toLowerCase() ?? "";
  const isPublicVisibility = normalizedVisibility.includes("blic");

  if (!document || !isPublished) {
    throw new AuthContextError("DOCUMENT_NOT_FOUND", 404, "Documento nao encontrado.");
  }

  if (isPublicVisibility) {
    return {
      document,
      context: null,
      grant: null,
      accessKind: "public" as const,
    };
  }

  const context = await requireAuth();

  const internalMembership = context.memberships.find(
    (membership) => membership.organizationId === document.organizationId,
  );

  if (internalMembership) {
    return {
      document,
      context,
      grant: null,
      accessKind: "internal" as const,
    };
  }

  const grant = await prisma.documentAccessGrant.findFirst({
    where: {
      organizationId: document.organizationId,
      documentId: document.id,
      userId: context.user.id,
    },
  });

  if (!grant) {
    throw new AuthContextError("DOCUMENT_ACCESS_DENIED", 403, "Sem grant ativo para este documento.");
  }

  const grantStatus = resolveDocumentGrantStatus(grant);

  if (grantStatus !== DocumentAccessGrantStatus.active) {
    throw new AuthContextError("DOCUMENT_ACCESS_INACTIVE", 403, "Grant expirado ou revogado.");
  }

  if (document.ndaRequired && !grant.ndaAcceptedAt) {
    throw new AuthContextError("NDA_REQUIRED", 403, "Aceite de NDA obrigatorio.");
  }

  return {
    document,
    context,
    grant,
    accessKind: "grant" as const,
  };
}

export function isAuthContextError(error: unknown): error is AuthContextError {
  return error instanceof AuthContextError;
}
