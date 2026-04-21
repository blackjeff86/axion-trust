export const initialPendingRequests = [
  {
    id: "req-1",
    requester: "Mariana Costa",
    email: "mariana@bancoglobal.com",
    company: "Banco Global",
    document: "SOC_2_Type_II_Report.pdf",
    requestedAt: "Ha 25 min",
    reason: "Validação de controles antes da renovação contratual.",
    documentType: "Documento privado",
    reviewTag: null,
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
  },
];

export const initialApprovedAccesses = [
  {
    id: "acc-1",
    requester: "Amanda Reis",
    email: "amanda@bancoglobal.com",
    company: "Banco Global",
    document: "SOC_2_Type_II_Report.pdf",
    approvedAt: "18/04/2026, 14:02",
    expiresAt: "18/04/2027",
    status: "Ativo",
    statusClass: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "acc-2",
    requester: "Ricardo Nunes",
    email: "ricardo@pineventures.com",
    company: "Pine Ventures",
    document: "Resumo_Pentest_Externos.pdf",
    approvedAt: "15/04/2026, 18:40",
    expiresAt: "15/04/2027",
    status: "Ativo",
    statusClass: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "acc-3",
    requester: "Fernanda Souza",
    email: "fernanda@bancoglobal.com",
    company: "Banco Global",
    document: "SOC_2_Type_II_Report.pdf",
    approvedAt: "16/04/2026, 09:11",
    expiresAt: "16/04/2027",
    status: "Ativo",
    statusClass: "bg-emerald-100 text-emerald-700",
  },
];

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
};

export type ApprovedAccess = (typeof initialApprovedAccesses)[number];

export type DeniedAccess = PendingRequest & {
  deniedAt: string;
};

export const STORAGE_KEY = "axion-trust-gestao-acessos";

export type AccessManagementState = {
  pendingRequests: PendingRequest[];
  approvedAccesses: ApprovedAccess[];
  deniedAccesses: DeniedAccess[];
};

export const defaultAccessManagementState: AccessManagementState = {
  pendingRequests: initialPendingRequests,
  approvedAccesses: initialApprovedAccesses,
  deniedAccesses: [],
};

export function getAccessManagementStateClient(): AccessManagementState {
  if (typeof window === "undefined") {
    return defaultAccessManagementState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultAccessManagementState;
  }

  try {
    const parsed = JSON.parse(raw) as AccessManagementState;

    const hasAnyData =
      (parsed.pendingRequests?.length ?? 0) > 0 ||
      (parsed.approvedAccesses?.length ?? 0) > 0 ||
      (parsed.deniedAccesses?.length ?? 0) > 0;

    return hasAnyData ? parsed : defaultAccessManagementState;
  } catch {
    return defaultAccessManagementState;
  }
}
