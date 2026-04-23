import { NextResponse } from "next/server";
import { getAccessManagementStateFromDb } from "@/lib/data/access-management";

export async function GET() {
  const state = await getAccessManagementStateFromDb();
  return NextResponse.json(state);
}
