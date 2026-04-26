import { prisma } from "@/lib/db";

export async function recordAuditActivity(input: {
  organizationId: string;
  type: string;
  title: string;
  description: string;
  actor?: string | null;
  actorUserId?: string | null;
  actorMemberId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
}) {
  return prisma.auditActivity.create({
    data: {
      organizationId: input.organizationId,
      type: input.type,
      title: input.title,
      description: input.description,
      actor: input.actor ?? null,
      actorUserId: input.actorUserId ?? null,
      actorMemberId: input.actorMemberId ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
    },
  });
}
