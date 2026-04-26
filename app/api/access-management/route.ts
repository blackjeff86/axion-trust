import { NextResponse } from "next/server";
import { isAuthContextError, requireOrganizationMember } from "@/lib/auth-context";
import { getAccessManagementStateFromDb } from "@/lib/data/access-management";

export async function GET() {
  try {
    const context = await requireOrganizationMember();
    const state = await getAccessManagementStateFromDb(context.activeOrganizationId!);
    return NextResponse.json(state);
  } catch (error) {
    if (isAuthContextError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Nao foi possivel carregar a gestao de acessos." }, { status: 500 });
  }
}
