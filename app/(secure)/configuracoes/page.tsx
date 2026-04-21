"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import { getIntegrationSlugByName } from "./integration-detail-data";

type SettingsTab = "Organização" | "Usuários" | "Domínio" | "Integrações" | "Políticas do Sistema";

type MemberStatus = "Ativo" | "Pendente" | "Bloqueado";

type Member = {
  initials: string;
  name: string;
  email: string;
  access: string;
  accessClass: string;
  status: MemberStatus;
  statusDot: string;
  scope: string;
  lastSeen: string;
};

type DnsRecord = {
  host: string;
  type: string;
  target: string;
  status: string;
};

type PolicyCard = {
  title: string;
  value: string;
  detail: string;
};

type IntegrationCard = {
  name: string;
  status: string;
  statusClass: string;
  detail: string;
  owner: string;
};

type IntegrationSetup = {
  title: string;
  subtitle: string;
  endpoint: string;
  authMethod: string;
  eventScope: string;
  destination: string;
  syncWindow: string;
  extraLabel: string;
  extraValue: string;
  connectedApps: string[];
};

const tabs: SettingsTab[] = ["Organização", "Usuários", "Domínio", "Integrações", "Políticas do Sistema"];

const initialMembers: Member[] = [
  {
    initials: "MA",
    name: "Mateus Amaral",
    email: "mateus@axiontrust.io",
    access: "Administrador",
    accessClass: "bg-secondary-container/30 text-on-secondary-container",
    status: "Ativo",
    statusDot: "bg-emerald-500",
    scope: "Conta, aprovações e integrações",
    lastSeen: "Hoje às 10:14",
  },
  {
    initials: "BN",
    name: "Beatriz Nogueira",
    email: "beatriz@axiontrust.io",
    access: "Editor interno",
    accessClass: "bg-surface-variant text-on-surface-variant",
    status: "Ativo",
    statusDot: "bg-emerald-500",
    scope: "Builder, Data Room e FAQs",
    lastSeen: "Hoje às 09:02",
  },
  {
    initials: "RP",
    name: "Ricardo Pereira",
    email: "ricardo@axiontrust.io",
    access: "Visualizador interno",
    accessClass: "bg-surface-variant text-on-surface-variant",
    status: "Pendente",
    statusDot: "bg-amber-500",
    scope: "Leitura de auditorias e exportações",
    lastSeen: "Convite enviado ontem",
  },
];

const organizationFields = [
  ["Razão social", "AXION Tech Group LTDA"],
  ["ID da organização", "AX-7749-BT"],
  ["Responsável principal", "Ricardo Menezes"],
  ["E-mail operacional", "ops@axiontrust.io"],
  ["Segmento", "Enterprise Security / Compliance"],
  ["País-base", "Brasil"],
] as const;

const domainRecords: DnsRecord[] = [
  { host: "trust.axiontech.com.br", type: "CNAME", target: "cname.axiontrust.app", status: "Propagado" },
  { host: "verify.axiontech.com.br", type: "TXT", target: "axion-site-verification=7ae29d", status: "Validado" },
  { host: "_acme-challenge", type: "TXT", target: "ssl-managed-by-axion", status: "Gerenciado" },
];

const integrations: IntegrationCard[] = [
  {
    name: "Webhook de auditoria",
    status: "Ativo",
    statusClass: "text-emerald-500",
    detail: "Envia eventos críticos e trilha de operação para o endpoint interno em tempo real.",
    owner: "Time de Sustentação",
  },
  {
    name: "Notificações por e-mail",
    status: "Ativo",
    statusClass: "text-emerald-500",
    detail: "Entrega alertas de acesso, solicitações de documento e lembretes de revisão.",
    owner: "Operações",
  },
  {
    name: "SIEM / Log export",
    status: "Não configurado",
    statusClass: "text-slate-400",
    detail: "Integração ainda não conectada a Splunk, Datadog ou Stack nativa do cliente.",
    owner: "Segurança",
  },
  {
    name: "SSO corporativo",
    status: "Em validação",
    statusClass: "text-tertiary",
    detail: "Conector SAML preparado para ativação após revisão do domínio e grupos.",
    owner: "IAM",
  },
];

const integrationSetups: Record<string, IntegrationSetup> = {
  "Webhook de auditoria": {
    title: "Webhook de auditoria",
    subtitle: "Use este conector para entregar eventos críticos do AXION Trust para plataformas internas ou middleware do cliente.",
    endpoint: "https://hooks.axiontech.com/auditoria",
    authMethod: "Bearer token",
    eventScope: "Acessos, exportações, publicações e incidentes",
    destination: "Barramento interno de auditoria",
    syncWindow: "Tempo real",
    extraLabel: "Segredo de assinatura",
    extraValue: "whsec_axion_prod_92f1",
    connectedApps: ["Slack", "Jira", "Google Drive"],
  },
  "Notificações por e-mail": {
    title: "Notificações por e-mail",
    subtitle: "Configure remetente, grupos de distribuição e regras de entrega para alertas operacionais da plataforma.",
    endpoint: "smtp.axiontech.io:587",
    authMethod: "SMTP autenticado",
    eventScope: "Solicitações de acesso, alertas e lembretes de revisão",
    destination: "ops@axiontrust.io; security@axiontrust.io",
    syncWindow: "Imediato",
    extraLabel: "Remetente padrão",
    extraValue: "alerts@axiontrust.io",
    connectedApps: ["Google Workspace", "Outlook", "Teams"],
  },
  "SIEM / Log export": {
    title: "SIEM / Log export",
    subtitle: "Centralize logs e eventos do AXION Trust em ferramentas externas para correlação, resposta e trilha forense.",
    endpoint: "https://siem.axiontech.com/collector",
    authMethod: "Token + allowlist de IP",
    eventScope: "Logs administrativos, eventos de autenticação e downloads sensíveis",
    destination: "Splunk / Datadog / Stack nativa",
    syncWindow: "Janela de 5 minutos",
    extraLabel: "Formato de exportação",
    extraValue: "JSON estruturado + metadados de auditoria",
    connectedApps: ["Slack", "Jira", "Google Drive"],
  },
  "SSO corporativo": {
    title: "SSO corporativo",
    subtitle: "Conecte o login do AXION Trust com o provedor de identidade do cliente para controle centralizado de acesso.",
    endpoint: "https://login.microsoftonline.com/saml2",
    authMethod: "SAML 2.0",
    eventScope: "Autenticação de admins, editores e visualizadores",
    destination: "Azure AD / Okta",
    syncWindow: "Sob demanda",
    extraLabel: "Grupo padrão",
    extraValue: "AXION_Trust_Admins",
    connectedApps: ["Azure AD", "Okta", "Google Workspace"],
  },
};

const policies = [
  {
    title: "Validade padrão de acessos",
    value: "1 ano",
    detail: "Permissões concedidas ao Trust Center expiram em 12 meses, com override manual do administrador.",
  },
  {
    title: "Publicação de documentos",
    value: "Aprovação interna obrigatória",
    detail: "Nenhum documento sensível é publicado sem revisão do responsável e registro na trilha de auditoria.",
  },
  {
    title: "Retenção de logs",
    value: "180 dias",
    detail: "Eventos de acesso, exportação e mudanças administrativas ficam disponíveis para auditoria e investigação.",
  },
  {
    title: "Autenticação mínima",
    value: "MFA obrigatório",
    detail: "Perfis administrativos e editores internos precisam autenticar com segundo fator.",
  },
] as const;

function EditableField({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</label>
      <input
        type="text"
        value={value}
        readOnly={!editing}
        onChange={(event) => onChange?.(event.target.value)}
        className={`w-full rounded-lg p-3 text-on-surface outline-none transition-colors ${
          editing
            ? "border border-primary/30 bg-surface-container-lowest focus:border-primary"
            : "border-none bg-surface-container-low"
        }`}
      />
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: SettingsTab;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 text-sm transition-colors ${
        active
          ? "border-b-2 border-primary font-bold text-primary"
          : "font-medium text-on-surface-variant hover:text-on-surface"
      }`}
    >
      {label}
    </button>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getAccessClass(access: string) {
  if (access === "Administrador") {
    return "bg-secondary-container/30 text-on-secondary-container";
  }

  return "bg-surface-variant text-on-surface-variant";
}

function getStatusDot(status: MemberStatus) {
  if (status === "Ativo") return "bg-emerald-500";
  if (status === "Pendente") return "bg-amber-500";
  return "bg-rose-500";
}

export default function ConfiguracoesPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>("Organização");
  const [isEditingOrganization, setIsEditingOrganization] = useState(false);
  const [isEditingDomain, setIsEditingDomain] = useState(false);
  const [isEditingPolicies, setIsEditingPolicies] = useState(false);
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMemberEmail, setEditingMemberEmail] = useState<string | null>(null);
  const [openMemberActionsEmail, setOpenMemberActionsEmail] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    access: "Editor interno",
    scope: "",
    status: "Pendente" as MemberStatus,
  });
  const [organizationForm, setOrganizationForm] = useState<Record<(typeof organizationFields)[number][0], string>>({
    "Razão social": "AXION Tech Group LTDA",
    "ID da organização": "AX-7749-BT",
    "Responsável principal": "Ricardo Menezes",
    "E-mail operacional": "ops@axiontrust.io",
    Segmento: "Enterprise Security / Compliance",
    "País-base": "Brasil",
  });
  const [domainForm, setDomainForm] = useState({
    "Domínio principal": "trust.axiontech.com.br",
    Status: "Propagado e protegido por SSL gerenciado",
    "Última verificação": "Hoje às 13:48",
    Ambiente: "Produção pública",
  });
  const [dnsRecords, setDnsRecords] = useState(
    domainRecords.map((record) => ({
      ...record,
    })),
  );
  const [integrationCards, setIntegrationCards] = useState<IntegrationCard[]>(
    integrations.map((integration) => ({
      ...integration,
    })),
  );
  const [editingIntegrationName, setEditingIntegrationName] = useState<string | null>(null);
  const [integrationForm, setIntegrationForm] = useState<IntegrationCard>({
    name: "",
    status: "",
    statusClass: "text-emerald-500",
    detail: "",
    owner: "",
  });
  const [integrationSetupForm, setIntegrationSetupForm] = useState<IntegrationSetup>({
    title: "",
    subtitle: "",
    endpoint: "",
    authMethod: "",
    eventScope: "",
    destination: "",
    syncWindow: "",
    extraLabel: "",
    extraValue: "",
    connectedApps: [],
  });
  const [integrationAppsInput, setIntegrationAppsInput] = useState("");
  const [policyCards, setPolicyCards] = useState<PolicyCard[]>(policies.map((policy) => ({ ...policy })));
  const [additionalControls, setAdditionalControls] = useState<PolicyCard[]>([
    {
      title: "Acesso de terceiros",
      value: "Sempre vinculado a recurso e empresa",
      detail: "Solicitações sem escopo definido não podem ser aprovadas nem publicadas.",
    },
    {
      title: "Exportações sensíveis",
      value: "Registradas para auditoria",
      detail: "Toda exportação de relatório, evidência ou histórico gera evento na Central de Atividades.",
    },
  ]);

  function handleOrganizationFieldChange(label: (typeof organizationFields)[number][0], value: string) {
    setOrganizationForm((current) => ({
      ...current,
      [label]: value,
    }));
  }

  function handleToggleOrganizationEdit() {
    setIsEditingOrganization(true);
  }

  function handleSaveOrganization() {
    setIsEditingOrganization(false);
  }

  function handleDomainFieldChange(field: keyof typeof domainForm, value: string) {
    setDomainForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleToggleDomainEdit() {
    setIsEditingDomain(true);
  }

  function handleSaveDomain() {
    setIsEditingDomain(false);
  }

  function handleTogglePoliciesEdit() {
    setIsEditingPolicies(true);
  }

  function handleSavePolicies() {
    setIsEditingPolicies(false);
  }

  function openIntegrationModal(integration: IntegrationCard) {
    setEditingIntegrationName(integration.name);
    setIntegrationForm({ ...integration });
    const setup = integrationSetups[integration.name] ?? {
      title: integration.name,
      subtitle: integration.detail,
      endpoint: "",
      authMethod: "",
      eventScope: "",
      destination: "",
      syncWindow: "",
      extraLabel: "Parâmetro adicional",
      extraValue: "",
      connectedApps: [],
    };
    setIntegrationSetupForm({ ...setup });
    setIntegrationAppsInput(setup.connectedApps.join(", "));
    setIsIntegrationModalOpen(true);
  }

  function closeIntegrationModal() {
    setIsIntegrationModalOpen(false);
    setEditingIntegrationName(null);
  }

  function handleIntegrationFieldChange(field: keyof IntegrationCard, value: string) {
    setIntegrationForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleIntegrationSetupFieldChange(field: keyof IntegrationSetup, value: string) {
    setIntegrationSetupForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSaveIntegration() {
    if (!editingIntegrationName) {
      return;
    }

    const statusClass =
      integrationForm.status === "Ativo"
        ? "text-emerald-500"
        : integrationForm.status === "Em validação"
          ? "text-tertiary"
          : "text-slate-400";

    setIntegrationCards((current) =>
      current.map((item) =>
        item.name === editingIntegrationName
          ? {
              ...integrationForm,
              statusClass,
            }
          : item,
      ),
    );

    integrationSetups[editingIntegrationName] = {
      ...integrationSetupForm,
      connectedApps: integrationAppsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    closeIntegrationModal();
  }

  function openAddMemberModal() {
    setEditingMemberEmail(null);
    setMemberForm({
      name: "",
      email: "",
      access: "Editor interno",
      scope: "",
      status: "Pendente",
    });
    setIsMemberModalOpen(true);
  }

  function openEditMemberModal(member: Member) {
    setEditingMemberEmail(member.email);
    setMemberForm({
      name: member.name,
      email: member.email,
      access: member.access,
      scope: member.scope,
      status: member.status,
    });
    setIsMemberModalOpen(true);
  }

  function closeMemberModal() {
    setIsMemberModalOpen(false);
    setEditingMemberEmail(null);
  }

  function handleMemberFieldChange(field: keyof typeof memberForm, value: string) {
    setMemberForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSaveMember() {
    const name = memberForm.name.trim();
    const email = memberForm.email.trim().toLowerCase();
    const scope = memberForm.scope.trim();

    if (!name || !email || !scope) {
      return;
    }

    const nextMember: Member = {
      initials: getInitials(name),
      name,
      email,
      access: memberForm.access,
      accessClass: getAccessClass(memberForm.access),
      status: memberForm.status,
      statusDot: getStatusDot(memberForm.status),
      scope,
      lastSeen: memberForm.status === "Pendente" ? "Convite enviado agora" : "Atualizado agora",
    };

    setMembers((current) => {
      if (editingMemberEmail) {
        return current.map((member) => (member.email === editingMemberEmail ? nextMember : member));
      }

      return [nextMember, ...current];
    });

    closeMemberModal();
  }

  function handleToggleMemberStatus(member: Member) {
    const nextStatus: MemberStatus = member.status === "Bloqueado" || member.status === "Pendente" ? "Ativo" : "Bloqueado";

    setMembers((current) =>
      current.map((item) =>
        item.email === member.email
          ? {
              ...item,
              status: nextStatus,
              statusDot: getStatusDot(nextStatus),
              lastSeen: nextStatus === "Bloqueado" ? "Bloqueado agora" : "Reativado agora",
            }
          : item,
      ),
    );
    setOpenMemberActionsEmail(null);
  }

  const occupiedLicenses = members.length;
  const adminMembers = members.filter((member) => member.access === "Administrador").length;
  const pendingMembers = members.filter((member) => member.status === "Pendente").length;

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "integracoes") {
      setActiveTab("Integrações");
      return;
    }

    if (tab === "organizacao") {
      setActiveTab("Organização");
      return;
    }

    if (tab === "usuarios") {
      setActiveTab("Usuários");
      return;
    }

    if (tab === "dominio") {
      setActiveTab("Domínio");
      return;
    }

    if (tab === "politicas") {
      setActiveTab("Políticas do Sistema");
    }
  }, [searchParams]);

  return (
    <>
      <SecureTopbar placeholder="Pesquisar configurações internas..." />

      <main className="min-h-screen p-8">
        <header className="mb-10">
          <h2 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-white">Configurações da Conta</h2>
          <p className="max-w-2xl text-on-surface-variant">
            Gerencie estrutura da conta, equipe, domínio, integrações e regras internas da operação. A aparência da página pública do Trust é configurada no Builder do Trust Center.
          </p>
        </header>

        <div className="mb-10 flex gap-8 overflow-x-auto border-b border-outline-variant/10">
          {tabs.map((tab) => (
            <TabButton key={tab} label={tab} active={tab === activeTab} onClick={() => setActiveTab(tab)} />
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {activeTab === "Organização" ? (
              <>
                <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="mb-1 font-headline text-xl font-bold text-white">Organização</h3>
                      <p className="text-sm text-on-surface-variant">Dados operacionais da conta, identificação da empresa e owners responsáveis pela operação.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isEditingOrganization ? (
                        <button
                          onClick={handleSaveOrganization}
                          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Salvar
                        </button>
                      ) : (
                        <button
                          onClick={handleToggleOrganizationEdit}
                          className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                        >
                          Editar
                        </button>
                      )}
                      <span className="material-symbols-outlined text-3xl text-primary/20">apartment</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {organizationFields.map(([label]) => (
                      <EditableField
                        key={label}
                        label={label}
                        value={organizationForm[label]}
                        editing={isEditingOrganization}
                        onChange={(value) => handleOrganizationFieldChange(label, value)}
                      />
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="mb-1 font-headline text-xl font-bold text-white">Governança da conta</h3>
                      <p className="text-sm text-on-surface-variant">Visão rápida dos responsáveis internos e das regras-base que sustentam a operação do cliente.</p>
                    </div>
                    <span className="material-symbols-outlined text-3xl text-primary/20">domain_verification</span>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl bg-surface-container-low p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Owner executivo</p>
                      <p className="mt-2 text-sm font-semibold text-white">{organizationForm["Responsável principal"]}</p>
                      <p className="mt-2 text-xs text-on-surface-variant">Responsável por aprovações de alto impacto e direção do ambiente.</p>
                    </div>
                    <div className="rounded-xl bg-surface-container-low p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Operação ativa</p>
                      <p className="mt-2 text-sm font-semibold text-white">Trust Center + Data Room + Due Diligence</p>
                      <p className="mt-2 text-xs text-on-surface-variant">Módulos produtivos usados pelo time interno e por terceiros convidados.</p>
                    </div>
                    <div className="rounded-xl bg-surface-container-low p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Região principal</p>
                      <p className="mt-2 text-sm font-semibold text-white">São Paulo / {organizationForm["País-base"]}</p>
                      <p className="mt-2 text-xs text-on-surface-variant">Base operacional usada para comunicação, auditoria e registros contratuais.</p>
                    </div>
                  </div>
                </section>
              </>
            ) : null}

            {activeTab === "Usuários" ? (
              <>
                <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="mb-1 font-headline text-xl font-bold text-white">Usuários e permissões</h3>
                      <p className="text-sm text-on-surface-variant">Gerencie quem pode operar a conta, revisar documentos, aprovar acessos e administrar o Trust.</p>
                    </div>
                    <button
                      onClick={openAddMemberModal}
                      className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Adicionar membro
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-outline-variant/10 text-xs uppercase tracking-widest text-slate-500">
                          <th className="pb-4 font-bold">Usuário</th>
                          <th className="pb-4 font-bold">Acesso</th>
                          <th className="pb-4 font-bold">Escopo</th>
                          <th className="pb-4 font-bold">Status</th>
                          <th className="pb-4 text-right font-bold">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/5">
                        {members.map((member) => (
                          <tr key={member.email} className="group transition-colors hover:bg-white/[0.02]">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary">
                                  {member.initials}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-white">{member.name}</div>
                                  <div className="text-[10px] text-slate-500">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-tighter ${member.accessClass}`}>
                                {member.access}
                              </span>
                            </td>
                            <td className="py-4 text-xs text-on-surface-variant">{member.scope}</td>
                            <td className="py-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <div className={`h-1.5 w-1.5 rounded-full ${member.statusDot}`} />
                                  <span className="text-xs text-slate-400">{member.status}</span>
                                </div>
                                <span className="text-[10px] text-slate-500">{member.lastSeen}</span>
                              </div>
                            </td>
                            <td className="relative py-4 text-right">
                              <button
                                onClick={() =>
                                  setOpenMemberActionsEmail((current) =>
                                    current === member.email ? null : member.email,
                                  )
                                }
                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-surface-container-low hover:text-white"
                                aria-label={`Abrir ações de ${member.name}`}
                              >
                                <span className="material-symbols-outlined">more_vert</span>
                              </button>

                              {openMemberActionsEmail === member.email ? (
                                <div className="absolute right-0 top-12 z-20 min-w-[11rem] rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-2 shadow-panel">
                                  <button
                                    onClick={() => {
                                      openEditMemberModal(member);
                                      setOpenMemberActionsEmail(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
                                  >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    Editar usuário
                                  </button>
                                  <button
                                    onClick={() => handleToggleMemberStatus(member)}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-surface-container-low ${
                                      member.status === "Bloqueado" || member.status === "Pendente"
                                        ? "text-primary"
                                        : "text-rose-700"
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      {member.status === "Bloqueado" || member.status === "Pendente"
                                        ? "check_circle"
                                        : "block"}
                                    </span>
                                    {member.status === "Bloqueado" || member.status === "Pendente"
                                      ? "Ativar usuário"
                                      : "Bloquear usuário"}
                                  </button>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Licenças ocupadas</p>
                    <p className="mt-3 text-3xl font-headline font-extrabold text-white">{occupiedLicenses} / 20</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Ainda há espaço para times de compliance, jurídico e sustentação.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Perfis administrativos</p>
                    <p className="mt-3 text-3xl font-headline font-extrabold text-white">{adminMembers}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Apenas dois usuários podem alterar políticas, domínio e integrações críticas.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Convites pendentes</p>
                    <p className="mt-3 text-3xl font-headline font-extrabold text-tertiary">{pendingMembers}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Convites não aceitos ainda não liberam acesso operacional à conta.</p>
                  </div>
                </section>
              </>
            ) : null}

            {activeTab === "Domínio" ? (
              <>
                <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="mb-1 font-headline text-xl font-bold text-white">Domínio do Trust Center</h3>
                      <p className="text-sm text-on-surface-variant">Informações de publicação, SSL, propagação e registros necessários para manter o endereço público operando.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isEditingDomain ? (
                        <button
                          onClick={handleSaveDomain}
                          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Salvar
                        </button>
                      ) : (
                        <button
                          onClick={handleToggleDomainEdit}
                          className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                        >
                          Editar
                        </button>
                      )}
                      <span className="material-symbols-outlined text-3xl text-primary/20">language</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <EditableField
                      label="Domínio principal"
                      value={domainForm["Domínio principal"]}
                      editing={isEditingDomain}
                      onChange={(value) => handleDomainFieldChange("Domínio principal", value)}
                    />
                    <EditableField
                      label="Status"
                      value={domainForm.Status}
                      editing={isEditingDomain}
                      onChange={(value) => handleDomainFieldChange("Status", value)}
                    />
                    <EditableField
                      label="Última verificação"
                      value={domainForm["Última verificação"]}
                      editing={isEditingDomain}
                      onChange={(value) => handleDomainFieldChange("Última verificação", value)}
                    />
                    <EditableField
                      label="Ambiente"
                      value={domainForm.Ambiente}
                      editing={isEditingDomain}
                      onChange={(value) => handleDomainFieldChange("Ambiente", value)}
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="mb-1 font-headline text-xl font-bold text-white">Registros DNS monitorados</h3>
                      <p className="text-sm text-on-surface-variant">Itens relevantes para publicação do site, validação de domínio e renovação automática do certificado.</p>
                    </div>
                    <button
                      onClick={() => setIsDnsModalOpen(true)}
                      className="rounded-xl bg-surface-container-low px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                    >
                      Configurar DNS
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dnsRecords.map((record) => (
                      <div key={`${record.host}-${record.type}`} className="grid grid-cols-1 gap-3 rounded-xl bg-surface-container-low p-4 md:grid-cols-[1.5fr,120px,1.5fr,140px] md:items-center">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Host</p>
                          <p className="mt-1 font-mono text-sm text-white">{record.host}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Tipo</p>
                          <p className="mt-1 text-sm text-white">{record.type}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Destino</p>
                          <p className="mt-1 font-mono text-sm text-white">{record.target}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Status</p>
                          <p className="mt-1 text-sm font-semibold text-emerald-500">{record.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : null}

            {activeTab === "Integrações" ? (
              <>
                <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="mb-1 font-headline text-xl font-bold text-white">Integrações da conta</h3>
                      <p className="text-sm text-on-surface-variant">Conectores que suportam auditoria, entrega de alertas, identidade e exportação operacional.</p>
                    </div>
                    <span className="material-symbols-outlined text-3xl text-primary/20">hub</span>
                  </div>

                  <div className="space-y-4">
                    {integrationCards.map((integration) => (
                      <div key={integration.name} className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-white">{integration.name}</h4>
                            <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">{integration.detail}</p>
                          </div>
                          <span className={`text-sm font-semibold ${integration.statusClass}`}>{integration.status}</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                          <span>Owner interno: {integration.owner}</span>
                          <Link
                            href={`/configuracoes/integracoes/${getIntegrationSlugByName(integration.name) ?? "webhook-auditoria"}`}
                            className="font-bold text-primary transition-colors hover:text-white"
                          >
                            Gerenciar integração
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Ativas</p>
                    <p className="mt-3 text-3xl font-headline font-extrabold text-emerald-500">2</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Conectores já enviando ou recebendo dados de produção.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Em validação</p>
                    <p className="mt-3 text-3xl font-headline font-extrabold text-tertiary">1</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Integrações com setup iniciado, mas ainda não homologadas para produção.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Não configuradas</p>
                    <p className="mt-3 text-3xl font-headline font-extrabold text-slate-300">1</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Oportunidades de conexão ainda sem endpoint, credenciais ou homologação.</p>
                  </div>
                </section>
              </>
            ) : null}

            {activeTab === "Políticas do Sistema" ? (
              <>
                <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="mb-1 font-headline text-xl font-bold text-white">Políticas do sistema</h3>
                      <p className="text-sm text-on-surface-variant">Regras globais que governam publicação, acesso, autenticação e retenção dentro da plataforma.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isEditingPolicies ? (
                        <button
                          onClick={handleSavePolicies}
                          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Salvar
                        </button>
                      ) : (
                        <button
                          onClick={handleTogglePoliciesEdit}
                          className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                        >
                          Editar
                        </button>
                      )}
                      <span className="material-symbols-outlined text-3xl text-primary/20">settings_suggest</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {policyCards.map((policy, index) => (
                      <div key={policy.title} className="rounded-xl bg-surface-container-low p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{policy.title}</p>
                        {isEditingPolicies ? (
                          <div className="mt-3 space-y-3">
                            <input
                              type="text"
                              value={policy.value}
                              onChange={(event) =>
                                setPolicyCards((current) =>
                                  current.map((item, currentIndex) =>
                                    currentIndex === index ? { ...item, value: event.target.value } : item,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-sm font-semibold text-on-surface outline-none focus:border-primary"
                            />
                            <textarea
                              rows={3}
                              value={policy.detail}
                              onChange={(event) =>
                                setPolicyCards((current) =>
                                  current.map((item, currentIndex) =>
                                    currentIndex === index ? { ...item, detail: event.target.value } : item,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-xs text-on-surface outline-none focus:border-primary"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="mt-2 text-sm font-semibold text-white">{policy.value}</p>
                            <p className="mt-2 text-xs text-on-surface-variant">{policy.detail}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
                  <div className="mb-6">
                    <h3 className="mb-1 font-headline text-xl font-bold text-white">Controles adicionais</h3>
                    <p className="text-sm text-on-surface-variant">Itens que impactam o comportamento geral da plataforma e a governança de risco.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {additionalControls.map((control, index) => (
                      <div key={control.title} className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{control.title}</p>
                        {isEditingPolicies ? (
                          <div className="mt-3 space-y-3">
                            <input
                              type="text"
                              value={control.value}
                              onChange={(event) =>
                                setAdditionalControls((current) =>
                                  current.map((item, currentIndex) =>
                                    currentIndex === index ? { ...item, value: event.target.value } : item,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-sm font-semibold text-on-surface outline-none focus:border-primary"
                            />
                            <textarea
                              rows={3}
                              value={control.detail}
                              onChange={(event) =>
                                setAdditionalControls((current) =>
                                  current.map((item, currentIndex) =>
                                    currentIndex === index ? { ...item, detail: event.target.value } : item,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-xs text-on-surface outline-none focus:border-primary"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="mt-2 text-sm font-semibold text-white">{control.value}</p>
                            <p className="mt-2 text-xs text-on-surface-variant">{control.detail}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : null}
          </div>

          <aside className="space-y-6">
            {activeTab === "Organização" ? (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
                  <div className="h-24 bg-gradient-to-r from-primary/20 to-secondary/10" />
                  <div className="-mt-10 px-6 pb-6">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl border-4 border-surface-container-high bg-surface-container-lowest shadow-2xl">
                      <span className="material-symbols-outlined text-3xl text-primary">business</span>
                    </div>
                    <h4 className="text-lg font-bold text-white">{organizationForm["Razão social"]}</h4>
                    <p className="text-sm text-slate-400">ID: {organizationForm["ID da organização"]}</p>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Membros</span>
                        <span className="font-semibold text-on-surface">12 / 20</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-lowest">
                        <div className="h-full w-[60%] bg-primary" />
                      </div>
                      <div className="flex items-center justify-between pt-2 text-xs">
                        <span className="text-slate-500">Trust Center</span>
                        <span className="font-semibold text-emerald-500">Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">assignment_ind</span>
                    <h4 className="text-sm font-bold text-white">Resumo executivo</h4>
                  </div>
                  <div className="space-y-3 text-sm text-on-surface-variant">
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Operação principal</span>
                      <span className="font-semibold text-white">Enterprise Security</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Base contratual</span>
                      <span className="font-semibold text-white">Brasil</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Owner da conta</span>
                      <span className="font-semibold text-white">{organizationForm["Responsável principal"]}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {activeTab === "Usuários" ? (
              <>
                <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">groups</span>
                    <h4 className="text-sm font-bold text-white">Resumo de acesso</h4>
                  </div>
                  <div className="space-y-3 text-sm text-on-surface-variant">
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Administradores</span>
                      <span className="font-semibold text-white">2</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Editores internos</span>
                      <span className="font-semibold text-white">6</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Visualizadores</span>
                      <span className="font-semibold text-white">4</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
                  <h4 className="mb-2 text-sm font-bold text-white">Boas práticas</h4>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    Mantenha poucos administradores, use MFA obrigatório e remova convites pendentes que não serão mais utilizados.
                  </p>
                </div>
              </>
            ) : null}

            {activeTab === "Domínio" ? (
              <>
                <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <h4 className="text-sm font-bold text-white">Saúde do domínio</h4>
                  </div>
                  <div className="space-y-3 text-sm text-on-surface-variant">
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>SSL</span>
                      <span className="font-semibold text-emerald-500">Ativo</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Propagação</span>
                      <span className="font-semibold text-emerald-500">Concluída</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Verificação</span>
                      <span className="font-semibold text-white">Domínio validado</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
                  <h4 className="mb-2 text-sm font-bold text-white">Orientação operacional</h4>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    Altere o DNS apenas quando necessário e preserve os registros de verificação e SSL para evitar indisponibilidade pública.
                  </p>
                </div>
              </>
            ) : null}

            {activeTab === "Integrações" ? (
              <>
                <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">lan</span>
                    <h4 className="text-sm font-bold text-white">Cobertura atual</h4>
                  </div>
                  <div className="space-y-3 text-sm text-on-surface-variant">
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Auditoria</span>
                      <span className="font-semibold text-emerald-500">Conectada</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Alertas</span>
                      <span className="font-semibold text-emerald-500">Conectados</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>SIEM</span>
                      <span className="font-semibold text-slate-400">Pendente</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
                  <h4 className="mb-2 text-sm font-bold text-white">Próximo melhor passo</h4>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    Conectar o SIEM centraliza incidentes, exportações sensíveis e mudanças administrativas em uma trilha única.
                  </p>
                </div>
              </>
            ) : null}

            {activeTab === "Políticas do Sistema" ? (
              <>
                <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">policy</span>
                    <h4 className="text-sm font-bold text-white">Impacto operacional</h4>
                  </div>
                  <div className="space-y-3 text-sm text-on-surface-variant">
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Acesso padrão</span>
                      <span className="font-semibold text-white">12 meses</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Logs</span>
                      <span className="font-semibold text-white">180 dias</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                      <span>Publicação</span>
                      <span className="font-semibold text-white">Com aprovação</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
                  <h4 className="mb-2 text-sm font-bold text-white">Leitura recomendada</h4>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    Revise primeiro autenticação, publicação e retenção. São as políticas com maior impacto na segurança percebida pelo cliente.
                  </p>
                </div>
              </>
            ) : null}

            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
              <div className="relative z-10">
                <h4 className="mb-2 text-sm font-bold text-white">Precisa de ajuda?</h4>
                <p className="mb-4 text-xs leading-relaxed text-on-surface-variant">
                  Fale com nosso time para ajustar equipe, domínio, integrações e políticas da sua conta com segurança.
                </p>
                <a className="flex items-center gap-2 text-xs font-bold text-primary transition-all hover:gap-3" href="#">
                  Abrir chamado de suporte
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-7xl text-primary/5">support_agent</span>
            </div>
          </aside>
        </div>

        <footer className="sticky bottom-8 mt-12 flex items-center justify-between rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="material-symbols-outlined text-sm">history</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Última alteração: hoje às 14:32</span>
          </div>
        </footer>
      </main>

      {isMemberModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/70 backdrop-blur-sm" onClick={closeMemberModal} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="flex items-start justify-between border-b border-outline-variant/10 p-8">
              <div>
                <h3 className="font-headline text-2xl font-extrabold text-white">
                  {editingMemberEmail ? "Editar membro" : "Adicionar membro"}
                </h3>
                <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
                  Defina nome, e-mail, nível de acesso, escopo operacional e status inicial do usuário.
                </p>
              </div>
              <button
                onClick={closeMemberModal}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-surface-container-low hover:text-white"
                aria-label="Fechar modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
              <EditableField label="Nome completo" value={memberForm.name} editing onChange={(value) => handleMemberFieldChange("name", value)} />
              <EditableField label="E-mail" value={memberForm.email} editing onChange={(value) => handleMemberFieldChange("email", value)} />

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nível de acesso</label>
                <select
                  value={memberForm.access}
                  onChange={(event) => handleMemberFieldChange("access", event.target.value)}
                  className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary"
                >
                  <option>Administrador</option>
                  <option>Editor interno</option>
                  <option>Visualizador interno</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status inicial</label>
                <select
                  value={memberForm.status}
                  onChange={(event) => handleMemberFieldChange("status", event.target.value as MemberStatus)}
                  className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Bloqueado">Bloqueado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Escopo operacional</label>
                <textarea
                  rows={4}
                  value={memberForm.scope}
                  onChange={(event) => handleMemberFieldChange("scope", event.target.value)}
                  className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary"
                  placeholder="Ex.: Builder, Data Room, aprovações de acesso e auditorias."
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/40 px-8 py-6">
              <p className="text-xs text-on-surface-variant">
                Perfis administrativos devem ser concedidos apenas a owners com responsabilidade operacional.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeMemberModal}
                  className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveMember}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {editingMemberEmail ? "Salvar alterações" : "Adicionar membro"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isDnsModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/70 backdrop-blur-sm" onClick={() => setIsDnsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-4xl rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="flex items-start justify-between border-b border-outline-variant/10 p-8">
              <div>
                <h3 className="font-headline text-2xl font-extrabold text-white">Configurar DNS</h3>
                <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
                  Ajuste os registros monitorados para publicação do Trust Center, verificação do domínio e manutenção do SSL.
                </p>
              </div>
              <button
                onClick={() => setIsDnsModalOpen(false)}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-surface-container-low hover:text-white"
                aria-label="Fechar modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 p-8">
              {dnsRecords.map((record, index) => (
                <div
                  key={`${record.host}-${index}`}
                  className="grid grid-cols-1 gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-low p-4 md:grid-cols-[1.3fr,140px,1.5fr,160px]"
                >
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Host</label>
                    <input
                      type="text"
                      value={record.host}
                      onChange={(event) =>
                        setDnsRecords((current) =>
                          current.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, host: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tipo</label>
                    <input
                      type="text"
                      value={record.type}
                      onChange={(event) =>
                        setDnsRecords((current) =>
                          current.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, type: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Destino</label>
                    <input
                      type="text"
                      value={record.target}
                      onChange={(event) =>
                        setDnsRecords((current) =>
                          current.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, target: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</label>
                    <input
                      type="text"
                      value={record.status}
                      onChange={(event) =>
                        setDnsRecords((current) =>
                          current.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, status: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/40 px-8 py-6">
              <p className="text-xs text-on-surface-variant">
                Alterações de DNS devem ser aplicadas com cuidado para evitar impacto no domínio público.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDnsModalOpen(false)}
                  className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIsDnsModalOpen(false)}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Salvar registros
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isIntegrationModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/70 backdrop-blur-sm" onClick={closeIntegrationModal} />
          <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="flex items-start justify-between border-b border-outline-variant/10 p-8">
              <div>
                <h3 className="font-headline text-2xl font-extrabold text-white">Gerenciar integração</h3>
                <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
                  Configure os parâmetros necessários para conectar a ferramenta do cliente ao AXION Trust com segurança e rastreabilidade.
                </p>
              </div>
              <button
                onClick={closeIntegrationModal}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-surface-container-low hover:text-white"
                aria-label="Fechar modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 p-8 xl:grid-cols-[1.35fr,0.85fr]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <EditableField
                    label="Nome da integração"
                    value={integrationForm.name}
                    editing
                    onChange={(value) => handleIntegrationFieldChange("name", value)}
                  />
                  <EditableField
                    label="Owner interno"
                    value={integrationForm.owner}
                    editing
                    onChange={(value) => handleIntegrationFieldChange("owner", value)}
                  />

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</label>
                    <select
                      value={integrationForm.status}
                      onChange={(event) => handleIntegrationFieldChange("status", event.target.value)}
                      className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary"
                    >
                      <option>Ativo</option>
                      <option>Em validação</option>
                      <option>Não configurado</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Descrição operacional</label>
                    <textarea
                      rows={3}
                      value={integrationForm.detail}
                      onChange={(event) => handleIntegrationFieldChange("detail", event.target.value)}
                      className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
                  <div className="mb-5">
                    <h4 className="text-lg font-bold text-white">{integrationSetupForm.title}</h4>
                    <p className="mt-1 text-sm text-on-surface-variant">{integrationSetupForm.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <EditableField
                      label="Endpoint / URL"
                      value={integrationSetupForm.endpoint}
                      editing
                      onChange={(value) => handleIntegrationSetupFieldChange("endpoint", value)}
                    />
                    <EditableField
                      label="Autenticação"
                      value={integrationSetupForm.authMethod}
                      editing
                      onChange={(value) => handleIntegrationSetupFieldChange("authMethod", value)}
                    />
                    <EditableField
                      label="Destino"
                      value={integrationSetupForm.destination}
                      editing
                      onChange={(value) => handleIntegrationSetupFieldChange("destination", value)}
                    />
                    <EditableField
                      label="Janela de sincronização"
                      value={integrationSetupForm.syncWindow}
                      editing
                      onChange={(value) => handleIntegrationSetupFieldChange("syncWindow", value)}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Escopo de eventos</label>
                      <textarea
                        rows={3}
                        value={integrationSetupForm.eventScope}
                        onChange={(event) => handleIntegrationSetupFieldChange("eventScope", event.target.value)}
                        className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-sm text-on-surface outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">{integrationSetupForm.extraLabel}</label>
                      <textarea
                        rows={3}
                        value={integrationSetupForm.extraValue}
                        onChange={(event) => handleIntegrationSetupFieldChange("extraValue", event.target.value)}
                        className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-sm text-on-surface outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Apps e destinos conectáveis
                    </label>
                    <input
                      type="text"
                      value={integrationAppsInput}
                      onChange={(event) => setIntegrationAppsInput(event.target.value)}
                      className="w-full rounded-lg border border-primary/30 bg-surface-container-lowest p-3 text-sm text-on-surface outline-none focus:border-primary"
                      placeholder="Ex.: Slack, Jira, Google Drive"
                    />
                    <p className="mt-2 text-[11px] text-on-surface-variant">
                      Separe múltiplos destinos por vírgula para deixar a integração preparada para mais de uma ferramenta.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-100/50 bg-surface-container-low p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Resumo de setup</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl bg-surface-container-lowest p-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Endpoint</p>
                      <p className="mt-1 break-all font-mono text-on-surface">{integrationSetupForm.endpoint || "Não definido"}</p>
                    </div>
                    <div className="rounded-xl bg-surface-container-lowest p-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Autenticação</p>
                      <p className="mt-1 text-on-surface">{integrationSetupForm.authMethod || "Não definida"}</p>
                    </div>
                    <div className="rounded-xl bg-surface-container-lowest p-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Destino operacional</p>
                      <p className="mt-1 text-on-surface">{integrationSetupForm.destination || "Não definido"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Ferramentas suportadas</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {integrationAppsInput
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((app) => (
                        <span key={app} className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-primary">
                          {app}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100/50 bg-surface-container-low p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Leitura recomendada</p>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    Priorize endpoint, autenticação, escopo e destinos. Esses quatro pontos já deixam o AXION Trust pronto para integrar alertas, auditoria e exportações com o stack do cliente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/40 px-8 py-6">
              <p className="text-xs text-on-surface-variant">
                Mantenha os owners corretos para facilitar suporte, investigação e responsabilização operacional.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeIntegrationModal}
                  className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveIntegration}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Salvar integração
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
