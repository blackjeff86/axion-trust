export const ORGANIZATION_ROLES = ["owner", "admin", "editor", "viewer"] as const;

export type OrganizationRoleName = (typeof ORGANIZATION_ROLES)[number];

export const ROLE_LABELS: Record<OrganizationRoleName, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const ROLE_GROUPS = {
  tenantReaders: ["owner", "admin", "editor", "viewer"] as const,
  tenantAdmins: ["owner", "admin"] as const,
  owners: ["owner"] as const,
  documentStatusEditors: ["owner", "admin", "editor"] as const,
  documentPublishers: ["owner", "admin"] as const,
};

export const MVP_ACCESS_MATRIX = [
  {
    key: "readTenantData",
    label: "Ler dados internos do tenant",
    roles: ROLE_GROUPS.tenantReaders,
    note: "Dashboard, Data Room, Gestao de Acessos e leitura operacional.",
  },
  {
    key: "manageMembers",
    label: "Gerenciar membros internos",
    roles: ROLE_GROUPS.tenantAdmins,
    note: "Owner/admin listam e convidam membros; somente owner pode criar outro owner.",
  },
  {
    key: "reviewExternalAccess",
    label: "Aprovar/negar acessos externos",
    roles: ROLE_GROUPS.tenantAdmins,
    note: "Requests privados geram grants por documento.",
  },
  {
    key: "revokeExternalAccess",
    label: "Revogar grants externos",
    roles: ROLE_GROUPS.tenantAdmins,
    note: "Revogacao preserva historico e auditoria.",
  },
  {
    key: "editDocumentStatus",
    label: "Mover documentos entre rascunho/revisao",
    roles: ROLE_GROUPS.documentStatusEditors,
    note: "Editor prepara conteudo; publicacao final fica com owner/admin.",
  },
  {
    key: "publishDocuments",
    label: "Publicar documentos no Trust Center",
    roles: ROLE_GROUPS.documentPublishers,
    note: "Publicacao torna o documento visivel conforme regras de visibilidade.",
  },
  {
    key: "viewAudit",
    label: "Ver trilha de auditoria do tenant",
    roles: ROLE_GROUPS.tenantAdmins,
    note: "Para MVP, auditoria completa fica restrita a owner/admin.",
  },
] as const;

export function roleCan(role: OrganizationRoleName | null | undefined, permissionKey: string) {
  if (!role) return false;

  const permission = MVP_ACCESS_MATRIX.find((item) => item.key === permissionKey);

  return Boolean((permission?.roles as readonly OrganizationRoleName[] | undefined)?.includes(role));
}
