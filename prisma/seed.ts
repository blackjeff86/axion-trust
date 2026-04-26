import "dotenv/config";
import { hash } from "bcryptjs";
import {
  AccessRequestStatus,
  DocumentAccessGrantStatus,
  MembershipStatus,
  PrismaClient,
  TrustDownloadAction,
  UserType,
} from "@prisma/client";
import {
  DEFAULT_BUILDER_PUBLICATION_META,
  DEFAULT_BUILDER_SETTINGS,
} from "../app/(secure)/builder-trust-center/builder-settings";
import { DEFAULT_TRUST_THEME } from "../app/(secure)/builder-trust-center/trust-theme";
import { getDataRoomWorkspace } from "../app/(secure)/data-room-seguro/data-room-data";
import {
  defaultSuppliers,
  questionnaireCatalog,
} from "../app/(secure)/due-diligence-terceiros/supplier-data";
import { initialPendingRequests } from "../app/(secure)/gestao-acessos/access-data";
import { integrationDetails } from "../app/(secure)/configuracoes/integration-detail-data";
import {
  initialConfig,
  initialEvidences,
  initialQuestions,
  initialRules,
  initialSections,
} from "../app/(secure)/due-diligence-terceiros/novo-questionario/template-builder-data";

const prisma = new PrismaClient();

const AXION_ORGANIZATION_ID = "org_axion_demo";
const ORBIT_ORGANIZATION_ID = "org_orbit_demo";
const HELIO_ORGANIZATION_ID = "org_helio_demo";

function toJson(value: unknown) {
  return JSON.stringify(value);
}

function parseDate(value: string | null) {
  return value ? new Date(value) : null;
}

function daysAgo(days: number) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value;
}

function hoursAgo(hours: number) {
  const value = new Date();
  value.setHours(value.getHours() - hours);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function mapAccessRequestStatus(status: string): AccessRequestStatus {
  if (status === "Aprovado") return AccessRequestStatus.approved;
  if (status === "Negado") return AccessRequestStatus.denied;
  return AccessRequestStatus.pending;
}

async function main() {
  const workspace = getDataRoomWorkspace();

  const [
    axionOwnerPasswordHash,
    axionAdminPasswordHash,
    axionEditorPasswordHash,
    axionViewerPasswordHash,
    orbitAdminPasswordHash,
    helioOwnerPasswordHash,
    qaMultiTenantPasswordHash,
    guestPasswordHash,
  ] = await Promise.all([
    hash("AxionOwner!2026", 10),
    hash("AxionAdmin!2026", 10),
    hash("AxionEditor!2026", 10),
    hash("AxionViewer!2026", 10),
    hash("OrbitAdmin!2026", 10),
    hash("HelioOwner!2026", 10),
    hash("QaMultiTenant!2026", 10),
    hash("GuestAccess!2026", 10),
  ]);

  await prisma.auditActivity.deleteMany();
  await prisma.trustDownloadEvent.deleteMany();
  await prisma.documentAccessGrant.deleteMany();
  await prisma.accessRequest.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.questionnaireTemplate.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.trustDocument.deleteMany();
  await prisma.dataRoomSettings.deleteMany();
  await prisma.trustCenterHeroSignal.deleteMany();
  await prisma.trustCenterSection.deleteMany();
  await prisma.trustCenterCertification.deleteMany();
  await prisma.trustCenterFaqItem.deleteMany();
  await prisma.trustCenterSettings.deleteMany();
  await prisma.trustCenterTheme.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  await prisma.organization.createMany({
    data: [
      {
        id: AXION_ORGANIZATION_ID,
        name: "AXION Trust",
        displayName: DEFAULT_BUILDER_SETTINGS.displayName,
        domain: "axiontrust.io",
      },
      {
        id: ORBIT_ORGANIZATION_ID,
        name: "Orbit Cloud",
        displayName: "Orbit Cloud Security",
        domain: "orbitcloud.io",
      },
      {
        id: HELIO_ORGANIZATION_ID,
        name: "Helio Bank",
        displayName: "Helio Bank Compliance",
        domain: "heliobank.com.br",
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        id: "usr-axion-owner",
        email: "ana.lucena@axiontrust.io",
        passwordHash: axionOwnerPasswordHash,
        name: "Ana Lucena",
        company: "AXION Trust",
        title: "Chief Security Officer",
        userType: UserType.internal,
      },
      {
        id: "usr-axion-admin",
        email: "ricardo.menezes@axiontrust.io",
        passwordHash: axionAdminPasswordHash,
        name: "Ricardo Menezes",
        company: "AXION Trust",
        title: "Admin / CISO",
        userType: UserType.internal,
      },
      {
        id: "usr-axion-editor",
        email: "joao.silva@axiontrust.io",
        passwordHash: axionEditorPasswordHash,
        name: "Joao Silva",
        company: "AXION Trust",
        title: "Trust Center Editor",
        userType: UserType.internal,
      },
      {
        id: "usr-axion-viewer",
        email: "camila.rocha@axiontrust.io",
        passwordHash: axionViewerPasswordHash,
        name: "Camila Rocha",
        company: "AXION Trust",
        title: "Risk Viewer",
        userType: UserType.internal,
      },
      {
        id: "usr-orbit-admin",
        email: "marina.duarte@orbitcloud.io",
        passwordHash: orbitAdminPasswordHash,
        name: "Marina Duarte",
        company: "Orbit Cloud",
        title: "Security Admin",
        userType: UserType.internal,
      },
      {
        id: "usr-helio-owner",
        email: "bruna.almeida@heliobank.com.br",
        passwordHash: helioOwnerPasswordHash,
        name: "Bruna Almeida",
        company: "Helio Bank",
        title: "Head de Compliance Digital",
        userType: UserType.internal,
      },
      {
        id: "usr-qa-multitenant",
        email: "qa.multitenant@axiontrust.io",
        passwordHash: qaMultiTenantPasswordHash,
        name: "QA Multi Tenant",
        company: "AXION Trust",
        title: "MVP Test Operator",
        userType: UserType.internal,
      },
      {
        id: "usr-guest-amanda",
        email: "amanda@bancoglobal.com",
        passwordHash: guestPasswordHash,
        name: "Amanda Reis",
        company: "Banco Global",
        title: "Vendor Risk Manager",
        userType: UserType.external,
      },
      {
        id: "usr-guest-fernanda",
        email: "fernanda@bancoglobal.com",
        passwordHash: guestPasswordHash,
        name: "Fernanda Souza",
        company: "Banco Global",
        title: "Compliance Lead",
        userType: UserType.external,
      },
      {
        id: "usr-guest-ricardo",
        email: "ricardo@pineventures.com",
        passwordHash: guestPasswordHash,
        name: "Ricardo Nunes",
        company: "Pine Ventures",
        title: "Operating Partner",
        userType: UserType.external,
      },
      {
        id: "usr-guest-mariana",
        email: "mariana@bancoglobal.com",
        passwordHash: guestPasswordHash,
        name: "Mariana Costa",
        company: "Banco Global",
        title: "Procurement Director",
        userType: UserType.external,
      },
      {
        id: "usr-guest-igor",
        email: "igor@retailwave.com",
        passwordHash: guestPasswordHash,
        name: "Igor Mota",
        company: "Retail Wave",
        title: "Privacy Counsel",
        userType: UserType.external,
      },
      {
        id: "usr-guest-julia",
        email: "julia@northmetrics.com",
        passwordHash: guestPasswordHash,
        name: "Julia Freitas",
        company: "North Metrics",
        title: "Security Analyst",
        userType: UserType.external,
      },
      {
        id: "usr-guest-atlas",
        email: "marcos@atlascapital.com",
        passwordHash: guestPasswordHash,
        name: "Marcos Lima",
        company: "Atlas Capital",
        title: "Investment Director",
        userType: UserType.external,
      },
    ],
  });

  await prisma.organizationMember.createMany({
    data: [
      {
        id: "mem-axion-owner",
        organizationId: AXION_ORGANIZATION_ID,
        userId: "usr-axion-owner",
        role: "owner",
        status: MembershipStatus.active,
        title: "Chief Security Officer",
      },
      {
        id: "mem-axion-admin",
        organizationId: AXION_ORGANIZATION_ID,
        userId: "usr-axion-admin",
        role: "admin",
        status: MembershipStatus.active,
        title: "Admin / CISO",
      },
      {
        id: "mem-axion-editor",
        organizationId: AXION_ORGANIZATION_ID,
        userId: "usr-axion-editor",
        role: "editor",
        status: MembershipStatus.active,
        title: "Trust Center Editor",
      },
      {
        id: "mem-axion-viewer",
        organizationId: AXION_ORGANIZATION_ID,
        userId: "usr-axion-viewer",
        role: "viewer",
        status: MembershipStatus.active,
        title: "Risk Viewer",
      },
      {
        id: "mem-orbit-admin",
        organizationId: ORBIT_ORGANIZATION_ID,
        userId: "usr-orbit-admin",
        role: "admin",
        status: MembershipStatus.active,
        title: "Security Admin",
      },
      {
        id: "mem-helio-owner",
        organizationId: HELIO_ORGANIZATION_ID,
        userId: "usr-helio-owner",
        role: "owner",
        status: MembershipStatus.active,
        title: "Head de Compliance Digital",
      },
      {
        id: "mem-qa-axion-owner",
        organizationId: AXION_ORGANIZATION_ID,
        userId: "usr-qa-multitenant",
        role: "owner",
        status: MembershipStatus.active,
        title: "QA Owner",
      },
      {
        id: "mem-qa-orbit-admin",
        organizationId: ORBIT_ORGANIZATION_ID,
        userId: "usr-qa-multitenant",
        role: "admin",
        status: MembershipStatus.active,
        title: "QA Admin",
      },
      {
        id: "mem-qa-helio-viewer",
        organizationId: HELIO_ORGANIZATION_ID,
        userId: "usr-qa-multitenant",
        role: "viewer",
        status: MembershipStatus.active,
        title: "QA Viewer",
      },
    ],
  });

  const axionSettings = DEFAULT_BUILDER_SETTINGS;

  await prisma.trustCenterSettings.create({
    data: {
      organizationId: AXION_ORGANIZATION_ID,
      displayName: axionSettings.displayName,
      publicDescription: axionSettings.publicDescription,
      logoMode: axionSettings.logoMode,
      heroBadge: axionSettings.heroBadge,
      heroUpdatedLabel: axionSettings.heroUpdatedLabel,
      heroTitle: axionSettings.heroTitle,
      primaryCtaLabel: axionSettings.primaryCtaLabel,
      secondaryCtaLabel: axionSettings.secondaryCtaLabel,
      securityContactEmail: axionSettings.securityContactEmail,
      responseSla: axionSettings.responseSla,
      draftSavedAt: parseDate(DEFAULT_BUILDER_PUBLICATION_META.draftSavedAt),
      publishedAt: parseDate(DEFAULT_BUILDER_PUBLICATION_META.publishedAt),
      heroSignals: {
        create: axionSettings.heroSignals.map((signal, index) => ({
          id: signal.id,
          label: signal.label,
          value: signal.value,
          note: signal.note,
          position: index,
        })),
      },
      sections: {
        create: axionSettings.sections.map((section, index) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          enabled: section.enabled,
          position: index,
        })),
      },
      certifications: {
        create: axionSettings.certifications.map((certification, index) => ({
          id: certification.id,
          label: certification.label,
          icon: certification.icon,
          iconClass: certification.iconClass,
          checked: certification.checked,
          position: index,
        })),
      },
      faqItems: {
        create: axionSettings.faqItems.map((faqItem, index) => ({
          id: faqItem.id,
          question: faqItem.question,
          answer: faqItem.answer,
          position: index,
        })),
      },
    },
  });

  await prisma.trustCenterTheme.create({
    data: {
      organizationId: AXION_ORGANIZATION_ID,
      primary: DEFAULT_TRUST_THEME.primary,
      secondary: DEFAULT_TRUST_THEME.secondary,
      button: DEFAULT_TRUST_THEME.button,
      surface: DEFAULT_TRUST_THEME.surface,
      header: DEFAULT_TRUST_THEME.header,
    },
  });

  await prisma.trustCenterSettings.create({
    data: {
      organizationId: ORBIT_ORGANIZATION_ID,
      displayName: "Orbit Cloud Security",
      publicDescription: "Portal multi-tenant focado em politicas, compliance e evidencias para clientes enterprise.",
      logoMode: "wordmark",
      heroBadge: "Seguranca para SaaS regulado",
      heroUpdatedLabel: "Ultima revisao do Trust em 20/04/2026",
      heroTitle: "Orbit Cloud centraliza seguranca, privacidade e governanca em um unico portal.",
      primaryCtaLabel: "Solicitar acesso",
      secondaryCtaLabel: "Falar com seguranca",
      securityContactEmail: "security@orbitcloud.io",
      responseSla: "Ate 48 horas",
      draftSavedAt: hoursAgo(6),
      publishedAt: hoursAgo(2),
      heroSignals: {
        create: [
          {
            id: "orbit-signal-1",
            label: "Ambiente",
            value: "AWS / Sao Paulo",
            note: "Infra dedicada para clientes enterprise",
            position: 0,
          },
          {
            id: "orbit-signal-2",
            label: "Auditoria",
            value: "SOC 2",
            note: "Ciclo anual com acompanhamento trimestral",
            position: 1,
          },
        ],
      },
      sections: {
        create: [
          {
            id: "orbit-section-docs",
            title: "Documentos publicados",
            description: "Politicas e evidencias publicas e privadas.",
            enabled: true,
            position: 0,
          },
          {
            id: "orbit-section-faq",
            title: "FAQ",
            description: "Perguntas comuns de seguranca e compliance.",
            enabled: true,
            position: 1,
          },
        ],
      },
      certifications: {
        create: [
          {
            id: "orbit-cert-soc2",
            label: "SOC 2 Type II",
            icon: "verified",
            iconClass: "text-emerald-500 bg-emerald-500/10",
            checked: true,
            position: 0,
          },
        ],
      },
      faqItems: {
        create: [
          {
            id: "orbit-faq-1",
            question: "Como funciona o acesso a documentos privados?",
            answer: "Clientes solicitam acesso por documento e o time interno aprova com prazo de expiracao e controle de NDA.",
            position: 0,
          },
        ],
      },
    },
  });

  await prisma.trustCenterTheme.create({
    data: {
      organizationId: ORBIT_ORGANIZATION_ID,
      primary: "#7CA6FF",
      secondary: "#C7D2FE",
      button: "#7CA6FF",
      surface: "#0F172A",
      header: "#101828",
    },
  });

  await prisma.trustCenterSettings.create({
    data: {
      organizationId: HELIO_ORGANIZATION_ID,
      displayName: "Helio Bank Compliance",
      publicDescription: "Portal regulatorio para due diligence de parceiros financeiros, privacidade e continuidade.",
      logoMode: "wordmark",
      heroBadge: "Fintech regulada",
      heroUpdatedLabel: "Controles revisados em 24/04/2026",
      heroTitle: "Helio Bank compartilha evidencias de seguranca, resiliencia e conformidade financeira.",
      primaryCtaLabel: "Solicitar pacote regulatorio",
      secondaryCtaLabel: "Contatar compliance",
      securityContactEmail: "compliance@heliobank.com.br",
      responseSla: "Ate 24 horas uteis",
      draftSavedAt: hoursAgo(10),
      publishedAt: hoursAgo(3),
      heroSignals: {
        create: [
          {
            id: "helio-signal-1",
            label: "Regulatorio",
            value: "BCB / LGPD",
            note: "Controles alinhados a fornecedores criticos",
            position: 0,
          },
          {
            id: "helio-signal-2",
            label: "Pagamentos",
            value: "PCI DSS",
            note: "Evidencias privadas sob NDA",
            position: 1,
          },
          {
            id: "helio-signal-3",
            label: "Resiliencia",
            value: "DR testado",
            note: "Testes semestrais de continuidade",
            position: 2,
          },
        ],
      },
      sections: {
        create: [
          {
            id: "helio-section-regulatory",
            title: "Pacote regulatorio",
            description: "Politicas, evidencias LGPD, PCI e continuidade para parceiros financeiros.",
            enabled: true,
            position: 0,
          },
          {
            id: "helio-section-access",
            title: "Acesso sob aprovacao",
            description: "Documentos sensiveis exigem justificativa, NDA e expiracao curta.",
            enabled: true,
            position: 1,
          },
          {
            id: "helio-section-contact",
            title: "Contato de compliance",
            description: "Canal dedicado para auditorias e procurement regulatorio.",
            enabled: true,
            position: 2,
          },
        ],
      },
      certifications: {
        create: [
          {
            id: "helio-cert-lgpd",
            label: "LGPD Ready",
            icon: "gavel",
            iconClass: "text-cyan-700 bg-cyan-500/10",
            checked: true,
            position: 0,
          },
          {
            id: "helio-cert-pci",
            label: "PCI DSS",
            icon: "credit_score",
            iconClass: "text-amber-600 bg-amber-500/10",
            checked: true,
            position: 1,
          },
        ],
      },
      faqItems: {
        create: [
          {
            id: "helio-faq-1",
            question: "Documentos PCI e continuidade sao publicos?",
            answer: "Nao. Esses documentos sao privados e dependem de aprovacao do tenant, grant ativo e NDA aceito.",
            position: 0,
          },
          {
            id: "helio-faq-2",
            question: "Qual o prazo padrao dos grants?",
            answer: "Para o tenant Helio, o seed usa prazos menores para simular fluxo regulatorio mais restritivo.",
            position: 1,
          },
        ],
      },
    },
  });

  await prisma.trustCenterTheme.create({
    data: {
      organizationId: HELIO_ORGANIZATION_ID,
      primary: "#0E7490",
      secondary: "#F59E0B",
      button: "#0E7490",
      surface: "#ECFEFF",
      header: "#083344",
    },
  });

  await prisma.dataRoomSettings.createMany({
    data: [
      {
        organizationId: AXION_ORGANIZATION_ID,
        title: workspace.title,
        subtitle: workspace.subtitle,
        note: workspace.note,
        publishingMode: workspace.publishingMode,
        categoriesJson: toJson(workspace.categories),
      },
      {
        organizationId: ORBIT_ORGANIZATION_ID,
        title: "Data Room Orbit",
        subtitle: "Biblioteca segura de documentos contratuais, politicas e evidencias tecnicas por tenant.",
        note: "Cada documento privado exige grant especifico por usuario externo.",
        publishingMode: "approval_required",
        categoriesJson: toJson(workspace.categories),
      },
      {
        organizationId: HELIO_ORGANIZATION_ID,
        title: "Data Room Helio Bank",
        subtitle: "Sala regulatoria com politicas financeiras, continuidade e evidencias de pagamentos.",
        note: "Tenant com regras mais restritivas: grants privados, NDA e expiracao curta.",
        publishingMode: "approval_required",
        categoriesJson: toJson(["Politicas", "Compliance", "Continuidade", "Privacidade"]),
      },
    ],
  });

  await prisma.trustDocument.createMany({
    data: [
      ...workspace.documents.map((document) => ({
        id: document.id,
        organizationId: AXION_ORGANIZATION_ID,
        slug: document.slug,
        name: document.name,
        description: document.description,
        category: document.category,
        visibility: document.visibility,
        status: document.status,
        version: document.version,
        owner: document.owner,
        updatedAtLabel: document.updatedAtLabel,
        publishedAtLabel: document.publishedAtLabel,
        sizeLabel: document.sizeLabel,
        downloads: document.downloads,
        icon: document.icon,
        iconClass: document.iconClass,
        requiresApproval: document.requiresApproval,
        approvalRule: document.approvalRule,
        visibleInTrustCenter: document.visibleInTrustCenter,
        ndaRequired: document.ndaRequired,
        tagsJson: toJson(document.tags),
      })),
      {
        id: "orbit-doc-policy",
        organizationId: ORBIT_ORGANIZATION_ID,
        slug: "security-policy",
        name: "Orbit_Security_Policy.pdf",
        description: "Politica publica da Orbit para clientes que avaliam requisitos basicos de seguranca.",
        category: "Politicas",
        visibility: "Publico",
        status: "Publicado",
        version: "v2.1",
        owner: "Marina Duarte",
        updatedAtLabel: "21/04/2026",
        publishedAtLabel: "Publicado em 21/04/2026",
        sizeLabel: "920 KB",
        downloads: 11,
        icon: "policy",
        iconClass: "text-secondary",
        requiresApproval: false,
        approvalRule: "Documento publico do Trust Center.",
        visibleInTrustCenter: true,
        ndaRequired: false,
        tagsJson: toJson(["Politica", "Publico", "Trust Center"]),
      },
      {
        id: "orbit-doc-soc2",
        organizationId: ORBIT_ORGANIZATION_ID,
        slug: "soc2-report",
        name: "Orbit_SOC_2_Type_II_Report.pdf",
        description: "Relatorio privado liberado individualmente para processos de procurement e auditoria.",
        category: "Compliance",
        visibility: "Privado",
        status: "Publicado",
        version: "v2026.1",
        owner: "Marina Duarte",
        updatedAtLabel: "22/04/2026",
        publishedAtLabel: "Publicado em 22/04/2026",
        sizeLabel: "3.9 MB",
        downloads: 4,
        icon: "verified",
        iconClass: "text-primary",
        requiresApproval: true,
        approvalRule: "Aprovar somente apos validacao comercial e NDA.",
        visibleInTrustCenter: true,
        ndaRequired: true,
        tagsJson: toJson(["SOC 2", "Privado"]),
      },
      {
        id: "helio-doc-privacy",
        organizationId: HELIO_ORGANIZATION_ID,
        slug: "privacy-policy",
        name: "Helio_Privacy_and_LGPD_Overview.pdf",
        description: "Resumo publico de privacidade, bases legais e governanca LGPD para parceiros.",
        category: "Privacidade",
        visibility: "Publico",
        status: "Publicado",
        version: "v1.4",
        owner: "Bruna Almeida",
        updatedAtLabel: "24/04/2026",
        publishedAtLabel: "Publicado em 24/04/2026",
        sizeLabel: "740 KB",
        downloads: 18,
        icon: "gavel",
        iconClass: "text-cyan-700",
        requiresApproval: false,
        approvalRule: "Documento publico para avaliacao inicial de privacidade.",
        visibleInTrustCenter: true,
        ndaRequired: false,
        tagsJson: toJson(["LGPD", "Privacidade", "Publico"]),
      },
      {
        id: "helio-doc-pci",
        organizationId: HELIO_ORGANIZATION_ID,
        slug: "pci-dss-aoc",
        name: "Helio_PCI_DSS_AOC.pdf",
        description: "Atestado privado de conformidade PCI DSS para parceiros de pagamentos.",
        category: "Compliance",
        visibility: "Privado",
        status: "Publicado",
        version: "v2026.2",
        owner: "Bruna Almeida",
        updatedAtLabel: "23/04/2026",
        publishedAtLabel: "Publicado em 24/04/2026",
        sizeLabel: "2.4 MB",
        downloads: 7,
        icon: "credit_score",
        iconClass: "text-amber-600",
        requiresApproval: true,
        approvalRule: "Liberar somente para parceiro financeiro com NDA aceito e justificativa regulatoria.",
        visibleInTrustCenter: true,
        ndaRequired: true,
        tagsJson: toJson(["PCI DSS", "Privado", "NDA"]),
      },
      {
        id: "helio-doc-bcp",
        organizationId: HELIO_ORGANIZATION_ID,
        slug: "business-continuity",
        name: "Helio_Business_Continuity_Playbook.pdf",
        description: "Plano de continuidade e recuperacao para fornecedores criticos e auditorias.",
        category: "Continuidade",
        visibility: "Privado",
        status: "Pendente de aprovaÃ§Ã£o",
        version: "v0.9",
        owner: "Bruna Almeida",
        updatedAtLabel: "22/04/2026",
        publishedAtLabel: null,
        sizeLabel: "1.8 MB",
        downloads: 0,
        icon: "emergency_home",
        iconClass: "text-rose-500",
        requiresApproval: true,
        approvalRule: "Publicacao exige owner/admin por conter detalhes operacionais sensiveis.",
        visibleInTrustCenter: false,
        ndaRequired: true,
        tagsJson: toJson(["BCP", "DR", "Restrito"]),
      },
    ],
  });

  const requestData = [
    ...workspace.requests.map((request, index) => ({
      id: request.id,
      organizationId: AXION_ORGANIZATION_ID,
      documentId: request.documentId,
      requesterUserId:
        request.email === "mariana@bancoglobal.com"
          ? "usr-guest-mariana"
          : request.email === "igor@retailwave.com"
            ? "usr-guest-igor"
            : request.email === "julia@northmetrics.com"
              ? "usr-guest-julia"
              : null,
      requesterName: request.requester,
      requesterEmail: request.email,
      requesterCompany: request.company,
      reason: request.reason,
      status: mapAccessRequestStatus(request.status),
      requestedAt: hoursAgo(26 - index * 5),
      reviewedAt: request.status === "Pendente" ? null : hoursAgo(24 - index * 4),
      reviewedByMemberId: request.status === "Pendente" ? null : "mem-axion-admin",
      ndaAcceptedAt: request.documentId === "doc-soc2" && request.status === "Aprovado" ? hoursAgo(18) : null,
      documentType: "Documento privado",
      reviewTag: null,
    })),
    ...initialPendingRequests
      .filter((request) => !workspace.requests.some((workspaceRequest) => workspaceRequest.id === request.id))
      .map((request, index) => ({
        id: request.id,
        organizationId: AXION_ORGANIZATION_ID,
        documentId:
          request.document === "SOC_2_Type_II_Report.pdf"
            ? "doc-soc2"
            : request.document === "Data_Processing_Addendum.pdf"
              ? "doc-dpa"
              : "doc-pen",
        requesterUserId: null,
        requesterName: request.requester,
        requesterEmail: request.email,
        requesterCompany: request.company,
        reason: request.reason,
        status: AccessRequestStatus.pending,
        requestedAt: hoursAgo(8 + index * 3),
        reviewedAt: null,
        reviewedByMemberId: null,
        ndaAcceptedAt: null,
        documentType: request.documentType,
        reviewTag: request.reviewTag,
      })),
    {
      id: "orbit-req-1",
      organizationId: ORBIT_ORGANIZATION_ID,
      documentId: "orbit-doc-soc2",
      requesterUserId: "usr-guest-amanda",
      requesterName: "Amanda Reis",
      requesterEmail: "amanda@bancoglobal.com",
      requesterCompany: "Banco Global",
      reason: "Security review do onboarding da Orbit Cloud.",
      status: AccessRequestStatus.approved,
      requestedAt: hoursAgo(30),
      reviewedAt: hoursAgo(28),
      reviewedByMemberId: "mem-orbit-admin",
        ndaAcceptedAt: hoursAgo(27),
        documentType: "Documento privado",
        reviewTag: "Aprovado",
      },
    {
      id: "helio-req-1",
      organizationId: HELIO_ORGANIZATION_ID,
      documentId: "helio-doc-pci",
      requesterUserId: "usr-guest-fernanda",
      requesterName: "Fernanda Souza",
      requesterEmail: "fernanda@bancoglobal.com",
      requesterCompany: "Banco Global",
      reason: "Validacao regulatoria de parceiro de pagamentos.",
      status: AccessRequestStatus.approved,
      requestedAt: hoursAgo(22),
      reviewedAt: hoursAgo(20),
      reviewedByMemberId: "mem-helio-owner",
      ndaAcceptedAt: hoursAgo(19),
      documentType: "Documento privado",
      reviewTag: "Regulatorio",
    },
    {
      id: "helio-req-2",
      organizationId: HELIO_ORGANIZATION_ID,
      documentId: "helio-doc-bcp",
      requesterUserId: "usr-guest-julia",
      requesterName: "Julia Freitas",
      requesterEmail: "julia@northmetrics.com",
      requesterCompany: "North Metrics",
      reason: "Auditoria de continuidade para integracao critica.",
      status: AccessRequestStatus.pending,
      requestedAt: hoursAgo(5),
      reviewedAt: null,
      reviewedByMemberId: null,
      ndaAcceptedAt: null,
      documentType: "Documento restrito",
      reviewTag: "Pendente de owner",
    },
  ];

  await prisma.accessRequest.createMany({ data: requestData });

  const grantDates = {
    amandaAxion: daysAgo(5),
    ricardoPine: daysAgo(8),
    fernandaAxion: daysAgo(7),
    amandaOrbit: daysAgo(2),
    fernandaHelio: daysAgo(1),
  };

  await prisma.documentAccessGrant.createMany({
    data: [
      {
        id: "grant-axion-amanda",
        organizationId: AXION_ORGANIZATION_ID,
        documentId: "doc-soc2",
        userId: "usr-guest-amanda",
        grantedByMemberId: "mem-axion-admin",
        sourceRequestId: null,
        expiresAt: addDays(grantDates.amandaAxion, 365),
        revokedAt: null,
        ndaAcceptedAt: addDays(grantDates.amandaAxion, 1),
        status: DocumentAccessGrantStatus.active,
        createdAt: grantDates.amandaAxion,
        updatedAt: grantDates.amandaAxion,
      },
      {
        id: "grant-axion-ricardo",
        organizationId: AXION_ORGANIZATION_ID,
        documentId: "doc-pen",
        userId: "usr-guest-ricardo",
        grantedByMemberId: "mem-axion-admin",
        sourceRequestId: null,
        expiresAt: addDays(grantDates.ricardoPine, 365),
        revokedAt: null,
        ndaAcceptedAt: addDays(grantDates.ricardoPine, 1),
        status: DocumentAccessGrantStatus.active,
        createdAt: grantDates.ricardoPine,
        updatedAt: grantDates.ricardoPine,
      },
      {
        id: "grant-axion-fernanda",
        organizationId: AXION_ORGANIZATION_ID,
        documentId: "doc-soc2",
        userId: "usr-guest-fernanda",
        grantedByMemberId: "mem-axion-admin",
        sourceRequestId: null,
        expiresAt: addDays(grantDates.fernandaAxion, 365),
        revokedAt: null,
        ndaAcceptedAt: addDays(grantDates.fernandaAxion, 1),
        status: DocumentAccessGrantStatus.active,
        createdAt: grantDates.fernandaAxion,
        updatedAt: grantDates.fernandaAxion,
      },
      {
        id: "grant-orbit-amanda",
        organizationId: ORBIT_ORGANIZATION_ID,
        documentId: "orbit-doc-soc2",
        userId: "usr-guest-amanda",
        grantedByMemberId: "mem-orbit-admin",
        sourceRequestId: "orbit-req-1",
        expiresAt: addDays(grantDates.amandaOrbit, 180),
        revokedAt: null,
        ndaAcceptedAt: addDays(grantDates.amandaOrbit, 1),
        status: DocumentAccessGrantStatus.active,
        createdAt: grantDates.amandaOrbit,
        updatedAt: grantDates.amandaOrbit,
      },
      {
        id: "grant-helio-fernanda",
        organizationId: HELIO_ORGANIZATION_ID,
        documentId: "helio-doc-pci",
        userId: "usr-guest-fernanda",
        grantedByMemberId: "mem-helio-owner",
        sourceRequestId: "helio-req-1",
        expiresAt: addDays(grantDates.fernandaHelio, 90),
        revokedAt: null,
        ndaAcceptedAt: addDays(grantDates.fernandaHelio, 1),
        status: DocumentAccessGrantStatus.active,
        createdAt: grantDates.fernandaHelio,
        updatedAt: grantDates.fernandaHelio,
      },
    ],
  });

  await prisma.trustDownloadEvent.createMany({
    data: [
      {
        id: "evt-1",
        documentId: "doc-policy",
        userId: null,
        actorNameSnapshot: "Carlos Vieira",
        emailSnapshot: "carlos@prospectly.com",
        companySnapshot: "Prospectly",
        accessGrantId: null,
        action: TrustDownloadAction.download,
        createdAt: hoursAgo(6),
      },
      {
        id: "evt-2",
        documentId: "doc-soc2",
        userId: "usr-guest-amanda",
        actorNameSnapshot: "Amanda Reis",
        emailSnapshot: "amanda@bancoglobal.com",
        companySnapshot: "Banco Global",
        accessGrantId: "grant-axion-amanda",
        action: TrustDownloadAction.download,
        createdAt: addDays(grantDates.amandaAxion, 1),
      },
      {
        id: "evt-3",
        documentId: "doc-dpa",
        userId: "usr-guest-igor",
        actorNameSnapshot: "Igor Mota",
        emailSnapshot: "igor@retailwave.com",
        companySnapshot: "Retail Wave",
        accessGrantId: null,
        action: TrustDownloadAction.request_access,
        createdAt: hoursAgo(18),
      },
      {
        id: "evt-4",
        documentId: "doc-soc2",
        userId: "usr-guest-atlas",
        actorNameSnapshot: "Marcos Lima",
        emailSnapshot: "marcos@atlascapital.com",
        companySnapshot: "Atlas Capital",
        accessGrantId: null,
        action: TrustDownloadAction.request_access,
        createdAt: hoursAgo(33),
      },
      {
        id: "evt-5",
        documentId: "doc-soc2",
        userId: "usr-guest-fernanda",
        actorNameSnapshot: "Fernanda Souza",
        emailSnapshot: "fernanda@bancoglobal.com",
        companySnapshot: "Banco Global",
        accessGrantId: "grant-axion-fernanda",
        action: TrustDownloadAction.download,
        createdAt: addDays(grantDates.fernandaAxion, 1),
      },
      {
        id: "evt-6",
        documentId: "orbit-doc-soc2",
        userId: "usr-guest-amanda",
        actorNameSnapshot: "Amanda Reis",
        emailSnapshot: "amanda@bancoglobal.com",
        companySnapshot: "Banco Global",
        accessGrantId: "grant-orbit-amanda",
        action: TrustDownloadAction.download,
        createdAt: addDays(grantDates.amandaOrbit, 1),
      },
      {
        id: "evt-7",
        documentId: "helio-doc-privacy",
        userId: null,
        actorNameSnapshot: "Paula Martins",
        emailSnapshot: "paula@finprocure.com",
        companySnapshot: "FinProcure",
        accessGrantId: null,
        action: TrustDownloadAction.download,
        createdAt: hoursAgo(4),
      },
      {
        id: "evt-8",
        documentId: "helio-doc-pci",
        userId: "usr-guest-fernanda",
        actorNameSnapshot: "Fernanda Souza",
        emailSnapshot: "fernanda@bancoglobal.com",
        companySnapshot: "Banco Global",
        accessGrantId: "grant-helio-fernanda",
        action: TrustDownloadAction.download,
        createdAt: addDays(grantDates.fernandaHelio, 1),
      },
    ],
  });

  await prisma.supplier.createMany({
    data: defaultSuppliers.map((supplier) => ({
      id: supplier.slug,
      organizationId: AXION_ORGANIZATION_ID,
      slug: supplier.slug,
      legalName: supplier.legalName,
      displayName: supplier.displayName,
      domain: supplier.domain,
      website: supplier.website,
      supplierType: supplier.supplierType,
      segment: supplier.segment,
      subsegment: supplier.subsegment,
      headquartersCity: supplier.headquartersCity,
      headquartersCountry: supplier.headquartersCountry,
      taxId: supplier.taxId,
      primaryContactName: supplier.primaryContactName,
      primaryContactRole: supplier.primaryContactRole,
      primaryContactEmail: supplier.primaryContactEmail,
      securityContactEmail: supplier.securityContactEmail,
      privacyContactEmail: supplier.privacyContactEmail,
      businessOwner: supplier.businessOwner,
      criticality: supplier.criticality,
      integrationType: supplier.integrationType,
      dataClassification: supplier.dataClassification,
      accessScope: supplier.accessScope,
      hostingModel: supplier.hostingModel,
      activeRegions: supplier.activeRegions,
      servicesProvided: supplier.servicesProvided,
      countriesOfOperation: supplier.countriesOfOperation,
      notes: supplier.notes,
      risk: supplier.risk,
      lifecycleStatus: supplier.lifecycleStatus,
      status: supplier.status,
      score: supplier.score,
      previousScore: supplier.previousScore,
      trend: supplier.trend,
      createdAtLabel: supplier.createdAt,
    })),
  });

  await prisma.questionnaireTemplate.createMany({
    data: [
      ...questionnaireCatalog.map((questionnaire) => ({
        id: questionnaire.id,
        name: questionnaire.name,
        category: questionnaire.category,
        version: questionnaire.version,
        source: questionnaire.source,
        criticality: null,
        objective: null,
      })),
      {
        id: "template-initial-builder",
        name: initialConfig.name,
        category: initialConfig.category,
        version: initialConfig.version,
        source: "template",
        criticality: initialConfig.criticality,
        objective: `${initialConfig.objective}\n\nSeed: ${initialSections.length} secoes, ${initialQuestions.length} perguntas, ${initialRules.length} regras e ${initialEvidences.length} evidencias.`,
      },
    ],
  });

  await prisma.integration.createMany({
    data: integrationDetails.map((integration) => ({
      id: integration.slug,
      organizationId: AXION_ORGANIZATION_ID,
      slug: integration.slug,
      listName: integration.listName,
      title: integration.title,
      subtitle: integration.subtitle,
      status: integration.status,
      statusClass: integration.statusClass,
      owner: integration.owner,
      category: integration.category,
      syncWindow: integration.syncWindow,
      notesJson: toJson({
        primaryFields: integration.primaryFields,
        deliveryFields: integration.deliveryFields,
        tools: integration.tools,
        eventCards: integration.eventCards,
        notes: integration.notes,
      }),
    })),
  });

  await prisma.auditActivity.createMany({
    data: [
      {
        organizationId: AXION_ORGANIZATION_ID,
        type: "seed.bootstrap",
        title: "Tenant AXION carregado",
        description: "Banco local inicializado com membros internos, requests e grants por documento.",
        actor: "Sistema",
        entityType: "Organization",
        entityId: AXION_ORGANIZATION_ID,
      },
      {
        organizationId: ORBIT_ORGANIZATION_ID,
        type: "seed.bootstrap",
        title: "Tenant Orbit carregado",
        description: "Tenant secundario criado para validar segregacao multi-tenant e grants cruzados por usuario externo.",
        actor: "Sistema",
        entityType: "Organization",
        entityId: ORBIT_ORGANIZATION_ID,
      },
      {
        organizationId: HELIO_ORGANIZATION_ID,
        type: "seed.bootstrap",
        title: "Tenant Helio carregado",
        description: "Tenant fintech criado para validar pagina de teste regulatoria, grants curtos e documentos privados sob NDA.",
        actor: "Sistema",
        entityType: "Organization",
        entityId: HELIO_ORGANIZATION_ID,
      },
      {
        organizationId: AXION_ORGANIZATION_ID,
        type: "access.approved",
        title: "Grant ativo para Amanda Reis",
        description: "Acesso ao SOC 2 da AXION aprovado com expiracao em 1 ano.",
        actor: "Ricardo Menezes",
        actorUserId: "usr-axion-admin",
        actorMemberId: "mem-axion-admin",
        entityType: "DocumentAccessGrant",
        entityId: "grant-axion-amanda",
      },
      {
        organizationId: ORBIT_ORGANIZATION_ID,
        type: "access.approved",
        title: "Grant ativo na Orbit",
        description: "Amanda Reis recebeu acesso ao SOC 2 da Orbit apos aceite de NDA.",
        actor: "Marina Duarte",
        actorUserId: "usr-orbit-admin",
        actorMemberId: "mem-orbit-admin",
        entityType: "DocumentAccessGrant",
        entityId: "grant-orbit-amanda",
      },
      {
        organizationId: HELIO_ORGANIZATION_ID,
        type: "access.approved",
        title: "Grant regulatorio ativo",
        description: "Fernanda Souza recebeu acesso ao PCI DSS da Helio com expiracao de 90 dias.",
        actor: "Bruna Almeida",
        actorUserId: "usr-helio-owner",
        actorMemberId: "mem-helio-owner",
        entityType: "DocumentAccessGrant",
        entityId: "grant-helio-fernanda",
      },
    ],
  });

  console.log("Seed concluido.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
