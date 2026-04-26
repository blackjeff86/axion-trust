import { NextResponse } from "next/server";
import { ROLE_GROUPS } from "@/lib/access-control";
import { isAuthContextError, requireOrganizationMember } from "@/lib/auth-context";
import { revokeDocumentGrant } from "@/lib/data/access-management";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  void request;
  const { id } = await params;

  try {
    const context = await requireOrganizationMember(ROLE_GROUPS.tenantAdmins);
    const state = await revokeDocumentGrant({
      organizationId: context.activeOrganizationId!,
      grantId: id,
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
      return NextResponse.json({ error: "Grant nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ error: "Nao foi possivel revogar o grant." }, { status: 500 });
  }
}
