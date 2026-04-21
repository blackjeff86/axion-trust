export type TrustDocumentCategory =
  | "Compliance"
  | "Relatórios de Segurança"
  | "Políticas"
  | "Privacidade"
  | "Financeiro";

export type TrustDocumentVisibility = "Público" | "Privado";

export type TrustDocumentStatus = "Publicado" | "Pendente de aprovação" | "Rascunho";

export type AccessRequestStatus = "Pendente" | "Aprovado" | "Negado";

export type DocumentPublishingMode = "direct_publish" | "approval_required";

export type TrustDocument = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: TrustDocumentCategory;
  visibility: TrustDocumentVisibility;
  status: TrustDocumentStatus;
  version: string;
  owner: string;
  updatedAtLabel: string;
  publishedAtLabel?: string;
  sizeLabel: string;
  downloads: number;
  icon: string;
  iconClass: string;
  requiresApproval: boolean;
  approvalRule: string;
  visibleInTrustCenter: boolean;
  ndaRequired: boolean;
  tags: string[];
};

export type TrustAccessRequest = {
  id: string;
  documentId: string;
  requester: string;
  company: string;
  email: string;
  requestedAtLabel: string;
  reason: string;
  status: AccessRequestStatus;
};

export type TrustDownloadEvent = {
  id: string;
  documentId: string;
  actor: string;
  company: string;
  actionLabel: string;
  timeLabel: string;
  tone: "emerald" | "blue";
};

export type DataRoomWorkspace = {
  title: string;
  subtitle: string;
  note: string;
  publishingMode: DocumentPublishingMode;
  categories: TrustDocumentCategory[];
  documents: TrustDocument[];
  requests: TrustAccessRequest[];
  downloadEvents: TrustDownloadEvent[];
};

export const DATA_ROOM_STORAGE_KEY = "axion-trust-data-room";

const workspace: DataRoomWorkspace = {
  title: "Data Room Seguro",
  subtitle:
    "Gerencie os documentos que ficam disponíveis no Trust Center, organize por categoria e defina se cada item é público, privado ou acessível por solicitação.",
  note:
    "A referência de produto aqui é o Trust Center: publicar documentos certos, nas categorias certas, com política clara de acesso e aprovação.",
  publishingMode: "approval_required",
  categories: ["Compliance", "Relatórios de Segurança", "Políticas", "Privacidade", "Financeiro"],
  documents: [
    {
      id: "doc-soc2",
      slug: "soc2-report",
      name: "SOC_2_Type_II_Report.pdf",
      description: "Relatório SOC 2 atualizado para compartilhamento com clientes em fase avançada.",
      category: "Compliance",
      visibility: "Privado",
      status: "Publicado",
      version: "v2026.1",
      owner: "Ana Lucia",
      updatedAtLabel: "Hoje, 09:12",
      publishedAtLabel: "Publicado em 18/04/2026",
      sizeLabel: "4.2 MB",
      downloads: 18,
      icon: "verified",
      iconClass: "text-primary",
      requiresApproval: true,
      approvalRule: "Exigir aprovação do time de GRC e NDA assinado.",
      visibleInTrustCenter: true,
      ndaRequired: true,
      tags: ["SOC 2", "Auditoria", "Trust Center"],
    },
    {
      id: "doc-pen",
      slug: "pentest-summary",
      name: "Resumo_Pentest_Externos.pdf",
      description: "Resumo executivo do último pentest externo, sem detalhes sensíveis de exploração.",
      category: "Relatórios de Segurança",
      visibility: "Privado",
      status: "Publicado",
      version: "v3",
      owner: "Blue Team",
      updatedAtLabel: "Ontem, 16:40",
      publishedAtLabel: "Publicado em 17/04/2026",
      sizeLabel: "2.7 MB",
      downloads: 6,
      icon: "shield_locked",
      iconClass: "text-error",
      requiresApproval: true,
      approvalRule: "Liberar somente para oportunidades qualificadas e mediante NDA.",
      visibleInTrustCenter: false,
      ndaRequired: true,
      tags: ["Pentest", "Segurança"],
    },
    {
      id: "doc-policy",
      slug: "security-policy",
      name: "Politica_de_Seguranca_da_Informacao.pdf",
      description: "Política corporativa de segurança publicada para consulta recorrente de clientes.",
      category: "Políticas",
      visibility: "Público",
      status: "Publicado",
      version: "v5.2",
      owner: "DPO Office",
      updatedAtLabel: "16/04/2026",
      publishedAtLabel: "Publicado em 16/04/2026",
      sizeLabel: "980 KB",
      downloads: 124,
      icon: "policy",
      iconClass: "text-secondary",
      requiresApproval: false,
      approvalRule: "Documento público, sem aprovação prévia.",
      visibleInTrustCenter: true,
      ndaRequired: false,
      tags: ["Política", "Segurança"],
    },
    {
      id: "doc-dpa",
      slug: "data-processing-addendum",
      name: "Data_Processing_Addendum.pdf",
      description: "Anexo de tratamento de dados para clientes que precisam validar termos de privacidade.",
      category: "Privacidade",
      visibility: "Privado",
      status: "Publicado",
      version: "v4.1",
      owner: "Time de Privacidade",
      updatedAtLabel: "15/04/2026",
      publishedAtLabel: "Publicado em 15/04/2026",
      sizeLabel: "1.1 MB",
      downloads: 32,
      icon: "privacy_tip",
      iconClass: "text-secondary",
      requiresApproval: true,
      approvalRule: "Aprovar para clientes ativos e prospects com deal owner definido.",
      visibleInTrustCenter: true,
      ndaRequired: false,
      tags: ["LGPD", "DPA", "Privacidade"],
    },
    {
      id: "doc-fin",
      slug: "financial-overview",
      name: "Financial_Overview_2025.pdf",
      description: "Visao financeira consolidada reservada para processos especificos de auditoria comercial.",
      category: "Financeiro",
      visibility: "Privado",
      status: "Pendente de aprovação",
      version: "v1.0",
      owner: "Controladoria",
      updatedAtLabel: "Hoje, 10:04",
      sizeLabel: "3.4 MB",
      downloads: 0,
      icon: "monitoring",
      iconClass: "text-amber-500",
      requiresApproval: true,
      approvalRule: "Publicar apenas após aprovação do CFO e do time jurídico.",
      visibleInTrustCenter: false,
      ndaRequired: true,
      tags: ["Financeiro", "Restrito"],
    },
    {
      id: "doc-subprocessors",
      slug: "subprocessors-list",
      name: "Lista_de_Subprocessadores.pdf",
      description: "Lista atualizada de subprocessadores para publicação aberta no Trust Center.",
      category: "Privacidade",
      visibility: "Público",
      status: "Rascunho",
      version: "v2.0",
      owner: "Time de Privacidade",
      updatedAtLabel: "Hoje, 08:21",
      sizeLabel: "620 KB",
      downloads: 0,
      icon: "description",
      iconClass: "text-primary-container",
      requiresApproval: false,
      approvalRule: "Publicação aberta após revisão editorial final.",
      visibleInTrustCenter: false,
      ndaRequired: false,
      tags: ["Subprocessadores", "LGPD"],
    },
  ],
  requests: [
    {
      id: "req-1",
      documentId: "doc-soc2",
      requester: "Mariana Costa",
      company: "Banco Global",
      email: "mariana@bancoglobal.com",
      requestedAtLabel: "Há 25 min",
      reason: "Validação de controles antes da renovação contratual.",
      status: "Pendente",
    },
    {
      id: "req-2",
      documentId: "doc-dpa",
      requester: "Igor Mota",
      company: "Retail Wave",
      email: "igor@retailwave.com",
      requestedAtLabel: "Hoje, 08:35",
      reason: "Checklist de privacidade para assinatura do MSA.",
      status: "Aprovado",
    },
    {
      id: "req-3",
      documentId: "doc-pen",
      requester: "Julia Freitas",
      company: "North Metrics",
      email: "julia@northmetrics.com",
      requestedAtLabel: "Ontem, 17:22",
      reason: "Due diligence de segurança para onboarding enterprise.",
      status: "Negado",
    },
  ],
  downloadEvents: [
    {
      id: "evt-1",
      documentId: "doc-policy",
      actor: "Carlos Vieira",
      company: "Prospectly",
      actionLabel: "Download público",
      timeLabel: "Hoje, 09:42",
      tone: "emerald",
    },
    {
      id: "evt-2",
      documentId: "doc-soc2",
      actor: "Amanda Reis",
      company: "Banco Global",
      actionLabel: "Download após aprovação",
      timeLabel: "18/04/2026, 14:10",
      tone: "blue",
    },
    {
      id: "evt-3",
      documentId: "doc-dpa",
      actor: "Rafael Lima",
      company: "Retail Wave",
      actionLabel: "Download privado",
      timeLabel: "Ontem, 11:55",
      tone: "blue",
    },
    {
      id: "evt-4",
      documentId: "doc-soc2",
      actor: "Marcos Lima",
      company: "Atlas Capital",
      actionLabel: "Download após aprovação",
      timeLabel: "17/04/2026, 16:22",
      tone: "blue",
    },
    {
      id: "evt-5",
      documentId: "doc-soc2",
      actor: "Fernanda Souza",
      company: "Banco Global",
      actionLabel: "Download após aprovação",
      timeLabel: "16/04/2026, 09:18",
      tone: "emerald",
    },
    {
      id: "evt-6",
      documentId: "doc-soc2",
      actor: "Ricardo Nunes",
      company: "Pine Ventures",
      actionLabel: "Download após aprovação",
      timeLabel: "15/04/2026, 18:47",
      tone: "blue",
    },
  ],
};

function normalizeDataRoomCopy(value: string) {
  return value
    .replaceAll("Publico", "Público")
    .replaceAll("publico", "público")
    .replaceAll("Politicas", "Políticas")
    .replaceAll("Politica", "Política")
    .replaceAll("Seguranca", "Segurança")
    .replaceAll("Informacao", "Informação")
    .replaceAll("Pendente de aprovacao", "Pendente de aprovação")
    .replaceAll("aprovacao", "aprovação")
    .replaceAll("Nao", "Não")
    .replaceAll("Obrigatorio", "Obrigatório")
    .replaceAll("Relatorios", "Relatórios")
    .replaceAll("Descricao", "Descrição")
    .replaceAll("Visivel", "Visível");
}

function normalizeDataRoomInput<T>(value: T): T {
  if (typeof value === "string") {
    return normalizeDataRoomCopy(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDataRoomInput(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeDataRoomInput(nestedValue)]),
    ) as T;
  }

  return value;
}

export function getDataRoomWorkspace() {
  return workspace;
}

export function getDataRoomWorkspaceClient() {
  if (typeof window === "undefined") {
    return workspace;
  }

  const raw = window.localStorage.getItem(DATA_ROOM_STORAGE_KEY);

  if (!raw) {
    return workspace;
  }

  try {
    return normalizeDataRoomInput(JSON.parse(raw) as DataRoomWorkspace);
  } catch {
    return workspace;
  }
}

export function saveDataRoomWorkspaceClient(nextWorkspace: DataRoomWorkspace) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DATA_ROOM_STORAGE_KEY, JSON.stringify(nextWorkspace));
}

export function updateTrustDocumentStatusClient(documentId: string, status: TrustDocumentStatus) {
  const current = getDataRoomWorkspaceClient();

  const nextWorkspace: DataRoomWorkspace = {
    ...current,
    documents: current.documents.map((document) =>
        document.id === documentId
        ? {
            ...document,
            status,
            visibleInTrustCenter: status === "Publicado",
            publishedAtLabel:
              status === "Publicado"
                ? `Publicado em ${new Date().toLocaleDateString("pt-BR")}`
                : document.publishedAtLabel,
          }
        : document,
    ),
  };

  saveDataRoomWorkspaceClient(nextWorkspace);

  return nextWorkspace;
}

export function updateTrustDocumentPublicationClient(documentId: string, published: boolean) {
  return updateTrustDocumentStatusClient(documentId, published ? "Publicado" : "Rascunho");
}

export function getTrustDocumentById(id?: string | null) {
  if (!id) return null;
  return workspace.documents.find((document) => document.id === id) ?? null;
}

export function getFilteredTrustDocuments(filters?: {
  category?: string;
  visibility?: string;
  status?: string;
}) {
  return workspace.documents.filter((document) => {
    if (filters?.category && filters.category !== "Todos" && document.category !== filters.category) {
      return false;
    }

    if (filters?.visibility && filters.visibility !== "Todos" && document.visibility !== filters.visibility) {
      return false;
    }

    if (filters?.status && filters.status !== "Todos" && document.status !== filters.status) {
      return false;
    }

    return true;
  });
}

export function getAccessRequestsForDocument(documentId?: string | null) {
  if (!documentId) return workspace.requests;
  return workspace.requests.filter((request) => request.documentId === documentId);
}

export function getDownloadEventsForDocument(documentId?: string | null) {
  if (!documentId) return workspace.downloadEvents;
  return workspace.downloadEvents.filter((event) => event.documentId === documentId);
}

export function getVisibilityBadgeClass(value: TrustDocumentVisibility) {
  if (value === "Público") return "bg-emerald-100 text-emerald-700";
  return "bg-blue-100 text-blue-700";
}

export function getStatusBadgeClass(value: TrustDocumentStatus | AccessRequestStatus) {
  if (value === "Publicado" || value === "Aprovado") return "bg-emerald-100 text-emerald-700";
  if (value === "Pendente de aprovação" || value === "Pendente") return "bg-amber-100 text-amber-700";
  if (value === "Rascunho") return "bg-slate-100 text-slate-700";
  return "bg-rose-100 text-rose-700";
}

export function getToneClass(tone: TrustDownloadEvent["tone"]) {
  if (tone === "emerald") return "bg-emerald-100 text-emerald-700";
  return "bg-blue-100 text-blue-700";
}
