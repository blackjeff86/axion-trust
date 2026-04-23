import "dotenv/config";
import { PrismaClient } from "@prisma/client";
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
import {
  initialApprovedAccesses,
  initialPendingRequests,
} from "../app/(secure)/gestao-acessos/access-data";
import { integrationDetails } from "../app/(secure)/configuracoes/integration-detail-data";
import {
  initialConfig,
  initialEvidences,
  initialQuestions,
  initialRules,
  initialSections,
} from "../app/(secure)/due-diligence-terceiros/novo-questionario/template-builder-data";

const prisma = new PrismaClient();

const ORGANIZATION_ID = "org_axion_demo";

function toJson(value: unknown) {
  return JSON.stringify(value);
}

function parseDate(value: string | null) {
  return value ? new Date(value) : null;
}

async function main() {
  const workspace = getDataRoomWorkspace();

  await prisma.organization.upsert({
    where: { id: ORGANIZATION_ID },
    update: {
      name: "AXION Trust",
      displayName: DEFAULT_BUILDER_SETTINGS.displayName,
      domain: "axiontrust.io",
    },
    create: {
      id: ORGANIZATION_ID,
      name: "AXION Trust",
      displayName: DEFAULT_BUILDER_SETTINGS.displayName,
      domain: "axiontrust.io",
    },
  });

  await prisma.auditActivity.deleteMany({ where: { organizationId: ORGANIZATION_ID } });
  await prisma.integration.deleteMany({ where: { organizationId: ORGANIZATION_ID } });
  await prisma.questionnaireTemplate.deleteMany({});
  await prisma.supplier.deleteMany({ where: { organizationId: ORGANIZATION_ID } });
  await prisma.approvedAccess.deleteMany({ where: { organizationId: ORGANIZATION_ID } });
  await prisma.accessRequest.deleteMany({ where: { organizationId: ORGANIZATION_ID } });
  await prisma.trustDownloadEvent.deleteMany({});
  await prisma.trustDocument.deleteMany({ where: { organizationId: ORGANIZATION_ID } });
  await prisma.dataRoomSettings.deleteMany({ where: { organizationId: ORGANIZATION_ID } });
  await prisma.trustCenterHeroSignal.deleteMany({});
  await prisma.trustCenterSection.deleteMany({});
  await prisma.trustCenterCertification.deleteMany({});
  await prisma.trustCenterFaqItem.deleteMany({});
  await prisma.trustCenterSettings.deleteMany({ where: { organizationId: ORGANIZATION_ID } });
  await prisma.trustCenterTheme.deleteMany({ where: { organizationId: ORGANIZATION_ID } });

  const trustCenterSettings = await prisma.trustCenterSettings.create({
    data: {
      organizationId: ORGANIZATION_ID,
      displayName: DEFAULT_BUILDER_SETTINGS.displayName,
      publicDescription: DEFAULT_BUILDER_SETTINGS.publicDescription,
      logoMode: DEFAULT_BUILDER_SETTINGS.logoMode,
      heroBadge: DEFAULT_BUILDER_SETTINGS.heroBadge,
      heroUpdatedLabel: DEFAULT_BUILDER_SETTINGS.heroUpdatedLabel,
      heroTitle: DEFAULT_BUILDER_SETTINGS.heroTitle,
      primaryCtaLabel: DEFAULT_BUILDER_SETTINGS.primaryCtaLabel,
      secondaryCtaLabel: DEFAULT_BUILDER_SETTINGS.secondaryCtaLabel,
      securityContactEmail: DEFAULT_BUILDER_SETTINGS.securityContactEmail,
      responseSla: DEFAULT_BUILDER_SETTINGS.responseSla,
      draftSavedAt: parseDate(DEFAULT_BUILDER_PUBLICATION_META.draftSavedAt),
      publishedAt: parseDate(DEFAULT_BUILDER_PUBLICATION_META.publishedAt),
      heroSignals: {
        create: DEFAULT_BUILDER_SETTINGS.heroSignals.map((signal, index) => ({
          id: signal.id,
          label: signal.label,
          value: signal.value,
          note: signal.note,
          position: index,
        })),
      },
      sections: {
        create: DEFAULT_BUILDER_SETTINGS.sections.map((section, index) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          enabled: section.enabled,
          position: index,
        })),
      },
      certifications: {
        create: DEFAULT_BUILDER_SETTINGS.certifications.map((certification, index) => ({
          id: certification.id,
          label: certification.label,
          icon: certification.icon,
          iconClass: certification.iconClass,
          checked: certification.checked,
          position: index,
        })),
      },
      faqItems: {
        create: DEFAULT_BUILDER_SETTINGS.faqItems.map((faqItem, index) => ({
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
      organizationId: ORGANIZATION_ID,
      primary: DEFAULT_TRUST_THEME.primary,
      secondary: DEFAULT_TRUST_THEME.secondary,
      button: DEFAULT_TRUST_THEME.button,
      surface: DEFAULT_TRUST_THEME.surface,
      header: DEFAULT_TRUST_THEME.header,
    },
  });

  await prisma.dataRoomSettings.create({
    data: {
      organizationId: ORGANIZATION_ID,
      title: workspace.title,
      subtitle: workspace.subtitle,
      note: workspace.note,
      publishingMode: workspace.publishingMode,
      categoriesJson: toJson(workspace.categories),
    },
  });

  await prisma.trustDocument.createMany({
    data: workspace.documents.map((document) => ({
      id: document.id,
      organizationId: ORGANIZATION_ID,
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
  });

  await prisma.accessRequest.createMany({
    data: workspace.requests.map((request) => ({
      id: request.id,
      organizationId: ORGANIZATION_ID,
      documentId: request.documentId,
      requester: request.requester,
      company: request.company,
      email: request.email,
      requestedAtLabel: request.requestedAtLabel,
      reason: request.reason,
      status: request.status,
      documentType: "Documento privado",
    })),
  });

  await prisma.trustDownloadEvent.createMany({
    data: workspace.downloadEvents.map((event) => ({
      id: event.id,
      documentId: event.documentId,
      actor: event.actor,
      company: event.company,
      actionLabel: event.actionLabel,
      timeLabel: event.timeLabel,
      tone: event.tone,
    })),
  });

  const documentByName = new Map(workspace.documents.map((document) => [document.name, document.id]));

  await prisma.accessRequest.createMany({
    data: initialPendingRequests
      .filter((request) => !workspace.requests.some((workspaceRequest) => workspaceRequest.id === request.id))
      .map((request) => ({
        id: request.id,
        organizationId: ORGANIZATION_ID,
        documentId: documentByName.get(request.document) ?? workspace.documents[0].id,
        requester: request.requester,
        company: request.company,
        email: request.email,
        requestedAtLabel: request.requestedAt,
        reason: request.reason,
        status: "Pendente",
        documentType: request.documentType,
        reviewTag: request.reviewTag,
      })),
  });

  await prisma.approvedAccess.createMany({
    data: initialApprovedAccesses.map((access) => ({
      id: access.id,
      organizationId: ORGANIZATION_ID,
      requester: access.requester,
      email: access.email,
      company: access.company,
      document: access.document,
      approvedAt: access.approvedAt,
      expiresAt: access.expiresAt,
      status: access.status,
      statusClass: access.statusClass,
    })),
  });

  await prisma.supplier.createMany({
    data: defaultSuppliers.map((supplier) => ({
      id: supplier.slug,
      organizationId: ORGANIZATION_ID,
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
      organizationId: ORGANIZATION_ID,
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
        organizationId: ORGANIZATION_ID,
        type: "seed",
        title: "Banco demo inicializado",
        description: `Dados iniciais carregados para ${trustCenterSettings.displayName}.`,
        actor: "Sistema",
        entityType: "Organization",
        entityId: ORGANIZATION_ID,
      },
      {
        organizationId: ORGANIZATION_ID,
        type: "data-room",
        title: "Documentos do Data Room importados",
        description: `${workspace.documents.length} documentos foram migrados dos mocks para o banco local.`,
        actor: "Sistema",
        entityType: "TrustDocument",
      },
    ],
  });
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
