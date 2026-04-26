import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACTIVE_ORGANIZATION_COOKIE, isAuthContextError, requireAuth } from "@/lib/auth-context";

export async function POST(request: Request) {
  let body: { organizationId?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const organizationId = typeof body.organizationId === "string" ? body.organizationId.trim() : "";

  if (!organizationId) {
    return NextResponse.json({ error: "Tenant invalido." }, { status: 400 });
  }

  try {
    const context = await requireAuth();
    const organization = context.organizations.find((item) => item.id === organizationId);

    if (!organization) {
      return NextResponse.json({ error: "Tenant indisponivel para este usuario." }, { status: 403 });
    }

    const cookieStore = await cookies();

    cookieStore.set(ACTIVE_ORGANIZATION_COOKIE, organization.id, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({
      activeOrganization: organization,
    });
  } catch (error) {
    if (isAuthContextError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Nao foi possivel trocar o tenant ativo." }, { status: 500 });
  }
}
