import { hash } from "bcryptjs";
import { UserType } from "@prisma/client";
import { prisma } from "@/lib/db";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizePersonName(name: string) {
  return name.trim();
}

export async function createPasswordHash(password: string) {
  return hash(password, 10);
}

export async function provisionExternalUser(input: {
  email: string;
  name: string;
  company?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: existingUser.name || normalizePersonName(input.name),
        company: input.company?.trim() || existingUser.company,
        userType: existingUser.userType === UserType.internal ? UserType.internal : UserType.external,
      },
    });
  }

  return prisma.user.create({
    data: {
      email,
      name: normalizePersonName(input.name),
      company: input.company?.trim() || null,
      passwordHash: await createPasswordHash(`${email}::shell-account`),
      userType: UserType.external,
    },
  });
}
