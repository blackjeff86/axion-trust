import { NextResponse } from "next/server";
import { AccessRequestStatus } from "@prisma/client";
import { getAuthContext, isAuthContextError } from "@/lib/auth-context";
import { recordAuditActivity } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { recordTrustDocumentEvent } from "@/lib/data/data-room";
import { provisionExternalUser } from "@/lib/user-accounts";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: {
    name?: unknown;
    email?: unknown;
    company?: unknown;
    reason?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const authContext = await getAuthContext();
  const document = await prisma.trustDocument.findUnique({
    where: { id },
  });

  if (!document || document.visibility !== "Privado") {
    return NextResponse.json({ error: "Documento privado nao encontrado." }, { status: 404 });
  }

  const requesterName =
    authContext?.user.name || (typeof body.name === "string" ? body.name.trim() : "");
  const requesterEmail =
    authContext?.user.email || (typeof body.email === "string" ? body.email.trim().toLowerCase() : "");
  const requesterCompany =
    authContext?.user.company || (typeof body.company === "string" ? body.company.trim() : "");
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (!requesterName || !requesterEmail || !requesterCompany || !reason) {
    return NextResponse.json({ error: "Nome, email, empresa e motivo sao obrigatorios." }, { status: 400 });
  }

  const requesterUser = await provisionExternalUser({
    email: requesterEmail,
    name: requesterName,
    company: requesterCompany,
  });

  const accessRequest = await prisma.accessRequest.create({
    data: {
      organizationId: document.organizationId,
      documentId: document.id,
      requesterUserId: requesterUser.id,
      requesterName,
      requesterEmail,
      requesterCompany,
      reason,
      status: AccessRequestStatus.pending,
      documentType: "Documento privado",
    },
  });

  await recordTrustDocumentEvent({
    organizationId: document.organizationId,
    documentId: document.id,
    userId: requesterUser.id,
    actorNameSnapshot: requesterName,
    emailSnapshot: requesterEmail,
    companySnapshot: requesterCompany,
    action: "request_access",
  });

  await recordAuditActivity({
    organizationId: document.organizationId,
    type: "access.requested",
    title: "Nova solicitacao externa",
    description: `${requesterName} solicitou acesso ao documento ${document.name}.`,
    actor: requesterName,
    actorUserId: requesterUser.id,
    entityType: "AccessRequest",
    entityId: accessRequest.id,
  });

  return NextResponse.json({
    id: accessRequest.id,
    status: accessRequest.status,
  });
}
