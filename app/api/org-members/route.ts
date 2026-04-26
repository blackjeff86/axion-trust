import { NextResponse } from "next/server";
import { OrganizationRole } from "@prisma/client";
import { ROLE_GROUPS } from "@/lib/access-control";
import { isAuthContextError, requireOrganizationMember } from "@/lib/auth-context";
import { inviteOrganizationMember, listOrganizationMembers } from "@/lib/data/access-management";

const validRoles = Object.values(OrganizationRole);

function isOrganizationRole(value: unknown): value is OrganizationRole {
  return typeof value === "string" && validRoles.includes(value as OrganizationRole);
}

export async function GET() {
  try {
    const context = await requireOrganizationMember(ROLE_GROUPS.tenantAdmins);
    const members = await listOrganizationMembers(context.activeOrganizationId!);

    return NextResponse.json(
      members.map((member) => ({
        id: member.id,
        role: member.role,
        status: member.status,
        title: member.title,
        email: member.user.email,
        name: member.user.name,
      })),
    );
  } catch (error) {
    if (isAuthContextError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Nao foi possivel listar os membros." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: {
    name?: unknown;
    email?: unknown;
    title?: unknown;
    role?: unknown;
    temporaryPassword?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const temporaryPassword = typeof body.temporaryPassword === "string" ? body.temporaryPassword : "";

  if (!name || !email || !temporaryPassword || !isOrganizationRole(body.role)) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  try {
    const context = await requireOrganizationMember(ROLE_GROUPS.tenantAdmins);

    if (body.role === "owner" && context.activeMembership!.role !== "owner") {
      return NextResponse.json({ error: "Somente owner pode convidar outro owner." }, { status: 403 });
    }

    const member = await inviteOrganizationMember({
      organizationId: context.activeOrganizationId!,
      name,
      email,
      title: title || undefined,
      role: body.role,
      temporaryPassword,
      inviter: {
        name: context.user.name,
        userId: context.user.id,
        memberId: context.activeMembership!.id,
      },
    });

    return NextResponse.json({
      id: member.id,
      role: member.role,
      status: member.status,
      title: member.title,
      email: member.user.email,
      name: member.user.name,
    });
  } catch (error) {
    if (isAuthContextError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Nao foi possivel convidar o membro." }, { status: 500 });
  }
}
