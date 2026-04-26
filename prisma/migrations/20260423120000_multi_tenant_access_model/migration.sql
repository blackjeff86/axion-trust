-- DropIndex
DROP INDEX "TrustDocument_slug_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ApprovedAccess";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "title" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'external',
    "emailVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "title" TEXT,
    "invitedByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrganizationMember_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentAccessGrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantedByMemberId" TEXT,
    "sourceRequestId" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "ndaAcceptedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentAccessGrant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentAccessGrant_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "TrustDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentAccessGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentAccessGrant_grantedByMemberId_fkey" FOREIGN KEY ("grantedByMemberId") REFERENCES "OrganizationMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DocumentAccessGrant_sourceRequestId_fkey" FOREIGN KEY ("sourceRequestId") REFERENCES "AccessRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "requesterUserId" TEXT,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterCompany" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "reviewedByMemberId" TEXT,
    "ndaAcceptedAt" DATETIME,
    "documentType" TEXT,
    "reviewTag" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AccessRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AccessRequest_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "TrustDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AccessRequest_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AccessRequest_reviewedByMemberId_fkey" FOREIGN KEY ("reviewedByMemberId") REFERENCES "OrganizationMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AccessRequest" ("createdAt", "documentId", "documentType", "id", "organizationId", "reason", "reviewTag", "status", "updatedAt") SELECT "createdAt", "documentId", "documentType", "id", "organizationId", "reason", "reviewTag", "status", "updatedAt" FROM "AccessRequest";
DROP TABLE "AccessRequest";
ALTER TABLE "new_AccessRequest" RENAME TO "AccessRequest";
CREATE TABLE "new_AuditActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actor" TEXT,
    "actorUserId" TEXT,
    "actorMemberId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditActivity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditActivity_actorMemberId_fkey" FOREIGN KEY ("actorMemberId") REFERENCES "OrganizationMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AuditActivity" ("actor", "createdAt", "description", "entityId", "entityType", "id", "organizationId", "title", "type") SELECT "actor", "createdAt", "description", "entityId", "entityType", "id", "organizationId", "title", "type" FROM "AuditActivity";
DROP TABLE "AuditActivity";
ALTER TABLE "new_AuditActivity" RENAME TO "AuditActivity";
CREATE TABLE "new_TrustDownloadEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "userId" TEXT,
    "actorNameSnapshot" TEXT,
    "emailSnapshot" TEXT,
    "companySnapshot" TEXT,
    "accessGrantId" TEXT,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrustDownloadEvent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "TrustDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrustDownloadEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrustDownloadEvent_accessGrantId_fkey" FOREIGN KEY ("accessGrantId") REFERENCES "DocumentAccessGrant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TrustDownloadEvent" ("documentId", "id") SELECT "documentId", "id" FROM "TrustDownloadEvent";
DROP TABLE "TrustDownloadEvent";
ALTER TABLE "new_TrustDownloadEvent" RENAME TO "TrustDownloadEvent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentAccessGrant_organizationId_documentId_userId_key" ON "DocumentAccessGrant"("organizationId", "documentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustDocument_organizationId_slug_key" ON "TrustDocument"("organizationId", "slug");
