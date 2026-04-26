import { TrustDownloadAction, type Prisma } from "@prisma/client";
import { recordAuditActivity } from "@/lib/audit";
import { prisma } from "@/lib/db";
import type {
  AccessRequestStatus,
  DataRoomWorkspace,
  DocumentPublishingMode,
  TrustDocument,
  TrustDocumentCategory,
  TrustDocumentStatus,
  TrustDocumentVisibility,
  TrustDownloadEvent,
} from "@/app/(secure)/data-room-seguro/data-room-data";

function parseJsonArray<T>(value: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function formatDateTime(value: Date) {
  return value.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeCategory(value: string): TrustDocumentCategory {
  if (value === "Politicas") return "Políticas";
  if (value === "Relatorios de Seguranca") return "Relatórios de Segurança";
  return value as TrustDocumentCategory;
}

function normalizeVisibility(value: string): TrustDocumentVisibility {
  if (value === "Publico") return "Público";
  return value as TrustDocumentVisibility;
}

function formatRequestStatus(value: Prisma.AccessRequestGetPayload<object>["status"]): AccessRequestStatus {
  if (value === "approved") return "Aprovado";
  if (value === "denied") return "Negado";
  return "Pendente";
}

function formatDownloadActionLabel(event: {
  action: TrustDownloadAction;
  accessGrantId: string | null;
}): string {
  if (event.action === TrustDownloadAction.nda_accept) {
    return "NDA aceito";
  }

  if (event.action === TrustDownloadAction.request_access) {
    return "Solicitacao de acesso";
  }

  if (event.action === TrustDownloadAction.preview) {
    return "Preview autorizado";
  }

  if (event.accessGrantId) {
    return "Download apos aprovacao";
  }

  return "Download publico";
}

function formatDownloadTone(event: { action: TrustDownloadAction; accessGrantId: string | null }): TrustDownloadEvent["tone"] {
  if (event.action === TrustDownloadAction.download && !event.accessGrantId) {
    return "emerald";
  }

  return "blue";
}

function mapDocument(document: Awaited<ReturnType<typeof prisma.trustDocument.findMany>>[number]): TrustDocument {
  return {
    id: document.id,
    slug: document.slug,
    name: document.name,
    description: document.description,
    category: normalizeCategory(document.category),
    visibility: normalizeVisibility(document.visibility),
    status: document.status as TrustDocumentStatus,
    version: document.version,
    owner: document.owner,
    updatedAtLabel: document.updatedAtLabel,
    publishedAtLabel: document.publishedAtLabel ?? undefined,
    sizeLabel: document.sizeLabel,
    downloads: document.downloads,
    icon: document.icon,
    iconClass: document.iconClass,
    requiresApproval: document.requiresApproval,
    approvalRule: document.approvalRule,
    visibleInTrustCenter: document.visibleInTrustCenter,
    ndaRequired: document.ndaRequired,
    tags: parseJsonArray<string>(document.tagsJson, []),
  };
}

export async function getDataRoomWorkspaceFromDb(organizationId: string): Promise<DataRoomWorkspace> {
  const [settings, documents, requests, downloadEvents] = await Promise.all([
    prisma.dataRoomSettings.findUnique({ where: { organizationId } }),
    prisma.trustDocument.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.accessRequest.findMany({
      where: { organizationId },
      orderBy: { requestedAt: "desc" },
    }),
    prisma.trustDownloadEvent.findMany({
      where: {
        document: {
          organizationId,
        },
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    title: settings?.title ?? "Data Room Seguro",
    subtitle: settings?.subtitle ?? "",
    note: settings?.note ?? "",
    publishingMode: (settings?.publishingMode ?? "approval_required") as DocumentPublishingMode,
    categories: parseJsonArray<TrustDocumentCategory>(settings?.categoriesJson ?? "[]", []),
    documents: documents.map(mapDocument),
    requests: requests.map((request) => ({
      id: request.id,
      documentId: request.documentId,
      requester: request.requesterName,
      company: request.requesterCompany,
      email: request.requesterEmail,
      requestedAtLabel: formatDateTime(request.requestedAt),
      reason: request.reason,
      status: formatRequestStatus(request.status),
    })),
    downloadEvents: downloadEvents.map((event) => ({
      id: event.id,
      documentId: event.documentId,
      actor: event.actorNameSnapshot ?? event.user?.name ?? "Visitante",
      company: event.companySnapshot ?? event.user?.company ?? "Sem empresa",
      actionLabel: formatDownloadActionLabel(event),
      timeLabel: formatDateTime(event.createdAt),
      tone: formatDownloadTone(event),
    })),
  };
}

export async function updateTrustDocumentStatusInDb(input: {
  documentId: string;
  status: TrustDocumentStatus;
  organizationId: string;
  actorName: string;
  actorUserId: string;
  actorMemberId: string;
}) {
  const updateResult = await prisma.trustDocument.updateMany({
    where: { id: input.documentId, organizationId: input.organizationId },
    data: {
      status: input.status,
      visibleInTrustCenter: input.status === "Publicado",
      publishedAtLabel:
        input.status === "Publicado" ? `Publicado em ${new Date().toLocaleDateString("pt-BR")}` : null,
    },
  });

  if (updateResult.count === 0) {
    throw new Error("TRUST_DOCUMENT_NOT_FOUND");
  }

  const document = await prisma.trustDocument.findFirst({
    where: { id: input.documentId, organizationId: input.organizationId },
  });

  if (!document) {
    throw new Error("TRUST_DOCUMENT_NOT_FOUND");
  }

  await recordAuditActivity({
    organizationId: input.organizationId,
    type: "data-room.document-status",
    title: `Documento ${input.status.toLowerCase()}`,
    description: `${document.name} agora esta com status ${input.status}.`,
    actor: input.actorName,
    actorUserId: input.actorUserId,
    actorMemberId: input.actorMemberId,
    entityType: "TrustDocument",
    entityId: document.id,
  });

  return getDataRoomWorkspaceFromDb(input.organizationId);
}

export async function recordTrustDocumentEvent(input: {
  organizationId: string;
  documentId: string;
  userId?: string | null;
  actorNameSnapshot?: string | null;
  emailSnapshot?: string | null;
  companySnapshot?: string | null;
  accessGrantId?: string | null;
  action: TrustDownloadAction;
}) {
  await prisma.$transaction(async (tx) => {
    await tx.trustDownloadEvent.create({
      data: {
        documentId: input.documentId,
        userId: input.userId ?? null,
        actorNameSnapshot: input.actorNameSnapshot ?? null,
        emailSnapshot: input.emailSnapshot ?? null,
        companySnapshot: input.companySnapshot ?? null,
        accessGrantId: input.accessGrantId ?? null,
        action: input.action,
      },
    });

    if (input.action === TrustDownloadAction.download) {
      await tx.trustDocument.update({
        where: { id: input.documentId },
        data: {
          downloads: {
            increment: 1,
          },
        },
      });
    }
  });

  await recordAuditActivity({
    organizationId: input.organizationId,
    type: `public.${input.action}`,
    title: `Evento publico: ${input.action}`,
    description: `Documento ${input.documentId} registrou o evento ${input.action}.`,
    actor: input.actorNameSnapshot ?? "Visitante",
    actorUserId: input.userId ?? null,
    entityType: "TrustDocument",
    entityId: input.documentId,
  });
}
