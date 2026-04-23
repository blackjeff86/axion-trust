-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "domain" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DataRoomSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "publishingMode" TEXT NOT NULL,
    "categoriesJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DataRoomSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustCenterSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "publicDescription" TEXT NOT NULL,
    "logoMode" TEXT NOT NULL,
    "heroBadge" TEXT NOT NULL,
    "heroUpdatedLabel" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "primaryCtaLabel" TEXT NOT NULL,
    "secondaryCtaLabel" TEXT NOT NULL,
    "securityContactEmail" TEXT NOT NULL,
    "responseSla" TEXT NOT NULL,
    "draftSavedAt" DATETIME,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrustCenterSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustCenterTheme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "primary" TEXT NOT NULL,
    "secondary" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "surface" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrustCenterTheme_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustCenterHeroSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "settingsId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "TrustCenterHeroSignal_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "TrustCenterSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustCenterSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "settingsId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "TrustCenterSection_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "TrustCenterSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustCenterCertification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "settingsId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "iconClass" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "TrustCenterCertification_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "TrustCenterSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustCenterFaqItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "settingsId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "TrustCenterFaqItem_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "TrustCenterSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "updatedAtLabel" TEXT NOT NULL,
    "publishedAtLabel" TEXT,
    "sizeLabel" TEXT NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT NOT NULL,
    "iconClass" TEXT NOT NULL,
    "requiresApproval" BOOLEAN NOT NULL,
    "approvalRule" TEXT NOT NULL,
    "visibleInTrustCenter" BOOLEAN NOT NULL,
    "ndaRequired" BOOLEAN NOT NULL,
    "tagsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrustDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "requester" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "requestedAtLabel" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "documentType" TEXT,
    "reviewTag" TEXT,
    "deniedAt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AccessRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AccessRequest_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "TrustDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApprovedAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "requester" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "approvedAt" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "statusClass" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ApprovedAccess_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustDownloadEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "actionLabel" TEXT NOT NULL,
    "timeLabel" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    CONSTRAINT "TrustDownloadEvent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "TrustDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "supplierType" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "subsegment" TEXT NOT NULL,
    "headquartersCity" TEXT NOT NULL,
    "headquartersCountry" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "primaryContactName" TEXT NOT NULL,
    "primaryContactRole" TEXT NOT NULL,
    "primaryContactEmail" TEXT NOT NULL,
    "securityContactEmail" TEXT NOT NULL,
    "privacyContactEmail" TEXT NOT NULL,
    "businessOwner" TEXT NOT NULL,
    "criticality" TEXT NOT NULL,
    "integrationType" TEXT NOT NULL,
    "dataClassification" TEXT NOT NULL,
    "accessScope" TEXT NOT NULL,
    "hostingModel" TEXT NOT NULL,
    "activeRegions" TEXT NOT NULL,
    "servicesProvided" TEXT NOT NULL,
    "countriesOfOperation" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "lifecycleStatus" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" INTEGER,
    "previousScore" INTEGER,
    "trend" INTEGER,
    "createdAtLabel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionnaireTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "criticality" TEXT,
    "objective" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "listName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "statusClass" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "syncWindow" TEXT NOT NULL,
    "notesJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Integration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actor" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DataRoomSettings_organizationId_key" ON "DataRoomSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustCenterSettings_organizationId_key" ON "TrustCenterSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustCenterTheme_organizationId_key" ON "TrustCenterTheme"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustDocument_slug_key" ON "TrustDocument"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_slug_key" ON "Supplier"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_slug_key" ON "Integration"("slug");

