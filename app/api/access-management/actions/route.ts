import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    { error: "Use as rotas /requests/[id]/review e /grants/[id]/revoke." },
    { status: 410 },
  );
}
