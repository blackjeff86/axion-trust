import { NextResponse } from "next/server";
import { isAuthContextError, requireDocumentGrantOrPublic } from "@/lib/auth-context";
import { recordTrustDocumentEvent } from "@/lib/data/data-room";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  void request;
  const { id } = await params;

  try {
    const access = await requireDocumentGrantOrPublic(id);

    await recordTrustDocumentEvent({
      organizationId: access.document.organizationId,
      documentId: access.document.id,
      userId: access.context?.user.id ?? null,
      actorNameSnapshot: access.context?.user.name ?? null,
      emailSnapshot: access.context?.user.email ?? null,
      companySnapshot: access.context?.user.company ?? null,
      accessGrantId: access.grant?.id ?? null,
      action: "download",
    });

    return NextResponse.json({
      authorized: true,
      accessKind: access.accessKind,
      document: {
        id: access.document.id,
        slug: access.document.slug,
        name: access.document.name,
        version: access.document.version,
        visibility: access.document.visibility,
        status: access.document.status,
      },
      message:
        "Autorizacao validada. O storage binario dos arquivos ainda sera conectado na etapa de Vercel Blob.",
    });
  } catch (error) {
    if (isAuthContextError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }

    return NextResponse.json({ error: "Nao foi possivel autorizar o download." }, { status: 500 });
  }
}
