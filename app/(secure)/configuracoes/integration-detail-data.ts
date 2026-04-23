export type IntegrationDetailField = {
  label: string;
  value: string;
};

export type IntegrationToolCard = {
  name: string;
  purpose: string;
  setup: string;
  configFields: Array<{
    label: string;
    value: string;
  }>;
};

export type IntegrationEventCard = {
  title: string;
  detail: string;
};

export type IntegrationDetail = {
  slug: string;
  listName: string;
  title: string;
  subtitle: string;
  status: string;
  statusClass: string;
  owner: string;
  category: string;
  syncWindow: string;
  primaryFields: IntegrationDetailField[];
  deliveryFields: IntegrationDetailField[];
  tools: IntegrationToolCard[];
  eventCards: IntegrationEventCard[];
  notes: string[];
};

export const integrationDetails: IntegrationDetail[] = [
  {
    slug: "webhook-auditoria",
    listName: "Webhook de auditoria",
    title: "Webhook de Auditoria",
    subtitle:
      "Configure a entrega de eventos críticos do AXION Trust para barramentos internos, middleware de observabilidade e automações do cliente.",
    status: "Ativo",
    statusClass: "text-emerald-500",
    owner: "Time de Sustentação",
    category: "Auditoria e eventos",
    syncWindow: "Tempo real",
    primaryFields: [
      { label: "Endpoint principal", value: "https://example.invalid/webhooks/auditoria" },
      { label: "Método de autenticação", value: "Token demonstrativo" },
      { label: "Segredo de assinatura", value: "whsec_demo_placeholder" },
      { label: "Allowlist de IP", value: "34.112.10.0/24, 34.112.11.0/24" },
    ],
    deliveryFields: [
      { label: "Destino operacional", value: "Barramento interno de auditoria" },
      { label: "Formato de payload", value: "JSON estruturado com metadados e actor context" },
      { label: "Política de retry", value: "3 tentativas com backoff exponencial" },
      { label: "Timeout de resposta", value: "10 segundos" },
    ],
    tools: [
      {
        name: "Slack",
        purpose: "Alertar times de segurança e operação sobre eventos sensíveis.",
        setup: "Receber payload via middleware e reenviar para canal dedicado.",
        configFields: [
          { label: "Webhook do Slack", value: "https://example.invalid/slack/audit" },
          { label: "Canal padrão", value: "#axion-alertas" },
          { label: "Workspace", value: "AXION Security Ops" },
        ],
      },
      {
        name: "Jira",
        purpose: "Abrir tickets automáticos para incidentes e revisões críticas.",
        setup: "Mapear severidade e tipo de evento para projeto e workflow.",
        configFields: [
          { label: "URL do projeto", value: "https://axiontrust.atlassian.net/jira/software/c/projects/SOC" },
          { label: "Project key", value: "SOC" },
          { label: "Issue type padrão", value: "Incidente" },
        ],
      },
      {
        name: "Google Drive",
        purpose: "Arquivar exportações e trilhas de auditoria compartilháveis.",
        setup: "Persistir anexos e relatórios gerados com pasta e owner definidos.",
        configFields: [
          { label: "Pasta destino", value: "Drive Compartilhado / AXION Audit Trail" },
          { label: "Owner da pasta", value: "ops@axiontrust.io" },
          { label: "Política de retenção", value: "180 dias" },
        ],
      },
    ],
    eventCards: [
      { title: "Acessos e logins", detail: "Sessões iniciadas, falhas, MFA e mudanças administrativas." },
      { title: "Exportações sensíveis", detail: "PDFs, relatórios e downloads de documentos privados." },
      { title: "Publicações", detail: "Mudanças em Trust Center, Data Room e aprovações internas." },
    ],
    notes: [
      "Valide o endpoint com uma chave exclusiva por ambiente.",
      "Use assinatura do payload para garantir integridade do evento recebido.",
      "Defina claramente o owner do destino para facilitar troubleshooting.",
    ],
  },
  {
    slug: "notificacoes-email",
    listName: "Notificações por e-mail",
    title: "Notificações por E-mail",
    subtitle:
      "Organize remetente, distribuição, templates e regras de entrega dos alertas enviados pelo AXION Trust para usuários internos e stakeholders.",
    status: "Ativo",
    statusClass: "text-emerald-500",
    owner: "Operações",
    category: "Alertas e comunicação",
    syncWindow: "Imediato",
    primaryFields: [
      { label: "SMTP / provider", value: "smtp.example.invalid:587" },
      { label: "Remetente padrão", value: "alerts@axiontrust.io" },
      { label: "Reply-to operacional", value: "ops@axiontrust.io" },
      { label: "Domínio autenticado", value: "axiontrust.io (SPF + DKIM válidos)" },
    ],
    deliveryFields: [
      { label: "Lista principal", value: "ops@axiontrust.io; security@axiontrust.io" },
      { label: "Janela de entrega", value: "Tempo real para alertas e 08h/17h para resumos" },
      { label: "Fallback", value: "Reenvio para lista secundária após falha" },
      { label: "Política anti-spam", value: "Rate limit por usuário e agrupamento por evento" },
    ],
    tools: [
      {
        name: "Google Workspace",
        purpose: "Distribuição para grupos internos e caixas compartilhadas.",
        setup: "Configurar remetente validado e grupos por área operacional.",
        configFields: [
          { label: "Grupo primário", value: "security@axiontrust.io" },
          { label: "Grupo secundário", value: "ops@axiontrust.io" },
          { label: "Alias do remetente", value: "alerts@axiontrust.io" },
        ],
      },
      {
        name: "Outlook",
        purpose: "Entrega corporativa em ambientes Microsoft 365.",
        setup: "Garantir allowlist do remetente e roteamento por mailbox team.",
        configFields: [
          { label: "Caixa compartilhada", value: "trust-alerts@axiontrust.io" },
          { label: "Tenant Microsoft", value: "axiontrust-prod" },
          { label: "Política de entrega", value: "Alta prioridade para alertas críticos" },
        ],
      },
      {
        name: "Teams",
        purpose: "Usar e-mail gateway para canais com incidentes críticos.",
        setup: "Enviar alertas de prioridade alta para canal específico.",
        configFields: [
          { label: "Canal", value: "SOC / Incidentes críticos" },
          { label: "Webhook / gateway", value: "teams-ops@axiontrust.io" },
          { label: "Escopo", value: "Somente alertas críticos" },
        ],
      },
    ],
    eventCards: [
      { title: "Solicitações de acesso", detail: "Pedidos de documento privado e permissões para módulos." },
      { title: "Pendências de revisão", detail: "Aprovações, vencimentos e lembretes operacionais." },
      { title: "Incidentes", detail: "Alertas de segurança, bloqueios e anomalias relevantes." },
    ],
    notes: [
      "Separe notificações críticas de resumos operacionais.",
      "Defina remetente e reply-to claros para evitar ruído no suporte.",
      "Revise frequência e agrupamento para não saturar stakeholders.",
    ],
  },
  {
    slug: "siem-log-export",
    listName: "SIEM / Log export",
    title: "SIEM e Exportação de Logs",
    subtitle:
      "Centralize eventos do AXION Trust em plataformas de segurança e analytics para correlação, investigação, retenção e resposta automatizada.",
    status: "Não configurado",
    statusClass: "text-slate-400",
    owner: "Segurança",
    category: "Observabilidade e segurança",
    syncWindow: "Janela de 5 minutos",
    primaryFields: [
      { label: "Collector endpoint", value: "https://example.invalid/siem/collector" },
      { label: "Método de ingestão", value: "HTTPS push + token" },
      { label: "Formato exportado", value: "JSON estruturado + enrichment de auditoria" },
      { label: "Retenção sugerida", value: "180 dias no destino" },
    ],
    deliveryFields: [
      { label: "Plataforma principal", value: "Splunk / Datadog / Stack nativa" },
      { label: "Particionamento", value: "Por empresa, módulo e severidade" },
      { label: "Rotação", value: "Lotes a cada 5 minutos com retry automático" },
      { label: "Chave de correlação", value: "event_id + organization_id + actor_id" },
    ],
    tools: [
      {
        name: "Slack",
        purpose: "Receber alertas correlacionados e incidentes priorizados.",
        setup: "Encadear alertas do SIEM para canal crítico após parsing dos eventos.",
        configFields: [
          { label: "Webhook do Slack", value: "https://example.invalid/slack/siem-alerts" },
          { label: "Canal padrão", value: "#siem-incidentes" },
          { label: "Filtro", value: "Somente eventos críticos e altos" },
        ],
      },
      {
        name: "Jira",
        purpose: "Abrir tickets de incidentes ou hardening com contexto técnico.",
        setup: "Mapear severidade e source module para tipo de issue.",
        configFields: [
          { label: "Project key", value: "SECOPS" },
          { label: "Issue type", value: "Security Incident" },
          { label: "Workflow padrão", value: "Triage > Investigation > Resolved" },
        ],
      },
      {
        name: "Google Drive",
        purpose: "Armazenar exportações consolidadas e relatórios de trilha.",
        setup: "Persistir bundles periódicos com controle de owner e pasta.",
        configFields: [
          { label: "Pasta destino", value: "Drive Compartilhado / SIEM Exports" },
          { label: "Formato", value: "ZIP + JSON + evidências anexas" },
          { label: "Frequência", value: "Diária" },
        ],
      },
    ],
    eventCards: [
      { title: "Autenticação", detail: "Falhas de login, MFA, sessões suspeitas e bloqueios." },
      { title: "Administração", detail: "Mudanças de política, permissões e integrações." },
      { title: "Conteúdo sensível", detail: "Downloads, exportações e acessos a documentos privados." },
    ],
    notes: [
      "Defina chaves de correlação antes de enviar para o SIEM.",
      "Separe eventos transacionais de eventos críticos para reduzir ruído.",
      "Valide retenção, particionamento e dono operacional do destino.",
    ],
  },
  {
    slug: "sso-corporativo",
    listName: "SSO corporativo",
    title: "SSO Corporativo",
    subtitle:
      "Conecte o AXION Trust ao provedor de identidade do cliente para centralizar autenticação, grupos, MFA e governança de acesso.",
    status: "Em validação",
    statusClass: "text-tertiary",
    owner: "IAM",
    category: "Identidade e acesso",
    syncWindow: "Sob demanda",
    primaryFields: [
      { label: "IdP endpoint", value: "https://login.microsoftonline.com/saml2" },
      { label: "Protocolo", value: "SAML 2.0" },
      { label: "Entity ID", value: "axion-trust-enterprise" },
      { label: "Certificado ativo", value: "Certificado X.509 válido até 12/2026" },
    ],
    deliveryFields: [
      { label: "Grupo padrão", value: "AXION_Trust_Admins" },
      { label: "Atributo de e-mail", value: "user.mail" },
      { label: "Atributo de role", value: "groups / role_claim" },
      { label: "Política de provisionamento", value: "Just-in-time + validação de domínio" },
    ],
    tools: [
      {
        name: "Azure AD",
        purpose: "Governança centralizada para contas corporativas Microsoft.",
        setup: "Mapear claims e grupos administrativos para permissões da plataforma.",
        configFields: [
          { label: "Tenant", value: "axiontrust-prod.onmicrosoft.com" },
          { label: "Grupo admin", value: "AXION_Trust_Admins" },
          { label: "Claim principal", value: "user.mail" },
        ],
      },
      {
        name: "Okta",
        purpose: "Federação de acesso para múltiplas unidades e parceiros.",
        setup: "Publicar app SAML e sincronizar grupos permitidos.",
        configFields: [
          { label: "Okta app", value: "AXION Trust Enterprise" },
          { label: "Grupo permitido", value: "okta_axion_trust_users" },
          { label: "Método", value: "SAML 2.0" },
        ],
      },
      {
        name: "Google Workspace",
        purpose: "Login corporativo para organizações com identidade Google.",
        setup: "Ajustar NameID, domínios aceitos e enforce de MFA.",
        configFields: [
          { label: "Domínio aceito", value: "axiontrust.io" },
          { label: "NameID", value: "Primary email" },
          { label: "MFA enforcement", value: "Obrigatório para admins" },
        ],
      },
    ],
    eventCards: [
      { title: "Provisionamento", detail: "Criação e atualização de perfil conforme claims do IdP." },
      { title: "Autenticação", detail: "Login centralizado com MFA e políticas do cliente." },
      { title: "Revogação", detail: "Bloqueio imediato após remoção do grupo ou desativação do usuário." },
    ],
    notes: [
      "Valide claims antes de liberar admins em produção.",
      "Garanta grupo padrão e fallback para owners da conta.",
      "Teste revogação e MFA antes do go-live.",
    ],
  },
];

export function getIntegrationDetailBySlug(slug: string) {
  return integrationDetails.find((detail) => detail.slug === slug);
}

export function getIntegrationSlugByName(name: string) {
  return integrationDetails.find((detail) => detail.listName === name)?.slug;
}
