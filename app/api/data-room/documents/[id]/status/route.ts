import { NextResponse } from "next/server";
import { ROLE_GROUPS, roleCan } from "@/lib/access-control";
import { isAuthContextError, requireOrganizationMember } from "@/lib/auth-context";
import { updateTrustDocumentStatusInDb } from "@/lib/data/data-room";
import type { TrustDocumentStatus } from "@/app/(secure)/data-room-seguro/data-room-data";

const documentStatuses = ["Publicado", "Pendente de aprovação", "Rascunho"] as const;

function isTrustDocumentStatus(value: unknown): value is TrustDocumentStatus {
  return typeof value === "string" && documentStatuses.includes(value as TrustDocumentStatus);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: { status?: unknown };

  try {
    body = (await request.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  if (!isTrustDocumentStatus(body.status)) {
    return NextResponse.json({ error: "Status invalido." }, { status: 400 });
  }

  try {
    const context = await requireOrganizationMember(ROLE_GROUPS.documentStatusEditors);

    if (body.status === "Publicado" && !roleCan(context.activeMembership!.role, "publishDocuments")) {
      return NextResponse.json({ error: "Somente owner/admin podem publicar documentos." }, { status: 403 });
    }

    const workspace = await updateTrustDocumentStatusInDb({
      documentId: id,
      status: body.status,
      organizationId: context.activeOrganizationId!,
      actorName: context.user.name,
      actorUserId: context.user.id,
      actorMemberId: context.activeMembership!.id,
    });
    return NextResponse.json(workspace);
  } catch (error) {
    if (isAuthContextError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "TRUST_DOCUMENT_NOT_FOUND") {
      return NextResponse.json({ error: "Documento nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ error: "Nao foi possivel atualizar o documento." }, { status: 500 });
  }
}
