import { NextResponse } from "next/server";
import { ROLE_GROUPS } from "@/lib/access-control";
import { isAuthContextError, requireOrganizationMember } from "@/lib/auth-context";
import { reviewAccessRequest } from "@/lib/data/access-management";

const allowedDecisions = ["approve", "deny"] as const;

function isDecision(value: unknown): value is (typeof allowedDecisions)[number] {
  return typeof value === "string" && allowedDecisions.includes(value as (typeof allowedDecisions)[number]);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: { decision?: unknown; expiresInDays?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  if (!isDecision(body.decision)) {
    return NextResponse.json({ error: "Decisao invalida." }, { status: 400 });
  }

  const expiresInDays =
    typeof body.expiresInDays === "number" && Number.isFinite(body.expiresInDays)
      ? Math.max(1, Math.trunc(body.expiresInDays))
      : undefined;

  try {
    const context = await requireOrganizationMember(ROLE_GROUPS.tenantAdmins);
    const state = await reviewAccessRequest({
      organizationId: context.activeOrganizationId!,
      requestId: id,
      decision: body.decision,
      expiresInDays,
      reviewer: {
        name: context.user.name,
        userId: context.user.id,
        memberId: context.activeMembership!.id,
      },
    });

    return NextResponse.json(state);
  } catch (error) {
    if (isAuthContextError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.message === "ACCESS_RECORD_NOT_FOUND") {
      return NextResponse.json({ error: "Solicitacao nao encontrada." }, { status: 404 });
    }

    if (error instanceof Error && error.message === "ACCESS_REQUEST_ALREADY_REVIEWED") {
      return NextResponse.json({ error: "Solicitacao ja revisada." }, { status: 409 });
    }

    return NextResponse.json({ error: "Nao foi possivel revisar a solicitacao." }, { status: 500 });
  }
}
