import { prisma } from "@/lib/db";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/data/constants";
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

function mapDocument(document: Awaited<ReturnType<typeof prisma.trustDocument.findMany>>[number]): TrustDocument {
  return {
    id: document.id,
    slug: document.slug,
    name: document.name,
    description: document.description,
    category: document.category as TrustDocumentCategory,
    visibility: document.visibility as TrustDocumentVisibility,
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

export async function getDataRoomWorkspaceFromDb(
  organizationId = DEFAULT_ORGANIZATION_ID,
): Promise<DataRoomWorkspace> {
  const [settings, documents, requests, downloadEvents] = await Promise.all([
    prisma.dataRoomSettings.findUnique({ where: { organizationId } }),
    prisma.trustDocument.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.accessRequest.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.trustDownloadEvent.findMany({
      where: {
        document: {
          organizationId,
        },
      },
      orderBy: { id: "asc" },
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
      requester: request.requester,
      company: request.company,
      email: request.email,
      requestedAtLabel: request.requestedAtLabel,
      reason: request.reason,
      status: request.status as AccessRequestStatus,
    })),
    downloadEvents: downloadEvents.map((event) => ({
      id: event.id,
      documentId: event.documentId,
      actor: event.actor,
      company: event.company,
      actionLabel: event.actionLabel,
      timeLabel: event.timeLabel,
      tone: event.tone as TrustDownloadEvent["tone"],
    })),
  };
}

export async function updateTrustDocumentStatusInDb(
  documentId: string,
  status: TrustDocumentStatus,
  organizationId = DEFAULT_ORGANIZATION_ID,
) {
  const updateResult = await prisma.trustDocument.updateMany({
    where: { id: documentId, organizationId },
    data: {
      status,
      visibleInTrustCenter: status === "Publicado",
      publishedAtLabel:
        status === "Publicado" ? `Publicado em ${new Date().toLocaleDateString("pt-BR")}` : undefined,
    },
  });

  if (updateResult.count === 0) {
    throw new Error("TRUST_DOCUMENT_NOT_FOUND");
  }

  const document = await prisma.trustDocument.findFirst({
    where: { id: documentId, organizationId },
  });

  if (!document) {
    throw new Error("TRUST_DOCUMENT_NOT_FOUND");
  }

  await prisma.auditActivity.create({
    data: {
      organizationId,
      type: "data-room.document-status",
      title: `Documento ${status.toLowerCase()}`,
      description: `${document.name} agora esta com status ${status}.`,
      actor: "Ricardo Menezes",
      entityType: "TrustDocument",
      entityId: document.id,
    },
  });

  return getDataRoomWorkspaceFromDb(organizationId);
}
