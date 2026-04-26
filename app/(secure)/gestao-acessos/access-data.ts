export type PendingRequest = {
  id: string;
  requester: string;
  email: string;
  company: string;
  document: string;
  requestedAt: string;
  reason: string;
  documentType: string;
  reviewTag: string | null;
  ndaAcceptedAt: string | null;
};

export type AccessGrant = {
  id: string;
  requester: string;
  email: string;
  company: string;
  document: string;
  approvedAt: string;
  expiresAt: string;
  status: "Ativo" | "Expira em breve" | "Expirado" | "Revogado";
  statusClass: string;
  ndaAcceptedAt: string | null;
};

export type DeniedAccess = PendingRequest & {
  deniedAt: string;
};

export type AccessManagementState = {
  pendingRequests: PendingRequest[];
  accessGrants: AccessGrant[];
  deniedRequests: DeniedAccess[];
  stats: {
    pending: number;
    active: number;
    expiring: number;
    auditEvents: number;
  };
};

export const initialPendingRequests = [
  {
    id: "req-1",
    requester: "Mariana Costa",
    email: "mariana@bancoglobal.com",
    company: "Banco Global",
    document: "SOC_2_Type_II_Report.pdf",
    requestedAt: "Ha 25 min",
    reason: "Validacao de controles antes da renovacao contratual.",
    documentType: "Documento privado",
    reviewTag: null,
    ndaAcceptedAt: null,
  },
  {
    id: "req-2",
    requester: "Igor Mota",
    email: "igor@retailwave.com",
    company: "Retail Wave",
    document: "Data_Processing_Addendum.pdf",
    requestedAt: "Hoje, 08:35",
    reason: "Checklist de privacidade para assinatura do MSA.",
    documentType: "Documento privado",
    reviewTag: null,
    ndaAcceptedAt: null,
  },
];

export const defaultAccessManagementState: AccessManagementState = {
  pendingRequests: [],
  accessGrants: [],
  deniedRequests: [],
  stats: {
    pending: 0,
    active: 0,
    expiring: 0,
    auditEvents: 0,
  },
};
