"use client";

export type BuilderSectionId =
  | "overview"
  | "certifications"
  | "documents"
  | "faq"
  | "security-contact";

export type BuilderSection = {
  id: BuilderSectionId;
  title: string;
  description: string;
  enabled: boolean;
};

export type BuilderCertification = {
  id: string;
  label: string;
  icon: string;
  iconClass: string;
  checked: boolean;
};

export type BuilderHeroSignal = {
  id: string;
  label: string;
  value: string;
  note: string;
};

export type BuilderFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type BuilderDocument = {
  id: string;
  title: string;
  updatedAt: string;
  icon: string;
  category: string;
  isPublic: boolean;
};

export type BuilderSettings = {
  displayName: string;
  publicDescription: string;
  logoMode: "icon" | "wordmark";
  heroBadge: string;
  heroUpdatedLabel: string;
  heroTitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  heroSignals: BuilderHeroSignal[];
  sections: BuilderSection[];
  certifications: BuilderCertification[];
  documents: BuilderDocument[];
  securityContactEmail: string;
  responseSla: string;
  faqItems: BuilderFaqItem[];
};

export type BuilderPublicationMeta = {
  draftSavedAt: string | null;
  publishedAt: string | null;
};

export const BUILDER_SETTINGS_STORAGE_KEY = "axion-trust-builder-settings";
export const BUILDER_PUBLICATION_STORAGE_KEY = "axion-trust-builder-publication";

export const DEFAULT_BUILDER_SETTINGS: BuilderSettings = {
  displayName: "AXION Digital Solutions",
  publicDescription:
    "Líder global em soluções de cibersegurança e curadoria de dados para empresas de alto crescimento. Comprometidos com a transparência radical e privacidade por design.",
  logoMode: "icon",
  heroBadge: "Segurança e transparência",
  heroUpdatedLabel: "Atualizado em Abril/2026",
  heroTitle: "A página pública onde seus clientes validam a maturidade do seu programa de segurança.",
  primaryCtaLabel: "Ver documentos públicos",
  secondaryCtaLabel: "Solicitar acesso privado",
  heroSignals: [
    { id: "uptime", label: "Uptime do serviço", value: "99,98%", note: "Últimos 12 meses" },
    { id: "sla", label: "SLA para incidentes", value: "< 24h", note: "Resposta inicial do time" },
    { id: "certs", label: "Certificações ativas", value: "3", note: "Selos públicos exibidos" },
  ],
  sections: [
    { id: "overview", title: "Visão geral", description: "Hero, resumo executivo e CTA de contato.", enabled: true },
    { id: "certifications", title: "Certificações", description: "Selos, evidências e validações externas.", enabled: true },
    { id: "documents", title: "Documentos", description: "Categorias e documentos públicos/privados do Trust.", enabled: true },
    { id: "faq", title: "FAQ", description: "Perguntas frequentes que aparecem na página pública.", enabled: true },
    { id: "security-contact", title: "Contato de segurança", description: "Canal público para reporte e follow-up.", enabled: true },
  ],
  certifications: [
    { id: "iso-27001", label: "ISO 27001", icon: "security", iconClass: "text-blue-400 bg-blue-500/10", checked: true },
    { id: "soc2", label: "SOC 2 Type II", icon: "analytics", iconClass: "text-primary bg-primary/10", checked: true },
    { id: "lgpd", label: "LGPD / GDPR", icon: "gavel", iconClass: "text-tertiary bg-tertiary/10", checked: false },
  ],
  documents: [
    { id: "privacy-policy", title: "Política de Privacidade", updatedAt: "Atualizado em 12 Out, 2023", icon: "article", category: "Privacidade", isPublic: true },
    { id: "incident-response", title: "Plano de Resposta a Incidentes", updatedAt: "Atualizado em 05 Jan, 2024", icon: "shield", category: "Políticas", isPublic: false },
    { id: "pentest-report", title: "Relatório de Penetration Test", updatedAt: "Atualizado em 15 Dez, 2023", icon: "lock_open", category: "Compliance", isPublic: false },
    { id: "cloud-architecture", title: "Arquitetura de Nuvem", updatedAt: "Atualizado em 20 Fev, 2024", icon: "dns", category: "Infraestrutura", isPublic: true },
  ],
  securityContactEmail: "security@axiondigital.com",
  responseSla: "Menos de 24 horas",
  faqItems: [
    {
      id: "faq-1",
      question: "Como os dados são criptografados?",
      answer: "Os dados são protegidos com criptografia em trânsito e em repouso, seguindo boas práticas de mercado e controles monitorados continuamente pelo nosso time de segurança.",
    },
    {
      id: "faq-2",
      question: "Quais certificações e evidências estão disponíveis para consulta?",
      answer: "Mantemos neste portal os principais documentos públicos, certificações ativas e evidências de compliance. Materiais restritos podem ser solicitados conforme o fluxo de aprovação.",
    },
    {
      id: "faq-3",
      question: "Onde os servidores estão localizados?",
      answer: "A infraestrutura é operada em regiões homologadas, com critérios de disponibilidade, resiliência e aderência aos requisitos contratuais e de privacidade aplicáveis.",
    },
    {
      id: "faq-4",
      question: "Como funciona a solicitação de documentos privados?",
      answer: "Quando um material exige acesso restrito, o visitante pode enviar uma solicitação diretamente pelo portal. O pedido passa por validação interna antes da liberação.",
    },
  ],
};

export const DEFAULT_BUILDER_PUBLICATION_META: BuilderPublicationMeta = {
  draftSavedAt: null,
  publishedAt: null,
};

function normalizeBuilderCopy(value: string) {
  return value
    .replaceAll("Exibicao", "Exibição")
    .replaceAll("Nome de Exibicao", "Nome de Exibição")
    .replaceAll("Icone", "Ícone")
    .replaceAll("presenca", "presença")
    .replaceAll("pagina publica", "página pública")
    .replaceAll("pagina", "página")
    .replaceAll("publico", "público")
    .replaceAll("publicos", "públicos")
    .replaceAll("seguranca", "segurança")
    .replaceAll("confianca", "confiança")
    .replaceAll("certificacoes", "certificações")
    .replaceAll("evidencias", "evidências")
    .replaceAll("validacoes", "validações")
    .replaceAll("servico", "serviço")
    .replaceAll("Ultimos", "Últimos")
    .replaceAll("Ultimo", "Último")
    .replaceAll("Ultima", "Última")
    .replaceAll("Titulo", "Título")
    .replaceAll("primario", "primário")
    .replaceAll("secundario", "secundário")
    .replaceAll("sera", "será")
    .replaceAll("rapida", "rápida")
    .replaceAll("ideia aqui e", "ideia aqui é")
    .replaceAll("combinacao", "combinação")
    .replaceAll("legivel", "legível")
    .replaceAll("cabecalho", "cabeçalho")
    .replaceAll("politica", "política")
    .replaceAll("transparencia", "transparência")
    .replaceAll("solucoes", "soluções")
    .replaceAll("secoes", "seções")
    .replaceAll("secao", "seção")
    .replaceAll("botao", "botão")
    .replaceAll("botoes", "botões")
    .replaceAll("visiveis", "visíveis")
    .replaceAll("visivel", "visível")
    .replaceAll("validacao", "validação")
    .replaceAll("solicitacao", "solicitação")
    .replaceAll("solicitacoes", "solicitações")
    .replaceAll("analise", "análise")
    .replaceAll("liberacao", "liberação")
    .replaceAll("responsavel", "responsável")
    .replaceAll("medio", "médio")
    .replaceAll("Visao geral", "Visão geral")
    .replaceAll("Certificacoes", "Certificações")
    .replaceAll("Perguntas frequentes", "Perguntas frequentes")
    .replaceAll("esta sofisticada", "está sofisticada")
    .replaceAll("que sera exibida", "que será exibida")
    .replaceAll("publica", "pública");
}

function normalizeBuilderSettingsInput<T>(value: T): T {
  if (typeof value === "string") {
    return normalizeBuilderCopy(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeBuilderSettingsInput(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeBuilderSettingsInput(nestedValue)]),
    ) as T;
  }

  return value;
}

export function loadBuilderSettings(): BuilderSettings {
  if (typeof window === "undefined") {
    return DEFAULT_BUILDER_SETTINGS;
  }

  const savedValue = window.localStorage.getItem(BUILDER_SETTINGS_STORAGE_KEY);

  if (!savedValue) {
    return DEFAULT_BUILDER_SETTINGS;
  }

  try {
    const parsed = normalizeBuilderSettingsInput(JSON.parse(savedValue) as Partial<BuilderSettings>);
    const normalizedFaqItems = Array.isArray(parsed.faqItems)
      ? parsed.faqItems
          .map((item, index) => {
            if (typeof item === "string") {
              return {
                id: `faq-${index + 1}`,
                question: item,
                answer: "Descreva aqui a resposta pública para esta pergunta frequente.",
              };
            }

            if (
              item &&
              typeof item === "object" &&
              "question" in item &&
              typeof item.question === "string"
            ) {
              return {
                id: typeof item.id === "string" ? item.id : `faq-${index + 1}`,
                question: item.question,
                answer:
                  typeof item.answer === "string" && item.answer.trim().length > 0
                    ? item.answer
                    : "Descreva aqui a resposta pública para esta pergunta frequente.",
              };
            }

            return null;
          })
          .filter((item): item is BuilderFaqItem => item !== null)
      : DEFAULT_BUILDER_SETTINGS.faqItems;

    return {
      ...DEFAULT_BUILDER_SETTINGS,
      ...parsed,
      heroSignals: Array.isArray(parsed.heroSignals) ? parsed.heroSignals : DEFAULT_BUILDER_SETTINGS.heroSignals,
      sections: Array.isArray(parsed.sections) ? parsed.sections : DEFAULT_BUILDER_SETTINGS.sections,
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : DEFAULT_BUILDER_SETTINGS.certifications,
      documents: Array.isArray(parsed.documents) ? parsed.documents : DEFAULT_BUILDER_SETTINGS.documents,
      faqItems: normalizedFaqItems.length > 0 ? normalizedFaqItems : DEFAULT_BUILDER_SETTINGS.faqItems,
    };
  } catch {
    return DEFAULT_BUILDER_SETTINGS;
  }
}

export function saveBuilderSettings(settings: BuilderSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BUILDER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function loadBuilderPublicationMeta(): BuilderPublicationMeta {
  if (typeof window === "undefined") {
    return DEFAULT_BUILDER_PUBLICATION_META;
  }

  const savedValue = window.localStorage.getItem(BUILDER_PUBLICATION_STORAGE_KEY);

  if (!savedValue) {
    return DEFAULT_BUILDER_PUBLICATION_META;
  }

  try {
    const parsed = JSON.parse(savedValue) as Partial<BuilderPublicationMeta>;
    return {
      ...DEFAULT_BUILDER_PUBLICATION_META,
      ...parsed,
    };
  } catch {
    return DEFAULT_BUILDER_PUBLICATION_META;
  }
}

export function saveBuilderPublicationMeta(meta: BuilderPublicationMeta) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BUILDER_PUBLICATION_STORAGE_KEY, JSON.stringify(meta));
}
