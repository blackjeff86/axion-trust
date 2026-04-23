import { NextResponse } from "next/server";
import { applyAccessManagementAction } from "@/lib/data/access-management";

const accessActions = ["approve", "deny", "restore", "revoke", "reset"] as const;
type AccessAction = (typeof accessActions)[number];

function isAccessAction(value: unknown): value is AccessAction {
  return typeof value === "string" && accessActions.includes(value as AccessAction);
}

export async function POST(request: Request) {
  let body: { action?: unknown; id?: unknown };

  try {
    body = (await request.json()) as { action?: unknown; id?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  if (!isAccessAction(body.action)) {
    return NextResponse.json({ error: "Acao invalida." }, { status: 400 });
  }

  if (body.action !== "reset" && (typeof body.id !== "string" || !body.id.trim())) {
    return NextResponse.json({ error: "Id obrigatorio." }, { status: 400 });
  }

  try {
    const state = await applyAccessManagementAction({
      action: body.action,
      id: typeof body.id === "string" ? body.id.trim() : undefined,
    });

    return NextResponse.json(state);
  } catch (error) {
    if (error instanceof Error && error.message === "ACCESS_RECORD_NOT_FOUND") {
      return NextResponse.json({ error: "Registro nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ error: "Nao foi possivel aplicar a acao." }, { status: 500 });
  }
}
