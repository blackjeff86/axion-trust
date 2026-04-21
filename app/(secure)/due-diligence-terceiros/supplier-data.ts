import { STORAGE_KEY as TEMPLATE_STORAGE_KEY, type SavedTemplate } from "./novo-questionario/template-builder-data";

export type SupplierRisk = "Baixo Risco" | "Médio Risco" | "Alto Risco" | "Risco Crítico";
export type SupplierLifecycleStatus =
  | "pendente-envio"
  | "questionarios-enviados"
  | "em-preenchimento"
  | "em-avaliacao"
  | "concluido"
  | "vencido";
export type QuestionnaireRunStatus =
  | "Não iniciado"
  | "Enviado"
  | "Em preenchimento"
  | "Respondido"
  | "Em avaliação"
  | "Concluído"
  | "Vencido";

export type SupplierQuestionnaireRun = {
  questionnaireId: string;
  status: QuestionnaireRunStatus;
  progress: number;
  sentAt?: string;
  dueAt?: string;
  lastUpdatedAt?: string;
};

export type SupplierAccessUser = {
  email: string;
  invitationStatus: "pendente" | "enviado";
  invitationSentAt?: string;
};

export type SupplierProfile = {
  slug: string;
  legalName: string;
  displayName: string;
  domain: string;
  website: string;
  supplierType: string;
  segment: string;
  subsegment: string;
  headquartersCity: string;
  headquartersCountry: string;
  taxId: string;
  primaryContactName: string;
  primaryContactRole: string;
  primaryContactEmail: string;
  securityContactEmail: string;
  privacyContactEmail: string;
  businessOwner: string;
  criticality: string;
  integrationType: string;
  dataClassification: string;
  accessScope: string;
  hostingModel: string;
  activeRegions: string;
  servicesProvided: string;
  countriesOfOperation: string;
  certifications: string[];
  accessUsers: SupplierAccessUser[];
  notes: string;
  risk: SupplierRisk;
  lifecycleStatus: SupplierLifecycleStatus;
  status: string;
  score?: number;
  previousScore?: number;
  trend?: number;
  evidences: Array<{
    title: string;
    meta: string;
    icon: string;
    status: string;
    statusClass: string;
    actionIcon: string;
    muted?: boolean;
  }>;
  internalNotes: Array<{
    author: string;
    time: string;
    content: string;
  }>;
  assignedQuestionnaireIds: string[];
  questionnaireRuns: SupplierQuestionnaireRun[];
  createdAt: string;
};

export type SupplierRow = {
  slug: string;
  name: string;
  domain: string;
  risk: SupplierRisk;
  riskClass: string;
  status: string;
  statusDot: string;
  score?: number;
  scoreColor: string;
  initial: string;
  initialColor: string;
};

export type QuestionnaireOption = {
  id: string;
  name: string;
  category: string;
  version: string;
  source: "catalogo" | "template";
};

export const SUPPLIER_STORAGE_KEY = "axion-trust-dd-suppliers";

function normalizeSupplierCopy(value: string) {
  return value
    .replaceAll("sensiveis", "sensíveis")
    .replaceAll("privilegio", "privilégio")
    .replaceAll("segregacao", "segregação")
    .replaceAll("criticos", "críticos")
    .replaceAll("orquestracao", "orquestração")
    .replaceAll("monitoramento continuo", "monitoramento contínuo")
    .replaceAll("renovacao", "renovação")
    .replaceAll("Certificacao", "Certificação")
    .replaceAll("Valido", "Válido")
    .replaceAll("Invasao", "Invasão")
    .replaceAll("Previsao", "Previsão")
    .replaceAll("ha ", "há ")
    .replaceAll("Logistica", "Logística")
    .replaceAll("Roteirizacao", "Roteirização")
    .replaceAll("Sao Paulo", "São Paulo")
    .replaceAll("Media", "Média")
    .replaceAll("operacao", "operação")
    .replaceAll("Operacao", "Operação")
    .replaceAll("Mexico", "México")
    .replaceAll("atualizacao", "atualização")
    .replaceAll("Ativacao", "Ativação")
    .replaceAll("audiencia", "audiência")
    .replaceAll("Canada", "Canadá")
    .replaceAll("comprovacao", "comprovação")
    .replaceAll("Andre", "André")
    .replaceAll("sensivel", "sensível")
    .replaceAll("Tokenizacao", "Tokenização")
    .replaceAll("autorizacao", "autorização")
    .replaceAll("Autorizacao", "Autorização")
    .replaceAll("questionario", "questionário")
    .replaceAll("questionarios", "questionários")
    .replaceAll("concluido", "concluído")
    .replaceAll("definicao", "definição")
    .replaceAll("avaliacao", "avaliação")
    .replaceAll("pendencia", "pendência")
    .replaceAll("critica", "crítica")
    .replaceAll("segmentacao", "segmentação");
}

function normalizeSupplierInput<T>(value: T): T {
  if (typeof value === "string") {
    return normalizeSupplierCopy(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeSupplierInput(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeSupplierInput(nestedValue)]),
    ) as T;
  }

  return value;
}

export const defaultSuppliers: SupplierProfile[] = [
  {
    slug: "stellar-cloud-solutions",
    legalName: "Stellar Cloud Solutions Inc.",
    displayName: "Stellar Cloud Solutions",
    domain: "stellar-cloud.com",
    website: "https://stellar-cloud.com",
    supplierType: "Infraestrutura Cloud",
    segment: "Cloud Infrastructure",
    subsegment: "Hosting e observabilidade",
    headquartersCity: "Palo Alto",
    headquartersCountry: "Estados Unidos",
    taxId: "US-88-2741942",
    primaryContactName: "Melissa Grant",
    primaryContactRole: "Vendor Success Director",
    primaryContactEmail: "melissa@stellar-cloud.com",
    securityContactEmail: "security@stellar-cloud.com",
    privacyContactEmail: "privacy@stellar-cloud.com",
    businessOwner: "Carlos Mendes",
    criticality: "Alta",
    integrationType: "API + Infraestrutura compartilhada",
    dataClassification: "Dados corporativos e logs sensíveis",
    accessScope: "Acesso operacional sem privilégio de escrita",
    hostingModel: "Multi-tenant com segregação lógica",
    activeRegions: "EUA, Brasil e Irlanda",
    servicesProvided: "Hospedagem de workloads críticos, observabilidade e orquestração de containers.",
    countriesOfOperation: "Estados Unidos, Brasil, Irlanda",
    certifications: ["SOC 2 Type II", "ISO 27001", "CSA STAR"],
    accessUsers: [
      { email: "melissa@stellar-cloud.com", invitationStatus: "enviado", invitationSentAt: "2026-04-10T12:00:00.000Z" },
    ],
    notes: "Fornecedor tier 1 com monitoramento contínuo e renovação anual de controles.",
    risk: "Baixo Risco",
    lifecycleStatus: "concluido",
    status: "Finalizado em 12/10/2023",
    score: 96,
    previousScore: 92,
    trend: 4,
    evidences: [
      {
        title: "Relatório SOC 2 Tipo II",
        meta: "Validade: 12/2024 • Emitido por Deloitte LLP",
        icon: "verified",
        status: "Auditado",
        statusClass: "bg-secondary-container/30 text-on-secondary-container",
        actionIcon: "download",
      },
      {
        title: "Certificação ISO/IEC 27001",
        meta: "Validade: 06/2025 • Infraestrutura Global",
        icon: "policy",
        status: "Válido",
        statusClass: "bg-secondary-container/30 text-on-secondary-container",
        actionIcon: "download",
      },
      {
        title: "Teste de Invasão (Pentest)",
        meta: "Em processamento • Previsão 48h",
        icon: "description",
        status: "Pendente",
        statusClass: "bg-tertiary-container/20 text-tertiary",
        actionIcon: "hourglass_empty",
        muted: true,
      },
    ],
    internalNotes: [
      {
        author: "Ana Martins",
        time: "há 2 horas",
        content:
          "Controles de criptografia em repouso revisados no SOC 2 e alinhados com nossa política de classificação de dados. Recomendo aprovação para o projeto Phoenix.",
      },
    ],
    assignedQuestionnaireIds: ["catalog-security-base"],
    questionnaireRuns: [
      {
        questionnaireId: "catalog-security-base",
        status: "Concluído",
        progress: 100,
        sentAt: "2026-04-10T12:00:00.000Z",
        dueAt: "2026-04-17T12:00:00.000Z",
        lastUpdatedAt: "2026-04-12T15:30:00.000Z",
      },
    ],
    createdAt: "2026-04-10T10:00:00.000Z",
  },
  {
    slug: "prime-logistics-int",
    legalName: "Prime Logistics International Ltd.",
    displayName: "Prime Logistics Int.",
    domain: "primelog.io",
    website: "https://primelog.io",
    supplierType: "Logística",
    segment: "Logistics Platform",
    subsegment: "Roteirização e fulfillment",
    headquartersCity: "São Paulo",
    headquartersCountry: "Brasil",
    taxId: "BR-12.334.991/0001-20",
    primaryContactName: "Roberto Farias",
    primaryContactRole: "Third-Party Operations Manager",
    primaryContactEmail: "roberto@primelog.io",
    securityContactEmail: "seguranca@primelog.io",
    privacyContactEmail: "privacidade@primelog.io",
    businessOwner: "Luciana Prado",
    criticality: "Média",
    integrationType: "SFTP + API de pedidos",
    dataClassification: "Dados de operação e PII limitada",
    accessScope: "Leitura de pedidos e eventos",
    hostingModel: "Cloud dedicada",
    activeRegions: "Brasil e México",
    servicesProvided: "Operação de fulfillment, despacho e atualização de tracking.",
    countriesOfOperation: "Brasil, México",
    certifications: ["ISO 27001"],
    accessUsers: [
      { email: "roberto@primelog.io", invitationStatus: "enviado", invitationSentAt: "2026-04-09T13:00:00.000Z" },
    ],
    notes: "Questionário em revisão pelo time de compliance.",
    risk: "Médio Risco",
    lifecycleStatus: "em-avaliacao",
    status: "Em Revisão",
    score: 74,
    previousScore: 70,
    trend: 4,
    evidences: [],
    internalNotes: [],
    assignedQuestionnaireIds: [],
    questionnaireRuns: [
      {
        questionnaireId: "catalog-security-base",
        status: "Em avaliação",
        progress: 75,
        sentAt: "2026-04-09T13:00:00.000Z",
        dueAt: "2026-04-16T13:00:00.000Z",
        lastUpdatedAt: "2026-04-17T09:15:00.000Z",
      },
    ],
    createdAt: "2026-04-09T09:30:00.000Z",
  },
  {
    slug: "datastream-marketing",
    legalName: "DataStream Marketing LLC",
    displayName: "DataStream Marketing",
    domain: "datastream.mkt",
    website: "https://datastream.mkt",
    supplierType: "Marketing Tech",
    segment: "AdTech Services",
    subsegment: "Ativação e analytics",
    headquartersCity: "Austin",
    headquartersCountry: "Estados Unidos",
    taxId: "US-22-1942741",
    primaryContactName: "Rachel Moss",
    primaryContactRole: "Partner Ops Lead",
    primaryContactEmail: "rachel@datastream.mkt",
    securityContactEmail: "security@datastream.mkt",
    privacyContactEmail: "privacy@datastream.mkt",
    businessOwner: "Marina Lopes",
    criticality: "Alta",
    integrationType: "Tag manager + data sync",
    dataClassification: "Dados de clientes e analytics",
    accessScope: "Eventos e segmentos de audiência",
    hostingModel: "SaaS multi-tenant",
    activeRegions: "EUA e Canadá",
    servicesProvided: "Gestão de audiências, analytics e ativação de campanhas.",
    countriesOfOperation: "Estados Unidos, Canadá",
    certifications: ["Sem comprovação recente"],
    accessUsers: [
      { email: "rachel@datastream.mkt", invitationStatus: "enviado", invitationSentAt: "2026-03-20T12:00:00.000Z" },
    ],
    notes: "Pendências de due diligence em aberto e evidências vencidas.",
    risk: "Risco Crítico",
    lifecycleStatus: "vencido",
    status: "Vencido (Atraso 15 dias)",
    score: 42,
    previousScore: 46,
    trend: -4,
    evidences: [],
    internalNotes: [],
    assignedQuestionnaireIds: [],
    questionnaireRuns: [
      {
        questionnaireId: "catalog-privacy-lgpd",
        status: "Vencido",
        progress: 42,
        sentAt: "2026-03-20T12:00:00.000Z",
        dueAt: "2026-03-27T12:00:00.000Z",
        lastUpdatedAt: "2026-04-01T12:00:00.000Z",
      },
    ],
    createdAt: "2026-04-08T11:15:00.000Z",
  },
  {
    slug: "nexus-fintech",
    legalName: "Nexus Fintech B.V.",
    displayName: "Nexus Fintech",
    domain: "nexus.pay",
    website: "https://nexus.pay",
    supplierType: "Pagamentos",
    segment: "Payments",
    subsegment: "Gateway e antifraude",
    headquartersCity: "Lisboa",
    headquartersCountry: "Portugal",
    taxId: "PT-508194221",
    primaryContactName: "André Costa",
    primaryContactRole: "Partnership Manager",
    primaryContactEmail: "andre@nexus.pay",
    securityContactEmail: "security@nexus.pay",
    privacyContactEmail: "privacy@nexus.pay",
    businessOwner: "Renata Queiroz",
    criticality: "Alta",
    integrationType: "API transacional",
    dataClassification: "Dados financeiros e PII sensível",
    accessScope: "Tokenização e autorização",
    hostingModel: "Cloud regulada",
    activeRegions: "Portugal, Espanha e Brasil",
    servicesProvided: "Autorização de pagamentos e monitoramento antifraude.",
    countriesOfOperation: "Portugal, Espanha, Brasil",
    certifications: ["PCI-DSS", "ISO 27001"],
    accessUsers: [
      { email: "andre@nexus.pay", invitationStatus: "enviado", invitationSentAt: "2026-04-12T16:00:00.000Z" },
    ],
    notes: "Fornecedor aguardando envio e resposta do questionário atual.",
    risk: "Alto Risco",
    lifecycleStatus: "questionarios-enviados",
    status: "Enviado (Aguardando Resposta)",
    score: undefined,
    previousScore: 0,
    trend: 0,
    evidences: [],
    internalNotes: [],
    assignedQuestionnaireIds: ["catalog-privacy-lgpd"],
    questionnaireRuns: [
      {
        questionnaireId: "catalog-privacy-lgpd",
        status: "Enviado",
        progress: 0,
        sentAt: "2026-04-12T16:00:00.000Z",
        dueAt: "2026-04-19T16:00:00.000Z",
        lastUpdatedAt: "2026-04-12T16:00:00.000Z",
      },
    ],
    createdAt: "2026-04-12T14:20:00.000Z",
  },
];

export const questionnaireCatalog: QuestionnaireOption[] = [
  {
    id: "catalog-security-base",
    name: "Due Diligence - Segurança Base",
    category: "Segurança da Informação",
    version: "v2.1",
    source: "catalogo",
  },
  {
    id: "catalog-privacy-lgpd",
    name: "Avaliação de Privacidade e LGPD",
    category: "Privacidade",
    version: "v1.8",
    source: "catalogo",
  },
  {
    id: "catalog-bcp",
    name: "Continuidade de Negócios e Resiliência",
    category: "Continuidade",
    version: "v1.3",
    source: "catalogo",
  },
];

export function getLifecycleStatusLabel(status: SupplierLifecycleStatus) {
  if (status === "pendente-envio") return "Pendente de Envio";
  if (status === "questionarios-enviados") return "Enviado (Aguardando Resposta)";
  if (status === "em-preenchimento") return "Em Preenchimento";
  if (status === "em-avaliacao") return "Em Revisão";
  if (status === "concluido") return "Finalizado";
  return "Vencido";
}

export function getLifecycleStatusDescription(status: SupplierLifecycleStatus) {
  if (status === "pendente-envio") return "Cadastro concluído e aguardando definição de questionários.";
  if (status === "questionarios-enviados") return "Questionários compartilhados com o fornecedor.";
  if (status === "em-preenchimento") return "Fornecedor respondendo o questionário e anexando evidências.";
  if (status === "em-avaliacao") return "Time interno revisando respostas e evidências recebidas.";
  if (status === "concluido") return "Fluxo encerrado com avaliação consolidada.";
  return "Prazo expirado ou pendência crítica em aberto.";
}

function getInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}

export function slugifySupplierName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getRiskClass(risk: SupplierRisk) {
  if (risk === "Baixo Risco") {
    return "bg-primary/10 text-primary border-primary/20";
  }

  if (risk === "Médio Risco") {
    return "bg-tertiary/10 text-tertiary border-tertiary/20";
  }

  if (risk === "Risco Crítico") {
    return "bg-error/10 text-error border-error/20";
  }

  return "border-orange-500/20 bg-orange-500/10 text-orange-400";
}

export function getStatusDot(status: string) {
  if (status.includes("Finalizado")) return "bg-primary";
  if (status.includes("Revisão")) return "bg-tertiary";
  if (status.includes("Vencido")) return "bg-error";
  return "bg-orange-400";
}

export function getLifecycleStatusDot(status: SupplierLifecycleStatus) {
  if (status === "concluido") return "bg-primary";
  if (status === "em-avaliacao") return "bg-tertiary";
  if (status === "vencido") return "bg-error";
  if (status === "em-preenchimento") return "bg-amber-500";
  if (status === "questionarios-enviados") return "bg-orange-400";
  return "bg-slate-400";
}

export function getScoreColor(score?: number) {
  if (typeof score !== "number") return "bg-slate-400";
  if (score >= 85) return "bg-emerald-500";
  if (score >= 65) return "bg-tertiary";
  if (score >= 45) return "bg-amber-500";
  return "bg-error";
}

export function getInitialColor(risk: SupplierRisk) {
  if (risk === "Baixo Risco") return "text-primary";
  if (risk === "Médio Risco") return "text-tertiary";
  if (risk === "Risco Crítico") return "text-error";
  return "text-on-primary-fixed-variant";
}

export function toSupplierRow(profile: SupplierProfile): SupplierRow {
  const lifecycleLabel = getLifecycleStatusLabel(profile.lifecycleStatus);

  return {
    slug: profile.slug,
    name: profile.displayName,
    domain: profile.domain,
    risk: profile.risk,
    riskClass: getRiskClass(profile.risk),
    status: lifecycleLabel,
    statusDot: getLifecycleStatusDot(profile.lifecycleStatus),
    score: profile.score,
    scoreColor: getScoreColor(profile.score),
    initial: getInitial(profile.displayName),
    initialColor: getInitialColor(profile.risk),
  };
}

function readStoredSuppliersUnsafe() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(SUPPLIER_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return (normalizeSupplierInput(JSON.parse(raw) as Partial<SupplierProfile>[]) as Partial<SupplierProfile>[]).map(normalizeSupplierProfile);
  } catch {
    return [];
  }
}

function inferLifecycleStatus(status?: string, assignedQuestionnaireIds?: string[]): SupplierLifecycleStatus {
  if (!status) {
    return assignedQuestionnaireIds && assignedQuestionnaireIds.length > 0
      ? "questionarios-enviados"
      : "pendente-envio";
  }

  if (status.includes("Finalizado")) return "concluido";
  if (status.includes("Revisão")) return "em-avaliacao";
  if (status.includes("Vencido")) return "vencido";
  if (status.includes("Preench")) return "em-preenchimento";
  if (status.includes("Enviado") || status.includes("Resposta")) return "questionarios-enviados";
  if (status.includes("Cadastro") || status.includes("Pendente")) return "pendente-envio";

  return assignedQuestionnaireIds && assignedQuestionnaireIds.length > 0
    ? "questionarios-enviados"
    : "pendente-envio";
}

function buildRunsFromAssignments(
  lifecycleStatus: SupplierLifecycleStatus,
  assignedQuestionnaireIds: string[],
): SupplierQuestionnaireRun[] {
  if (assignedQuestionnaireIds.length === 0) {
    return [];
  }

  return assignedQuestionnaireIds.map((questionnaireId) => ({
    questionnaireId,
    status:
      lifecycleStatus === "concluido"
        ? "Concluído"
        : lifecycleStatus === "em-avaliacao"
          ? "Em avaliação"
          : lifecycleStatus === "em-preenchimento"
            ? "Em preenchimento"
            : lifecycleStatus === "vencido"
              ? "Vencido"
              : "Enviado",
    progress:
      lifecycleStatus === "concluido"
        ? 100
        : lifecycleStatus === "em-avaliacao"
          ? 75
          : lifecycleStatus === "em-preenchimento"
            ? 50
            : lifecycleStatus === "vencido"
              ? 35
              : 0,
  }));
}

function normalizeAccessUsers(
  accessUsers: Partial<SupplierAccessUser>[] | string[] | undefined,
  primaryContactEmail: string | undefined,
): SupplierAccessUser[] {
  if (Array.isArray(accessUsers) && accessUsers.length > 0) {
    return accessUsers
      .map((item) => {
        if (typeof item === "string") {
          return {
            email: item,
            invitationStatus: "pendente" as const,
          };
        }

        if (item && typeof item === "object" && typeof item.email === "string") {
          return {
            email: item.email,
            invitationStatus: item.invitationStatus === "enviado" ? "enviado" : "pendente",
            invitationSentAt: typeof item.invitationSentAt === "string" ? item.invitationSentAt : undefined,
          };
        }

        return null;
      })
      .filter((item): item is SupplierAccessUser => item !== null);
  }

  return primaryContactEmail
    ? [
        {
          email: primaryContactEmail,
          invitationStatus: "pendente",
        },
      ]
    : [];
}

function normalizeSupplierProfile(profile: Partial<SupplierProfile>): SupplierProfile {
  const assignedQuestionnaireIds = profile.assignedQuestionnaireIds ?? [];
  const lifecycleStatus = profile.lifecycleStatus ?? inferLifecycleStatus(profile.status, assignedQuestionnaireIds);
  const questionnaireRuns =
    profile.questionnaireRuns && profile.questionnaireRuns.length > 0
      ? profile.questionnaireRuns
      : buildRunsFromAssignments(lifecycleStatus, assignedQuestionnaireIds);

  return {
    slug: profile.slug ?? "",
    legalName: profile.legalName ?? "",
    displayName: profile.displayName ?? profile.legalName ?? "",
    domain: profile.domain ?? "",
    website: profile.website ?? "",
    supplierType: profile.supplierType ?? "SaaS / Plataforma",
    segment: profile.segment ?? "Fornecedor sem segmentação",
    subsegment: profile.subsegment ?? "Não informado",
    headquartersCity: profile.headquartersCity ?? "",
    headquartersCountry: profile.headquartersCountry ?? "Brasil",
    taxId: profile.taxId ?? "",
    primaryContactName: profile.primaryContactName ?? "",
    primaryContactRole: profile.primaryContactRole ?? "",
    primaryContactEmail: profile.primaryContactEmail ?? "",
    securityContactEmail: profile.securityContactEmail ?? "",
    privacyContactEmail: profile.privacyContactEmail ?? "",
    businessOwner: profile.businessOwner ?? "",
    criticality: profile.criticality ?? "Média",
    integrationType: profile.integrationType ?? "API",
    dataClassification: profile.dataClassification ?? "Dados corporativos e PII",
    accessScope: profile.accessScope ?? "Acesso somente leitura",
    hostingModel: profile.hostingModel ?? "SaaS multi-tenant",
    activeRegions: profile.activeRegions ?? "",
    servicesProvided: profile.servicesProvided ?? "",
    countriesOfOperation: profile.countriesOfOperation ?? "",
    certifications: profile.certifications ?? [],
    accessUsers: normalizeAccessUsers(profile.accessUsers, profile.primaryContactEmail),
    notes: profile.notes ?? "",
    risk: profile.risk ?? "Médio Risco",
    lifecycleStatus,
    status: profile.status ?? getLifecycleStatusLabel(lifecycleStatus),
    score: profile.score,
    previousScore: profile.previousScore,
    trend: profile.trend,
    evidences: profile.evidences ?? [],
    internalNotes: profile.internalNotes ?? [],
    assignedQuestionnaireIds,
    questionnaireRuns,
    createdAt: profile.createdAt ?? new Date().toISOString(),
  };
}

export function getStoredSuppliers() {
  return readStoredSuppliersUnsafe();
}

export function getAllSuppliersClient() {
  const stored = readStoredSuppliersUnsafe();
  const merged = new Map<string, SupplierProfile>();

  [...defaultSuppliers, ...stored].forEach((supplier) => {
    merged.set(supplier.slug, normalizeSupplierProfile(supplier));
  });

  return Array.from(merged.values());
}

export function getSupplierBySlugClient(slug: string) {
  return getAllSuppliersClient().find((supplier) => supplier.slug === slug);
}

export function saveSuppliers(suppliers: SupplierProfile[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SUPPLIER_STORAGE_KEY, JSON.stringify(suppliers));
}

export function upsertSupplier(profile: SupplierProfile) {
  const current = readStoredSuppliersUnsafe().filter((supplier) => supplier.slug !== profile.slug);
  current.push(normalizeSupplierProfile(profile));
  saveSuppliers(current);
}

export function updateSupplierAssignments(slug: string, questionnaireIds: string[]) {
  const allSuppliers = getAllSuppliersClient();
  const target = allSuppliers.find((supplier) => supplier.slug === slug);

  if (!target) {
    return;
  }

  const stored = readStoredSuppliersUnsafe().filter((supplier) => supplier.slug !== slug);
  stored.push({
    ...target,
    assignedQuestionnaireIds: questionnaireIds,
  });
  saveSuppliers(stored);
}

export function sendSupplierQuestionnaires(slug: string, questionnaireIds: string[]) {
  const allSuppliers = getAllSuppliersClient();
  const target = allSuppliers.find((supplier) => supplier.slug === slug);

  if (!target) {
    return;
  }

  const now = new Date().toISOString();
  const runs = questionnaireIds.map((questionnaireId) => ({
    questionnaireId,
    status: "Enviado" as QuestionnaireRunStatus,
    progress: 0,
    sentAt: now,
    lastUpdatedAt: now,
  }));

  const stored = readStoredSuppliersUnsafe().filter((supplier) => supplier.slug !== slug);
  stored.push({
    ...target,
    lifecycleStatus: "questionarios-enviados",
    status: getLifecycleStatusLabel("questionarios-enviados"),
    assignedQuestionnaireIds: questionnaireIds,
    questionnaireRuns: runs,
  });
  saveSuppliers(stored);
}

export function updateSupplierQuestionnaireRunStatus(
  slug: string,
  questionnaireId: string,
  status: QuestionnaireRunStatus,
) {
  const allSuppliers = getAllSuppliersClient();
  const target = allSuppliers.find((supplier) => supplier.slug === slug);

  if (!target) {
    return null;
  }

  const now = new Date().toISOString();
  const updatedSupplier: SupplierProfile = {
    ...target,
    lifecycleStatus:
      status === "Concluído"
        ? "concluido"
        : status === "Em avaliação"
          ? "em-avaliacao"
          : target.lifecycleStatus,
    status:
      status === "Concluído"
        ? getLifecycleStatusLabel("concluido")
        : status === "Em avaliação"
          ? getLifecycleStatusLabel("em-avaliacao")
          : target.status,
    questionnaireRuns: target.questionnaireRuns.map((run) =>
      run.questionnaireId === questionnaireId
        ? {
            ...run,
            status,
            progress: status === "Concluído" ? 100 : run.progress,
            lastUpdatedAt: now,
          }
        : run,
    ),
  };

  upsertSupplier(updatedSupplier);
  return updatedSupplier;
}

export function markSupplierAccessUserInviteSent(slug: string, email: string) {
  const allSuppliers = getAllSuppliersClient();
  const target = allSuppliers.find((supplier) => supplier.slug === slug);

  if (!target) {
    return null;
  }

  const now = new Date().toISOString();
  const updatedSupplier: SupplierProfile = {
    ...target,
    accessUsers: target.accessUsers.map((user) =>
      user.email === email
        ? {
            ...user,
            invitationStatus: "enviado",
            invitationSentAt: now,
          }
        : user,
    ),
  };

  upsertSupplier(updatedSupplier);
  return updatedSupplier;
}

export function getQuestionnaireRunStatusClass(status: QuestionnaireRunStatus) {
  if (status === "Concluído") return "bg-emerald-100 text-emerald-700";
  if (status === "Em avaliação") return "bg-primary/10 text-primary";
  if (status === "Respondido") return "bg-secondary-container/30 text-on-secondary-container";
  if (status === "Em preenchimento") return "bg-amber-100 text-amber-700";
  if (status === "Vencido") return "bg-error/10 text-error";
  return "bg-surface-container-low text-on-surface-variant";
}

export function getQuestionnaireOptionsClient(): QuestionnaireOption[] {
  const options = [...questionnaireCatalog];

  if (typeof window === "undefined") {
    return options;
  }

  const raw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);

  if (!raw) {
    return options;
  }

  try {
    const parsed = JSON.parse(raw) as SavedTemplate;

    if (!parsed?.config?.name) {
      return options;
    }

    options.unshift({
      id: `template-${slugifySupplierName(parsed.config.name)}-${parsed.config.version}`,
      name: parsed.config.name,
      category: parsed.config.category,
      version: parsed.config.version,
      source: "template",
    });
  } catch {
    return options;
  }

  return options;
}
