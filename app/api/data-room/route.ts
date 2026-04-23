import { NextResponse } from "next/server";
import { getDataRoomWorkspaceFromDb } from "@/lib/data/data-room";

export async function GET() {
  const workspace = await getDataRoomWorkspaceFromDb();
  return NextResponse.json(workspace);
}
