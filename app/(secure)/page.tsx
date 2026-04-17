"use client";

import { SecureTopbar } from "@/components/layout/secure-topbar";

const activities = [
  {
    title: "Acesso ao Data Room: Relatório de SOC2",
    subtitle: "Solicitado por Goldman Sachs & Co",
    time: "Há 12 min",
    status: "VERIFICADO",
    icon: "cloud_download",
    tone: "primary",
  },
  {
    title: "Nova Resposta de Questionário SIG",
    subtitle: "Enviado por Stripe Logistics",
    time: "Há 1 hora",
    status: "EM REVISÃO",
    icon: "rule",
    tone: "tertiary",
  },
  {
    title: "Assinatura de NDA Concluída",
    subtitle: "Parceiro: TechSolutions Ltd",
    time: "Há 3 horas",
    status: "CONCLUÍDO",
    icon: "history_edu",
    tone: "secondary",
  },
  {
    title: "Alerta de Segurança: Tentativa de Acesso",
    subtitle: "IP não identificado tentando acessar Legal Vault",
    time: "Há 5 horas",
    status: "BLOQUEADO",
    icon: "gpp_maybe",
    tone: "error",
  },
];

const toneMap: Record<string, string> = {
  primary: "text-primary bg-primary/10",
  tertiary: "text-tertiary bg-tertiary/10",
  secondary: "text-secondary bg-secondary/10",
  error: "text-error bg-error/10",
};

const badgeMap: Record<string, string> = {
  primary: "bg-secondary-container/30 text-secondary",
  tertiary: "bg-tertiary-container/20 text-tertiary",
  secondary: "bg-secondary-container/30 text-secondary",
  error: "bg-error-container/30 text-error",
};

export default function DashboardPage() {
  return (
    <>
      <SecureTopbar placeholder="Pesquisar auditorias..." />

      <main className="min-h-screen space-y-8 p-8">
        <section className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="mb-2 font-headline text-3xl font-extrabold uppercase tracking-tight text-white">Bem-vindo, Administrador</h2>
            <p className="max-w-2xl font-body text-on-surface-variant">
              Sua infraestrutura de confiança digital está operando com integridade total.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded border border-outline-variant/10 bg-surface-container-high px-4 py-2 text-sm text-on-surface">
              <span className="material-symbols-outlined text-primary">verified</span>
              <span>Sistema Seguro</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-xl bg-surface-container-low p-6 transition-colors hover:bg-surface-container">
            <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-6xl">description</span>
            </div>
            <p className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">DOCUMENTOS COMPARTILHADOS</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-headline text-4xl font-bold text-primary">1.284</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                12%
              </span>
            </div>
            <p className="mt-2 text-xs text-outline">Atividade nos últimos 30 dias</p>
          </div>

          <div className="group relative overflow-hidden rounded-xl bg-surface-container-low p-6 transition-colors hover:bg-surface-container">
            <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-6xl">fact_check</span>
            </div>
            <p className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">DUE DILIGENCE ATIVAS</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-headline text-4xl font-bold text-tertiary">42</span>
              <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-[10px] text-outline">
                EM PROGRESSO
              </span>
            </div>
            <p className="mt-2 text-xs text-outline">Requisições de terceiros pendentes</p>
          </div>

          <div className="group relative overflow-hidden rounded-xl bg-surface-container-low p-6 transition-colors hover:bg-surface-container">
            <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
              <span className="material-symbols-outlined text-6xl">assignment_late</span>
            </div>
            <p className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">TAREFAS DE REVISÃO</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-headline text-4xl font-bold text-error">18</span>
              <span className="text-sm font-semibold text-error">Crítico</span>
            </div>
            <p className="mt-2 text-xs text-outline">Aguardando aprovação do DPO</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-headline text-xl font-bold">Monitor de Atividade Recente</h3>
              <button className="text-sm font-medium text-primary hover:underline">Ver tudo</button>
            </div>

            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.title}
                  className="group flex items-center gap-4 rounded-xl border border-white/5 bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container-low"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${toneMap[activity.tone]}`}>
                    <span className="material-symbols-outlined">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-on-surface transition-colors group-hover:text-primary">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-on-surface-variant">{activity.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-outline">{activity.time}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeMap[activity.tone]}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-container-high">
              <div className="p-6">
                <h3 className="mb-4 font-headline text-xl font-bold">Status de Auditoria</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">SOC 2 Type II</span>
                    <span className="font-medium text-primary">Válido até Jun 2025</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div className="h-full w-[85%] bg-primary" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">ISO 27001</span>
                    <span className="font-medium text-primary">Válido até Jan 2026</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div className="h-full w-[95%] bg-primary" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">GDPR Compliance</span>
                    <span className="font-medium text-tertiary">Revisão em 12 dias</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div className="h-full w-[60%] bg-tertiary" />
                  </div>
                </div>
              </div>

              <div className="relative mt-2 h-32 w-full">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface-container-high to-transparent" />
                <img
                  alt="Audit Background"
                  className="h-full w-full object-cover opacity-30 grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAurXQZENr43UmFdYvZIv7VK27BUU1weBQSSUoe5EO8RJxVwDiARtgC-27AeTdUM_WNjj1sghnSZNSxQXtz0nrEwGGtglaEv7vsAiRv2ZC0PBVigWJHmBGW6HGSqPfPxDJmwq4x9elrsCh2G4Whfs0C_VplM8-pqziPltU58xEPx1b_UdHQfswZMqphEq98g3TPQC8IT7GfWif7omu-5m4cq9mzTmrklTGdlR_2wGfEw6bBtKW0eRtOqpA4oZJvwUQxmt0FeAmXmEY"
                />
              </div>
            </div>

            <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary-container/20 to-surface-container-high p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-primary/20 p-3">
                  <span className="material-symbols-outlined text-primary">task_alt</span>
                </div>
                <span className="text-[10px] font-bold tracking-widest text-primary">ATENÇÃO REQUERIDA</span>
              </div>
              <h4 className="mb-2 font-headline text-lg font-bold">Revisões Críticas</h4>
              <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
                Você possui 3 solicitações de acesso de alto nível aguardando sua assinatura digital criptografada.
              </p>
              <button className="w-full rounded-lg bg-on-surface py-3 font-bold text-surface transition-colors duration-300 hover:bg-primary">
                Acessar Central de Revisão
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
