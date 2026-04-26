import { NextResponse } from "next/server";
import { isAuthContextError, requireAuth } from "@/lib/auth-context";
import { recordAuditActivity } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { recordTrustDocumentEvent } from "@/lib/data/data-room";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  void request;
  const { id } = await params;

  try {
    const context = await requireAuth();
    const accessRequest = await prisma.accessRequest.findUnique({
      where: { id },
      include: {
        document: true,
      },
    });

    if (!accessRequest) {
      return NextResponse.json({ error: "Solicitacao nao encontrada." }, { status: 404 });
    }

    if (accessRequest.requesterUserId !== context.user.id && accessRequest.requesterEmail !== context.user.email) {
      return NextResponse.json({ error: "Esta solicitacao nao pertence ao usuario autenticado." }, { status: 403 });
    }

    const acceptedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.accessRequest.update({
        where: { id: accessRequest.id },
        data: {
          requesterUserId: context.user.id,
          ndaAcceptedAt: acceptedAt,
        },
      });

      await tx.documentAccessGrant.updateMany({
        where: {
          organizationId: accessRequest.organizationId,
          documentId: accessRequest.documentId,
          userId: context.user.id,
        },
        data: {
          ndaAcceptedAt: acceptedAt,
        },
      });
    });

    await recordTrustDocumentEvent({
      organizationId: accessRequest.organizationId,
      documentId: accessRequest.documentId,
      userId: context.user.id,
      actorNameSnapshot: context.user.name,
      emailSnapshot: context.user.email,
      companySnapshot: context.user.company,
      action: "nda_accept",
    });

    await recordAuditActivity({
      organizationId: accessRequest.organizationId,
      type: "access.nda-accepted",
      title: "NDA aceito",
      description: `${context.user.name} aceitou o NDA para ${accessRequest.document.name}.`,
      actor: context.user.name,
      actorUserId: context.user.id,
      entityType: "AccessRequest",
      entityId: accessRequest.id,
    });

    return NextResponse.json({ ok: true, acceptedAt: acceptedAt.toISOString() });
  } catch (error) {
    if (isAuthContextError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Nao foi possivel registrar o NDA." }, { status: 500 });
  }
}
