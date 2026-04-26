import { NextResponse } from "next/server";
import { UserType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createPasswordHash, normalizePersonName } from "@/lib/user-accounts";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export async function POST(request: Request) {
  let body: {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    company?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? normalizePersonName(body.name) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nome, email e senha sao obrigatorios." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email invalido." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "A senha precisa ter ao menos 8 caracteres." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  const passwordHash = await createPasswordHash(password);

  if (existingUser?.userType === UserType.internal) {
    return NextResponse.json({ error: "Este email ja pertence a um usuario interno." }, { status: 409 });
  }

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        company: company || existingUser.company,
        passwordHash,
        userType: UserType.external,
        emailVerifiedAt: new Date(),
      },
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        name,
        company: company || null,
        passwordHash,
        userType: UserType.external,
        emailVerifiedAt: new Date(),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
