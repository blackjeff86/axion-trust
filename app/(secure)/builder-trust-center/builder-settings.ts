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
  sections: BuilderSection[];
  certifications: BuilderCertification[];
  documents: BuilderDocument[];
  securityContactEmail: string;
  responseSla: string;
  faqItems: string[];
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
    "Lider global em solucoes de ciberseguranca e curadoria de dados para empresas de alto crescimento. Comprometidos com a transparencia radical e privacidade por design.",
  logoMode: "icon",
  sections: [
    { id: "overview", title: "Visao geral", description: "Hero, resumo executivo e CTA de contato.", enabled: true },
    { id: "certifications", title: "Certificacoes", description: "Selos, evidencias e validacoes externas.", enabled: true },
    { id: "documents", title: "Documentos", description: "Categorias e documentos publicos/privados do Trust.", enabled: true },
    { id: "faq", title: "FAQ", description: "Perguntas frequentes que aparecem na pagina publica.", enabled: true },
    { id: "security-contact", title: "Contato de seguranca", description: "Canal publico para reporte e follow-up.", enabled: true },
  ],
  certifications: [
    { id: "iso-27001", label: "ISO 27001", icon: "security", iconClass: "text-blue-400 bg-blue-500/10", checked: true },
    { id: "soc2", label: "SOC 2 Type II", icon: "analytics", iconClass: "text-primary bg-primary/10", checked: true },
    { id: "lgpd", label: "LGPD / GDPR", icon: "gavel", iconClass: "text-tertiary bg-tertiary/10", checked: false },
  ],
  documents: [
    { id: "privacy-policy", title: "Politica de Privacidade", updatedAt: "Atualizado em 12 Out, 2023", icon: "article", category: "Privacidade", isPublic: true },
    { id: "incident-response", title: "Plano de Resposta a Incidentes", updatedAt: "Atualizado em 05 Jan, 2024", icon: "shield", category: "Politicas", isPublic: false },
    { id: "pentest-report", title: "Relatorio de Penetration Test", updatedAt: "Atualizado em 15 Dez, 2023", icon: "lock_open", category: "Compliance", isPublic: false },
    { id: "cloud-architecture", title: "Arquitetura de Nuvem", updatedAt: "Atualizado em 20 Fev, 2024", icon: "dns", category: "Infraestrutura", isPublic: true },
  ],
  securityContactEmail: "security@axiondigital.com",
  responseSla: "Menos de 24 horas",
  faqItems: [
    "Como os dados sao criptografados?",
    "Voces possuem certificacao PCI-DSS?",
    "Onde os servidores estao localizados?",
  ],
};

export const DEFAULT_BUILDER_PUBLICATION_META: BuilderPublicationMeta = {
  draftSavedAt: null,
  publishedAt: null,
};

export function loadBuilderSettings(): BuilderSettings {
  if (typeof window === "undefined") {
    return DEFAULT_BUILDER_SETTINGS;
  }

  const savedValue = window.localStorage.getItem(BUILDER_SETTINGS_STORAGE_KEY);

  if (!savedValue) {
    return DEFAULT_BUILDER_SETTINGS;
  }

  try {
    const parsed = JSON.parse(savedValue) as Partial<BuilderSettings>;
    return {
      ...DEFAULT_BUILDER_SETTINGS,
      ...parsed,
      sections: parsed.sections ?? DEFAULT_BUILDER_SETTINGS.sections,
      certifications: parsed.certifications ?? DEFAULT_BUILDER_SETTINGS.certifications,
      documents: parsed.documents ?? DEFAULT_BUILDER_SETTINGS.documents,
      faqItems: parsed.faqItems ?? DEFAULT_BUILDER_SETTINGS.faqItems,
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
