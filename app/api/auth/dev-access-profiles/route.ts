import { NextResponse } from "next/server";
import { demoAccessProfiles, demoAccessRoleLabels, isDemoAccessEnabled } from "@/lib/dev-access-profiles";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!isDemoAccessEnabled()) {
    return NextResponse.json({
      enabled: false,
      profiles: [],
    });
  }

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: demoAccessProfiles.map((profile) => profile.email),
      },
    },
    select: {
      email: true,
      userType: true,
      memberships: {
        where: {
          status: "active",
        },
        select: {
          role: true,
          organization: {
          select: {
            name: true,
            domain: true,
          },
        },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const usersByEmail = new Map(users.map((user) => [user.email, user]));

  const profiles = demoAccessProfiles.map((profile) => {
    const user = usersByEmail.get(profile.email) ?? null;
    const membership = user?.memberships[0] ?? null;
    const role = membership?.role ?? profile.expectedRole;

    return {
      id: profile.id,
      label: profile.label,
      description: profile.description,
      expectedRole: profile.expectedRole,
      role,
      roleLabel: demoAccessRoleLabels[role],
      userType: user?.userType ?? profile.expectedUserType,
      organizationName: membership?.organization.name ?? profile.expectedOrganizationName,
      organizationDomain: membership?.organization.domain ?? null,
      capabilities: profile.capabilities,
      accentClassName: profile.accentClassName,
      status: user ? "available" : "missing",
    };
  });

  return NextResponse.json({
    enabled: true,
    profiles,
  });
}
