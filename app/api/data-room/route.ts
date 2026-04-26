import { NextResponse } from "next/server";
import { isAuthContextError, requireOrganizationMember } from "@/lib/auth-context";
import { getDataRoomWorkspaceFromDb } from "@/lib/data/data-room";

export async function GET() {
  try {
    const context = await requireOrganizationMember();
    const workspace = await getDataRoomWorkspaceFromDb(context.activeOrganizationId!);
    return NextResponse.json(workspace);
  } catch (error) {
    if (isAuthContextError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Nao foi possivel carregar o data room." }, { status: 500 });
  }
}
