import { NextResponse } from "next/server";
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
    const workspace = await updateTrustDocumentStatusInDb(id, body.status);
    return NextResponse.json(workspace);
  } catch (error) {
    if (error instanceof Error && error.message === "TRUST_DOCUMENT_NOT_FOUND") {
      return NextResponse.json({ error: "Documento nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ error: "Nao foi possivel atualizar o documento." }, { status: 500 });
  }
}
