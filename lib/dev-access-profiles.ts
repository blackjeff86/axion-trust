type DemoAccessProfileRole = "owner" | "admin" | "editor" | "viewer" | "guest";
type DemoAccessProfileUserType = "internal" | "external";

export type DemoAccessProfileDefinition = {
  id: string;
  label: string;
  description: string;
  email: string;
  expectedRole: DemoAccessProfileRole;
  expectedUserType: DemoAccessProfileUserType;
  expectedOrganizationName: string | null;
  capabilities: string[];
  accentClassName: string;
};

export const demoAccessRoleLabels: Record<DemoAccessProfileRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
  guest: "Guest externo",
};

export const demoAccessProfiles: DemoAccessProfileDefinition[] = [
  {
    id: "axion-owner",
    label: "Owner AXION",
    description: "Controle total do tenant, membros, publicacao e acessos externos.",
    email: "ana.lucena@axiontrust.io",
    expectedRole: "owner",
    expectedUserType: "internal",
    expectedOrganizationName: "AXION Trust",
    capabilities: ["Tenant", "Membros", "Aprovacoes", "Revogacoes"],
    accentClassName: "border-sky-300/25 bg-sky-400/10 text-sky-200",
  },
  {
    id: "axion-admin",
    label: "Admin AXION",
    description: "Gestao completa operacional do tenant AXION.",
    email: "ricardo.menezes@axiontrust.io",
    expectedRole: "admin",
    expectedUserType: "internal",
    expectedOrganizationName: "AXION Trust",
    capabilities: ["Aprovacoes", "Revogacoes", "Auditoria", "Data Room"],
    accentClassName: "border-primary/20 bg-primary/10 text-primary",
  },
  {
    id: "axion-editor",
    label: "Editor AXION",
    description: "Edicao de documentos, Data Room e Trust Center.",
    email: "joao.silva@axiontrust.io",
    expectedRole: "editor",
    expectedUserType: "internal",
    expectedOrganizationName: "AXION Trust",
    capabilities: ["Documentos", "Trust Center", "Publicacao limitada"],
    accentClassName: "border-secondary/20 bg-secondary/10 text-secondary",
  },
  {
    id: "axion-viewer",
    label: "Viewer AXION",
    description: "Consulta interna com escopo somente leitura.",
    email: "camila.rocha@axiontrust.io",
    expectedRole: "viewer",
    expectedUserType: "internal",
    expectedOrganizationName: "AXION Trust",
    capabilities: ["Consulta", "Relatorios", "Leitura"],
    accentClassName: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  },
  {
    id: "orbit-admin",
    label: "Admin Orbit",
    description: "Valida segregacao com outro tenant ativo.",
    email: "marina.duarte@orbitcloud.io",
    expectedRole: "admin",
    expectedUserType: "internal",
    expectedOrganizationName: "Orbit Cloud",
    capabilities: ["Tenant Orbit", "Aprovacoes", "Dados isolados"],
    accentClassName: "border-violet-400/20 bg-violet-500/10 text-violet-300",
  },
  {
    id: "helio-owner",
    label: "Owner Helio",
    description: "Tenant fintech regulado com controles mais restritivos.",
    email: "bruna.almeida@heliobank.com.br",
    expectedRole: "owner",
    expectedUserType: "internal",
    expectedOrganizationName: "Helio Bank",
    capabilities: ["Regulatorio", "NDA", "Grants curtos", "Publicacao"],
    accentClassName: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
  },
  {
    id: "qa-multitenant",
    label: "QA Multi-tenant",
    description: "Usuario de teste com memberships diferentes nos 3 tenants.",
    email: "qa.multitenant@axiontrust.io",
    expectedRole: "owner",
    expectedUserType: "internal",
    expectedOrganizationName: "AXION Trust",
    capabilities: ["AXION owner", "Orbit admin", "Helio viewer"],
    accentClassName: "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200",
  },
  {
    id: "guest-external",
    label: "Guest Externo",
    description: "Fluxo externo com grants por documento, sem acesso ao app interno.",
    email: "amanda@bancoglobal.com",
    expectedRole: "guest",
    expectedUserType: "external",
    expectedOrganizationName: null,
    capabilities: ["Requests", "NDA", "Download autorizado"],
    accentClassName: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  },
];

export function isDemoAccessEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_ACCESS === "true";
}

export function getDemoAccessProfileById(profileId: string) {
  return demoAccessProfiles.find((profile) => profile.id === profileId) ?? null;
}
