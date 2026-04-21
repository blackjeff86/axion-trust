import Link from "next/link";
import { notFound } from "next/navigation";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import { MetricCard } from "@/components/ui/metric-card";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const exportPeriods = [
  { label: "Últimos 7 dias", active: false, icon: null },
  { label: "Últimos 30 dias", active: true, icon: null },
  { label: "Customizado", active: false, icon: "calendar_month" },
];

const exportCategories = [
  { label: "Acessos e Logins", checked: true, accent: false },
  { label: "Manipulação de Documentos", checked: true, accent: false },
  { label: "Incidentes de Segurança", checked: true, accent: true },
  { label: "Configurações de Conta", checked: false, accent: false },
];

const exportFormats = [
  { label: "PDF Premium", icon: "picture_as_pdf", selected: true },
  { label: "CSV (Dados Brutos)", icon: "table_view", selected: false },
  { label: "Microsoft XLSX", icon: "grid_on", selected: false },
];

const auditRows = [
  {
    date: "24 Abr 2026",
    time: "14:32:05 UTC",
    user: "Arthur Lima",
    role: "Super Admin",
    initials: "AL",
    initialsClass: "bg-secondary-container text-on-secondary-container",
    event: "Update_Policy",
    asset: "cluster-aws-prod-01",
    ip: "192.168.1.105",
    status: "Sucesso",
    statusClass: "bg-primary/10 text-primary border-primary/20",
    dotClass: "bg-primary",
  },
  {
    date: "24 Abr 2026",
    time: "14:15:12 UTC",
    user: "Sarah Miller",
    role: "Auditor Interno",
    initials: "SM",
    initialsClass: "bg-tertiary-container/30 text-tertiary",
    event: "Auth_Login",
    asset: "auth-gateway-primary",
    ip: "45.230.12.98",
    status: "Falha",
    statusClass: "bg-error/10 text-error border-error/20",
    dotClass: "bg-error",
  },
  {
    date: "24 Abr 2026",
    time: "13:58:44 UTC",
    user: "John Santos",
    role: "DevOps Eng",
    initials: "JS",
    initialsClass: "bg-primary/20 text-primary",
    event: "Secret_Rotate",
    asset: "vault-core-01",
    ip: "10.0.4.52",
    status: "Sucesso",
    statusClass: "bg-primary/10 text-primary border-primary/20",
    dotClass: "bg-primary",
  },
  {
    date: "24 Abr 2026",
    time: "13:40:22 UTC",
    user: "SYSTEM",
    role: "Automated Task",
    initials: "SY",
    initialsClass: "bg-surface-container-high text-outline",
    event: "Db_Backup",
    asset: "rds-prod-postgres",
    ip: "10.0.1.5",
    status: "Sucesso",
    statusClass: "bg-primary/10 text-primary border-primary/20",
    dotClass: "bg-primary",
  },
];

const severityFilters = [
  { label: "Todos", active: true, activeClass: "bg-surface-container-high text-on-surface" },
  { label: "Crítico", active: false, activeClass: "text-outline hover:text-error" },
  { label: "Aviso", active: false, activeClass: "text-outline hover:text-tertiary" },
  { label: "Info", active: false, activeClass: "text-outline hover:text-primary" },
];

const timelineEntries = [
  {
    level: "Severidade Alta",
    levelClass: "bg-error-container/25 text-error",
    dotClass: "bg-error shadow-[0_0_15px_rgba(255,180,171,0.35)]",
    title: "Tentativa de Login de Força Bruta Detectada",
    meta: "Origem: 192.168.1.105 (Moscou, RU) • Target: adm_root",
    time: "14:23:05",
    code: [
      "[SECURITY_ALERT] Failed login attempts > 50 in 60s",
      "[PROTOCOL] SSH-2.0-OpenSSH_8.2p1",
      "[ACTION] IP temporary block applied for 3600s",
    ],
    actions: [
      { label: "Ver Payload Completo", icon: "visibility", danger: false },
      { label: "Reportar IP à CloudFlare", icon: "gpp_bad", danger: true },
    ],
  },
  {
    level: "Alteração de Permissão",
    levelClass: "bg-tertiary/15 text-tertiary",
    dotClass: "bg-tertiary",
    title: "Nível de Acesso Modificado: 'Auditor_Junior'",
    meta: "Executado por: Rodrigo Santos (Admin Primary)",
    time: "13:45:12",
    before: "Role: READ_ONLY",
    after: "Role: FULL_AUDIT_WRITE",
  },
  {
    level: "Bloqueio Automático",
    levelClass: "bg-secondary-container/35 text-secondary",
    dotClass: "bg-primary",
    title: "IP 45.230.12.98 em Blacklist Definitiva",
    meta: "Motivo: Padrão de scan de vulnerabilidade recorrente (Log4Shell attempt)",
    time: "11:12:44",
    location: "Localização Identificada: Guangzhou, CN",
    asn: "ASN: 4134 (Chinanet)",
  },
];

const allActivities = [
  { time: "14:22", title: "Documento compartilhado com terceiro", category: "Documentos", tone: "bg-primary/10 text-primary", detail: "Compliance_Q3_Final.pdf • TechFlow Solutions" },
  { time: "11:05", title: "Novo acesso concedido ao Trust Center", category: "Acessos", tone: "bg-secondary/10 text-secondary", detail: 'Módulo "Políticas de Privacidade" • Viewer' },
  { time: "17:45", title: "Nova solicitação de due diligence", category: "Conformidade", tone: "bg-tertiary/10 text-tertiary", detail: "Banco Global • 42 perguntas • prazo 48h" },
  { time: "09:12", title: "Tentativa de login bloqueada", category: "Segurança", tone: "bg-error/10 text-error", detail: "m.almeida@axion.com • Frankfurt, Alemanha" },
];

const accessEvents = [
  { company: "Banco Global", requester: "Ana Maria Silva", scope: "Políticas de Privacidade", status: "Ativo", statusClass: "bg-emerald-100 text-emerald-700" },
  { company: "TechFlow Solutions", requester: "Carlos Mendes", scope: "SOC_2_Type_II_Report.pdf", status: "Pendente", statusClass: "bg-amber-100 text-amber-700" },
  { company: "Pine Ventures", requester: "Ricardo Nunes", scope: "Resumo_Pentest_Externos.pdf", status: "Revisto", statusClass: "bg-blue-100 text-blue-700" },
];

const documentEvents = [
  { name: "Compliance_Q3_Final.pdf", action: "Compartilhado", audience: "TechFlow Solutions", metric: "14 downloads", tone: "text-primary" },
  { name: "Data_Processing_Addendum.pdf", action: "Atualizado", audience: "Uso interno + prospects", metric: "v3 publicada", tone: "text-secondary" },
  { name: "SOC_2_Type_II_Report.pdf", action: "Solicitação de acesso", audience: "Banco Global", metric: "2 pendentes", tone: "text-tertiary" },
];

function DetailsBreadcrumb({ current }: { current: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <Link href="/notificacoes" className="flex items-center gap-2 hover:text-primary">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Central de Atividades
      </Link>
      <span className="material-symbols-outlined text-sm">chevron_right</span>
      <span className="font-semibold text-on-surface">{current}</span>
    </div>
  );
}

function InsightNote({
  title,
  description,
  accentClassName = "text-primary",
}: {
  title: string;
  description: string;
  accentClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
      <p className={`text-[11px] font-bold uppercase tracking-widest ${accentClassName}`}>{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
    </div>
  );
}

function ExportarRelatorioPage() {
  return (
    <>
      <SecureTopbar placeholder="Buscar registros..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <DetailsBreadcrumb current="Exportar Relatório" />

          <section className="rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/10 via-surface-container-lowest to-transparent p-6 shadow-panel">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Saída executiva</p>
                <h2 className="mt-2 font-headline text-2xl font-extrabold text-white">Pacote pronto para compliance, cliente e board</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
                  Esta exportação foi desenhada para transformar a Central de Atividades em um material claro, auditável e compartilhável, sem perder rastreabilidade.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Eventos</p>
                  <p className="mt-2 text-lg font-extrabold text-white">1.284</p>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Formato</p>
                  <p className="mt-2 text-lg font-extrabold text-primary">PDF</p>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Registro</p>
                  <p className="mt-2 text-lg font-extrabold text-secondary">Auditado</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-6 opacity-45 blur-[1px]">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <MetricCard label="Total de Eventos" value="1.284" trailing={<div className="h-1.5 w-20 rounded-full bg-primary/35" />} />
                <MetricCard label="Acessos Críticos" value="42" trailing={<div className="h-1.5 w-16 rounded-full bg-error/45" />} />
                <MetricCard label="Usuários Ativos" value="156" trailing={<div className="h-1.5 w-24 rounded-full bg-tertiary/45" />} />
              </div>

              <article className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
                <div className="flex items-center justify-between bg-surface-container-low px-6 py-4">
                  <h3 className="font-headline text-lg font-bold text-white">Logs Recentes</h3>
                  <span className="text-xs font-bold text-primary">Ver tudo</span>
                </div>
                <div className="space-y-4 p-6">
                  {[
                    {
                      icon: "login",
                      iconClass: "bg-blue-500/10 text-blue-500",
                      title: "Novo acesso detectado",
                      subtitle: "IP: 192.168.1.102 • São Paulo, BR",
                      time: "14:23:01",
                    },
                    {
                      icon: "description",
                      iconClass: "bg-tertiary/10 text-tertiary",
                      title: 'Documento "Relatorio_Q3.pdf" assinado',
                      subtitle: "Por: admin_marcos • Autenticação MFA",
                      time: "13:15:44",
                    },
                  ].map((log) => (
                    <div key={log.title} className="flex items-center gap-4 border-b border-outline-variant/10 py-3 last:border-b-0">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${log.iconClass}`}>
                        <span className="material-symbols-outlined">{log.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-on-surface">{log.title}</p>
                        <p className="text-xs text-slate-500">{log.subtitle}</p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">{log.time}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <article className="rounded-2xl border border-outline-variant/20 bg-surface-container-high shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)]">
              <div className="flex items-start justify-between border-b border-outline-variant/10 p-8">
                <div>
                  <h2 className="font-headline text-2xl font-extrabold text-on-surface">Exportar Relatório</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">Configure os parâmetros de exportação da atividade digital.</p>
                </div>
                <Link href="/notificacoes" className="rounded-full p-2 transition-colors hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-slate-500">close</span>
                </Link>
              </div>

              <div className="space-y-8 p-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Período de Análise</label>
                  <div className="flex flex-wrap gap-3">
                    {exportPeriods.map((period) => (
                      <button
                        key={period.label}
                        type="button"
                        className={`flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
                          period.active
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-500"
                            : "border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:border-primary"
                        }`}
                      >
                        {period.icon ? <span className="material-symbols-outlined text-sm">{period.icon}</span> : null}
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Categorias de Eventos</label>
                    <div className="space-y-2.5">
                      {exportCategories.map((category) => (
                        <label key={category.label} className="group flex cursor-pointer items-center gap-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                              category.checked
                                ? category.accent
                                  ? "border-primary bg-primary text-on-primary"
                                  : "border-outline-variant bg-surface-container-lowest text-primary"
                                : "border-outline-variant bg-surface-container-lowest"
                            }`}
                          >
                            {category.checked ? (
                              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                check
                              </span>
                            ) : null}
                          </div>
                          <span className={`text-sm font-medium transition-colors ${category.checked ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface"}`}>
                            {category.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Formato de Saída</label>
                    <div className="grid grid-cols-1 gap-2">
                      {exportFormats.map((format) => (
                        <button
                          key={format.label}
                          type="button"
                          className={`flex items-center justify-between rounded-xl border p-3 text-left ${
                            format.selected
                              ? "border-primary/20 bg-primary/5 text-on-surface"
                              : "border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined ${format.selected ? "text-primary" : "text-slate-500"}`}>{format.icon}</span>
                            <span className={`text-sm ${format.selected ? "font-semibold" : "font-medium"}`}>{format.label}</span>
                          </div>
                          <span className={`material-symbols-outlined text-sm ${format.selected ? "text-primary" : "text-slate-700"}`} style={{ fontVariationSettings: format.selected ? "'FILL' 1" : "'FILL' 0" }}>
                            {format.selected ? "radio_button_checked" : "radio_button_unchecked"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Destinatário do Relatório</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">alternate_email</span>
                    <input
                      type="email"
                      defaultValue="admin@axiontrust.digital"
                      className="w-full rounded-xl border-none bg-surface-container-lowest py-4 pl-12 pr-4 font-medium text-on-surface outline-none ring-0 transition-all focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 bg-surface-container-highest/30 p-8">
                <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-primary-container to-primary py-4 font-headline text-base font-extrabold text-on-primary-container shadow-lg transition-all hover:brightness-110 active:scale-[0.98]">
                  <span className="material-symbols-outlined">send</span>
                  Gerar e Enviar Relatório
                </button>
                <div className="flex items-start gap-3 rounded-lg border border-outline-variant/10 bg-surface/40 p-4">
                  <span className="material-symbols-outlined text-lg text-tertiary">gavel</span>
                  <p className="text-[11px] leading-relaxed text-on-surface-variant">
                    Este relatório contém dados sensíveis protegidos por criptografia de ponta a ponta. A exportação será registrada para fins de auditoria em conformidade com as normas ISO 27001 e LGPD.
                  </p>
                </div>
              </div>
            </article>
          </section>
        </div>
      </main>
    </>
  );
}

function HistoricoCompletoPage() {
  return (
    <>
      <SecureTopbar placeholder="Pesquisar registros..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <DetailsBreadcrumb current="Histórico de Auditoria" />

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SecurePageHeader
              title="Histórico de Auditoria"
              subtitle="Registro imutável de todas as transações, acessos e alterações de infraestrutura na rede AXION Trust."
            />

            <div className="flex items-center gap-2 rounded-xl bg-surface-container-lowest p-1">
              {severityFilters.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${filter.activeClass}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">Ledger imutável</span>
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">Pronto para auditoria</span>
              </div>
              <p className="mt-4 max-w-4xl text-sm leading-relaxed text-on-surface-variant">
                Use esta visão quando precisar reconstruir uma sequência operacional com precisão: quem agiu, em qual ativo, com qual status e a partir de qual origem.
              </p>
            </article>

            <aside className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Leitura recomendada</p>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                Comece por falhas e eventos críticos, depois siga para mudanças de configuração e automações sensíveis. Esse fluxo reduz ruído e acelera investigação.
              </p>
            </aside>
          </section>

          <article className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-low shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-highest/40">
                    {["Data/Hora", "Usuário", "Evento", "Ativo Relacionado", "IP", "Status", "Ações"].map((header, index) => (
                      <th
                        key={header}
                        className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.15em] text-outline ${
                          index === 5 ? "text-center" : index === 6 ? "text-right" : ""
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {auditRows.map((row) => (
                    <tr key={`${row.user}-${row.time}`} className="group transition-colors hover:bg-surface-container-high/40">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-on-surface">{row.date}</span>
                          <span className="text-[11px] text-outline">{row.time}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${row.initialsClass}`}>
                            {row.initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-on-surface">{row.user}</span>
                            <span className="text-[11px] italic text-outline">{row.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-surface-variant px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          {row.event}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">{row.asset}</td>
                      <td className="px-6 py-4 font-mono text-xs text-outline">{row.ip}</td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-tighter ${row.statusClass}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${row.dotClass}`} />
                          {row.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" className="text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary/80">
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-4 border-t border-outline-variant/10 bg-surface-container-lowest p-6 md:flex-row md:items-center">
              <div className="flex flex-wrap items-center gap-4 text-xs text-outline">
                <span>
                  Mostrando <span className="font-bold text-on-surface">1-4</span> de 12.842 registros
                </span>
                <div className="h-4 w-px bg-outline-variant/20" />
                <div className="flex items-center gap-2">
                  <span>Linhas por página:</span>
                  <select className="cursor-pointer border-none bg-transparent p-0 text-xs font-bold text-on-surface focus:ring-0">
                    <option>15</option>
                    <option>30</option>
                    <option>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" disabled className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/30 text-outline opacity-30">
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-xs font-bold text-on-primary-container shadow-lg shadow-primary-container/20">
                  1
                </button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-outline transition-all hover:bg-surface-variant">
                  2
                </button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-outline transition-all hover:bg-surface-variant">
                  3
                </button>
                <span className="px-1 text-xs text-outline">...</span>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-outline transition-all hover:bg-surface-variant">
                  428
                </button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/30 text-outline transition-all hover:bg-surface-variant">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </article>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="group relative overflow-hidden rounded-2xl border border-outline-variant/5 bg-surface-container p-6 shadow-xl">
              <div className="absolute -right-4 -top-4 opacity-5 transition-transform duration-500 group-hover:scale-110">
                <span className="material-symbols-outlined text-9xl">verified_user</span>
              </div>
              <h4 className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-outline">Verificação de Integridade</h4>
              <div className="flex items-end gap-3">
                <span className="font-headline text-4xl font-extrabold text-primary">100%</span>
                <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-primary/60">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Verificado via Blockchain
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
                <div className="h-full w-full bg-primary shadow-[0_0_10px_rgba(171,199,255,0.4)]" />
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-2xl border border-outline-variant/5 bg-surface-container p-6 shadow-xl">
              <div className="absolute -right-4 -top-4 opacity-5 transition-transform duration-500 group-hover:scale-110">
                <span className="material-symbols-outlined text-9xl">shield</span>
              </div>
              <h4 className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-outline">Eventos Críticos (24h)</h4>
              <div className="flex items-end gap-3">
                <span className="font-headline text-4xl font-extrabold text-on-surface">02</span>
                <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-error">
                  <span className="material-symbols-outlined text-xs">arrow_upward</span>
                  +12% vs Ontem
                </span>
              </div>
              <div className="mt-4 flex gap-1">
                <div className="h-8 flex-1 rounded-sm bg-surface-variant" />
                <div className="h-10 flex-1 rounded-sm bg-surface-variant" />
                <div className="h-6 flex-1 rounded-sm bg-surface-variant" />
                <div className="h-12 flex-1 rounded-sm bg-error/40" />
                <div className="h-16 flex-1 rounded-sm bg-error shadow-[0_0_10px_rgba(255,180,171,0.3)]" />
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-2xl border border-outline-variant/5 bg-surface-container p-6 shadow-xl">
              <div className="absolute -right-4 -top-4 opacity-5 transition-transform duration-500 group-hover:scale-110">
                <span className="material-symbols-outlined text-9xl">storage</span>
              </div>
              <h4 className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-outline">Volume de Logs</h4>
              <div className="flex items-end gap-3">
                <span className="font-headline text-4xl font-extrabold text-on-surface">14.2 GB</span>
                <span className="mb-1.5 text-xs font-medium italic text-outline">Retenção de 180 dias</span>
              </div>
              <div className="mt-6 flex items-center justify-between text-[11px] text-outline">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-container" />
                  Infra
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-secondary-container" />
                  Auth
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-tertiary-container" />
                  Apps
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}

function FiltroSegurancaPage() {
  return (
    <>
      <SecureTopbar placeholder="Filtrar por 'Segurança'..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-10">
          <DetailsBreadcrumb current="Atividades de Segurança" />

          <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <SecurePageHeader
                title="Atividades de Segurança"
                subtitle="Monitoramento em tempo real de vetores de ameaças, autenticação e privilégios administrativos."
              />
            </div>

            <div className="flex gap-3">
              <span className="flex items-center gap-2 rounded-full bg-secondary-container px-4 py-2 text-xs font-bold text-on-secondary-container">
                <span className="h-2 w-2 animate-pulse rounded-full bg-error" />
                LIVE MONITORING
              </span>
            </div>
          </header>

          <section className="rounded-2xl border border-error/15 bg-gradient-to-r from-error/10 via-surface-container-lowest to-transparent p-6 shadow-panel">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-error">Threat posture</p>
                <h2 className="mt-2 font-headline text-2xl font-extrabold text-white">Eventos de segurança priorizados para triagem imediata</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
                  Esta visão concentra sinais com maior potencial de impacto operacional: tentativas de invasão, mudanças de privilégio e bloqueios definitivos.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bloqueios</p>
                  <p className="mt-2 text-lg font-extrabold text-error">1.284</p>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Incidentes</p>
                  <p className="mt-2 text-lg font-extrabold text-white">02</p>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Modo</p>
                  <p className="mt-2 text-lg font-extrabold text-secondary">Live</p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <article className="group relative overflow-hidden rounded-xl bg-surface-container-high p-6">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-error/5 transition-transform group-hover:scale-150" />
              <span className="material-symbols-outlined mb-4 text-error">gpp_maybe</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Tentativas de Invasão Barradas</h3>
              <p className="mt-2 font-headline text-3xl font-extrabold text-on-surface">1,284</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-error">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                +12% vs. últimas 24h
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-xl bg-surface-container-high p-6">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
              <span className="material-symbols-outlined mb-4 text-primary">block</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">IPs em Blacklist Local</h3>
              <p className="mt-2 font-headline text-3xl font-extrabold text-on-surface">42</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Sincronizado com Global Trust
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-xl bg-surface-container-high p-6">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-tertiary/5 transition-transform group-hover:scale-150" />
              <span className="material-symbols-outlined mb-4 text-tertiary">admin_panel_settings</span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Alt. Privilégios (Admin)</h3>
              <p className="mt-2 font-headline text-3xl font-extrabold text-on-surface">03</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-tertiary">
                <span className="material-symbols-outlined text-xs">history</span>
                Última há 42 min
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-xl border border-error/20 bg-surface-container-high p-6">
              <div className="absolute inset-0 bg-error/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="material-symbols-outlined mb-4 text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Incidentes Críticos</h3>
              <p className="mt-2 font-headline text-3xl font-extrabold text-error">02</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-error">
                <span className="material-symbols-outlined text-xs">notification_important</span>
                Ação Imediata Requerida
              </div>
            </article>
          </div>

          <section className="rounded-xl bg-surface-container-low p-8">
            <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <h2 className="font-headline text-xl font-bold text-on-surface">Linha do Tempo de Segurança</h2>
              <div className="flex gap-2">
                <button type="button" className="rounded-lg bg-surface-variant px-4 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-slate-700">
                  Exportar LOGS
                </button>
                <button type="button" className="rounded-lg bg-error px-4 py-2 text-xs font-bold text-on-error transition-all hover:brightness-110">
                  Suspender Sessões Suspeitas
                </button>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-slate-800">
              {timelineEntries.map((entry, index) => (
                <div key={entry.title} className={`relative pl-10 ${index < timelineEntries.length - 1 ? "pb-12" : ""}`}>
                  <div className={`absolute left-[-11px] top-0 h-5 w-5 rounded-full border-4 border-surface ${entry.dotClass}`} />
                  <div className={`rounded-xl bg-surface-container-high p-6 ${index === 0 ? "border border-error/30" : ""}`}>
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tighter ${entry.levelClass}`}>
                          {entry.level}
                        </span>
                        <h4 className="mt-2 font-headline text-lg font-bold text-on-surface">{entry.title}</h4>
                        <p className="text-sm font-medium text-slate-400">{entry.meta}</p>
                      </div>
                      <span className="font-mono text-xs text-slate-500">{entry.time}</span>
                    </div>

                    {"code" in entry && entry.code && entry.actions ? (
                      <>
                        <div className="mb-4 rounded-lg border-l-4 border-error bg-surface-container-lowest p-4 font-mono text-[11px] text-error">
                          <code>
                            {entry.code.map((line) => (
                              <span key={line}>
                                {line}
                                <br />
                              </span>
                            ))}
                          </code>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {entry.actions.map((action) => (
                            <button
                              key={action.label}
                              type="button"
                              className={`flex items-center gap-1 text-xs font-bold ${
                                action.danger ? "text-error hover:underline" : "text-primary hover:underline"
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">{action.icon}</span>
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : null}

                    {"before" in entry ? (
                      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-800 bg-surface-container-lowest p-3">
                          <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Estado Anterior</p>
                          <p className="font-mono text-xs text-on-surface">{entry.before}</p>
                        </div>
                        <div className="rounded-lg border border-slate-800 bg-surface-container-lowest p-3">
                          <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Novo Estado</p>
                          <p className="font-mono text-xs text-tertiary">{entry.after}</p>
                        </div>
                      </div>
                    ) : null}

                    {"location" in entry ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-primary/70">
                          <span className="material-symbols-outlined">public</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-on-surface-variant">{entry.location}</p>
                          <p className="font-mono text-[10px] text-slate-500">{entry.asn}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function FiltroTodasPage() {
  return (
    <>
      <SecureTopbar placeholder="Pesquisar todos os eventos da central..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <DetailsBreadcrumb current="Filtro: Todas as Atividades" />

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SecurePageHeader
              title="Todas as Atividades"
              subtitle="Visão consolidada da operação inteira, reunindo segurança, acessos, documentos e diligências em uma mesma linha de leitura."
            />

            <div className="flex items-center gap-2 rounded-xl bg-surface-container-lowest p-1">
              {["Todas", "Acessos", "Documentos", "Segurança"].map((label, index) => (
                <Link
                  key={label}
                  href={index === 0 ? "/notificacoes/detalhes/filtro-todas" : `/notificacoes/detalhes/filtro-${label.toLowerCase()}`}
                  className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider ${index === 0 ? "bg-primary text-on-primary" : "text-outline transition-colors hover:text-on-surface"}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <MetricCard label="Eventos totais" value="452" trailing={<span className="text-xs font-bold text-primary">30d</span>} />
            <MetricCard label="Acessos ativos" value="39" trailing={<span className="text-xs font-bold text-secondary">9 novos</span>} />
            <MetricCard label="Documentos envolvidos" value="14" trailing={<span className="text-xs font-bold text-tertiary">3 atualizados</span>} />
            <MetricCard label="Alertas críticos" value="2" valueClassName="text-error" trailing={<span className="text-xs font-bold text-error">agora</span>} />
          </div>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
            <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-headline text-xl font-bold text-on-surface">Linha consolidada</h3>
                <Link href="/notificacoes/detalhes/filtros-avancados" className="text-xs font-bold text-primary hover:underline">
                  Refinar corte
                </Link>
              </div>

              <div className="space-y-4">
                {allActivities.map((activity) => (
                  <div key={`${activity.time}-${activity.title}`} className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${activity.tone}`}>
                          {activity.category}
                        </div>
                        <h4 className="mt-3 text-base font-bold text-white">{activity.title}</h4>
                        <p className="mt-1 text-sm text-on-surface-variant">{activity.detail}</p>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <aside className="space-y-6">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <h3 className="font-headline text-lg font-bold text-white">Prioridade de leitura</h3>
                <div className="mt-4 space-y-3">
                  {["Começar pelos incidentes e tentativas bloqueadas.", "Depois revisar acessos concedidos e documentos privados.", "Finalizar com diligências e itens de rotina."].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4">
                      <span className="material-symbols-outlined text-primary">subdirectory_arrow_right</span>
                      <span className="text-sm text-on-surface-variant">{item}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Resumo operacional</p>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  Esta visão é ideal para leitura executiva rápida antes de exportar relatório, revisar incidentes ou distribuir ações entre os módulos da plataforma.
                </p>
              </article>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

function FiltroAcessosPage() {
  return (
    <>
      <SecureTopbar placeholder="Pesquisar acessos, usuários ou empresas..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <DetailsBreadcrumb current="Filtro: Acessos" />
          <SecurePageHeader
            title="Atividades de Acesso"
            subtitle="Concessões, solicitações, revogações e mudanças de escopo para usuários que acessam recursos sensíveis do Trust."
          />

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <MetricCard label="Solicitações" value="12" trailing={<span className="text-xs font-bold text-primary">3 hoje</span>} />
                <MetricCard label="Ativos" value="9" trailing={<span className="text-xs font-bold text-emerald-500">válidos</span>} />
                <MetricCard label="Expiram em breve" value="2" trailing={<span className="text-xs font-bold text-tertiary">7 dias</span>} />
              </div>

              <article className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
                <div className="flex items-center justify-between border-b border-outline-variant/10 px-8 py-6">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-white">Mapa de permissões recentes</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">Leitura rápida das empresas, escopos e estados mais recentes.</p>
                  </div>
                  <Link href="/gestao-acessos" className="text-xs font-bold text-primary hover:underline">
                    Abrir Gestão de Acessos
                  </Link>
                </div>

                <div className="divide-y divide-outline-variant/10">
                  {accessEvents.map((event) => (
                    <div key={`${event.company}-${event.requester}`} className="grid grid-cols-1 gap-5 px-8 py-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_140px] lg:items-center">
                      <div>
                        <p className="text-sm font-semibold text-white">{event.requester}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{event.company}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recurso</p>
                        <p className="mt-1 text-sm text-on-surface">{event.scope}</p>
                      </div>
                      <div className="lg:text-right">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${event.statusClass}`}>{event.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <aside className="space-y-6">
              <article className="overflow-hidden rounded-2xl border border-secondary/15 bg-gradient-to-br from-secondary/10 via-surface-container-lowest to-surface-container-lowest shadow-panel">
                <div className="border-b border-outline-variant/10 p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-secondary">Leitura do risco</p>
                  <h3 className="mt-2 font-headline text-xl font-bold text-white">Escopo e validade</h3>
                </div>
                <div className="space-y-4 p-6">
                  <InsightNote title="Sinal positivo" description="A maior parte dos acessos ativos segue no escopo Viewer, o que reduz o risco de privilégio excessivo." accentClassName="text-secondary" />
                  <InsightNote title="Ponto de atenção" description="Pedidos pendentes ligados a documentos privados devem ser revistos antes da próxima exportação para cliente." accentClassName="text-tertiary" />
                  <InsightNote title="Ação sugerida" description="Rodar revisão semanal de expiração e centralizar exceções no módulo de Gestão de Acessos." accentClassName="text-primary" />
                </div>
              </article>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

function FiltroDocumentosPage() {
  return (
    <>
      <SecureTopbar placeholder="Pesquisar documentos e compartilhamentos..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <DetailsBreadcrumb current="Filtro: Documentos" />
          <SecurePageHeader
            title="Atividades de Documentos"
            subtitle="Compartilhamentos, downloads, pedidos de acesso e alterações recentes que impactam o Data Room Seguro."
          />

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <MetricCard label="Compartilhamentos" value="26" trailing={<span className="text-xs font-bold text-primary">+8%</span>} />
                <MetricCard label="Downloads" value="118" trailing={<span className="text-xs font-bold text-secondary">30d</span>} />
                <MetricCard label="Acessos pendentes" value="2" trailing={<span className="text-xs font-bold text-tertiary">priorizar</span>} />
              </div>

              <div className="space-y-4">
                {documentEvents.map((event, index) => (
                  <div key={event.name} className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${index === 0 ? "bg-primary/10 text-primary" : index === 1 ? "bg-secondary/10 text-secondary" : "bg-tertiary/10 text-tertiary"}`}>
                          <span className="material-symbols-outlined">{index === 0 ? "share" : index === 1 ? "sync" : "lock_open_right"}</span>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">{event.name}</h4>
                          <p className="mt-1 text-sm text-on-surface-variant">{event.action} • {event.audience}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${event.tone}`}>{event.metric}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <aside className="space-y-6">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <h3 className="font-headline text-lg font-bold text-white">Leitura recomendada</h3>
                <div className="mt-4 space-y-3">
                  {["Abrir primeiro os arquivos com mais downloads.", "Separar públicos de privados antes da exportação.", "Revisar owner e versão dos documentos mais sensíveis."].map((item) => (
                    <div key={item} className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
                      {item}
                    </div>
                  ))}
                </div>
                <Link href="/data-room-seguro" className="mt-6 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20">
                  Abrir Data Room Seguro
                </Link>
              </article>

              <article className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 to-transparent p-6 shadow-panel">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Destaque da semana</p>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  O consumo de evidências de compliance segue concentrado em SOC2 e DPA. Vale revisar se os materiais estão com versão, descrição e owner atualizados antes de novos shares.
                </p>
              </article>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

function IgnorarSolicitacaoPage() {
  return (
    <>
      <SecureTopbar placeholder="Registrar motivo da decisão..." />
      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <DetailsBreadcrumb current="Ignorar Solicitação" />
          <section className="mx-auto max-w-4xl rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
            <SecurePageHeader
              title="Ignorar Solicitação de Due Diligence"
              subtitle="Registre com clareza por que a demanda não será tratada agora e mantenha a trilha de auditoria consistente."
            />
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard label="Solicitante" value="Banco Global" />
              <MetricCard label="Prazo restante" value="48h" valueClassName="text-tertiary" />
              <MetricCard label="Perguntas" value="42" />
            </div>
            <div className="mt-8 rounded-2xl border border-amber-200/20 bg-amber-50/5 p-6">
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Use esta ação apenas quando houver duplicidade, desalinhamento de escopo ou replanejamento formal com o cliente.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <InsightNote title="Duplicidade" description="Já existe resposta ativa para este mesmo cliente e período." accentClassName="text-tertiary" />
                <InsightNote title="Escopo" description="Pedido fora do combinado comercial ou técnico." accentClassName="text-primary" />
                <InsightNote title="Replanejamento" description="Cliente alinhado sobre novo prazo ou reenvio." accentClassName="text-secondary" />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface">Marcar como duplicada</button>
                <button className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface">Reagendar resposta</button>
                <Link href="/notificacoes/detalhes/iniciar-resposta" className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20">Responder mesmo assim</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function CarregarAnterioresPage() {
  return (
    <>
      <SecureTopbar placeholder="Carregar atividades anteriores..." />
      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <DetailsBreadcrumb current="Carregar Atividades Anteriores" />
          <section className="mx-auto max-w-5xl rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
            <SecurePageHeader
              title="Carregar Atividades Anteriores"
              subtitle="Expanda a linha do tempo para recuperar contexto histórico sem sair da Central de Atividades."
            />
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <MetricCard label="Blocos extras" value="5" />
              <MetricCard label="Período adicional" value="30d" />
              <MetricCard label="Latência esperada" value="< 2s" />
            </div>
            <div className="mt-8 space-y-4">
              {["Últimos 15 dias", "Últimos 30 dias", "Últimos 90 dias"].map((range, index) => (
                <button
                  key={range}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left ${index === 1 ? "border-primary/30 bg-primary/5" : "border-outline-variant/15 bg-surface-container-low"}`}
                >
                  <span className="text-sm font-semibold text-on-surface">{range}</span>
                  <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-secondary/10 bg-secondary/5 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">Quando usar</p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">Ideal para investigações, preparação de auditoria e revisão de ciclos completos de compartilhamento ou incidente.</p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default async function NotificacoesDetalhePage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "exportar-relatorio") {
    return <ExportarRelatorioPage />;
  }

  if (slug === "filtro-seguranca") {
    return <FiltroSegurancaPage />;
  }

  if (slug === "filtro-todas") {
    return <FiltroTodasPage />;
  }

  if (slug === "filtro-acessos") {
    return <FiltroAcessosPage />;
  }

  if (slug === "filtro-documentos") {
    return <FiltroDocumentosPage />;
  }

  if (slug === "ignorar-solicitacao") {
    return <IgnorarSolicitacaoPage />;
  }

  if (slug === "carregar-anteriores") {
    return <CarregarAnterioresPage />;
  }

  notFound();
}
