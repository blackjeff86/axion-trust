"use client";

import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";

const suppliers = [
  {
    name: "Stellar Cloud Solutions",
    domain: "stellar-cloud.com",
    risk: "Baixo Risco",
    riskClass: "bg-primary/10 text-primary border-primary/20",
    status: "Finalizado em 12/10/2023",
    statusDot: "bg-primary",
    score: 96,
    scoreColor: "bg-primary",
    initial: "S",
    initialColor: "text-primary",
  },
  {
    name: "Prime Logistics Int.",
    domain: "primelog.io",
    risk: "Medio Risco",
    riskClass: "bg-tertiary/10 text-tertiary border-tertiary/20",
    status: "Em Revisao",
    statusDot: "bg-tertiary",
    score: 74,
    scoreColor: "bg-tertiary",
    initial: "P",
    initialColor: "text-tertiary",
  },
  {
    name: "DataStream Marketing",
    domain: "datastream.mkt",
    risk: "Risco Critico",
    riskClass: "bg-error/10 text-error border-error/20",
    status: "Vencido (Atraso 15 dias)",
    statusDot: "bg-error",
    score: 42,
    scoreColor: "bg-error",
    initial: "D",
    initialColor: "text-error",
  },
  {
    name: "Nexus Fintech",
    domain: "nexus.pay",
    risk: "Alto Risco",
    riskClass: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    status: "Enviado (Aguardando Resposta)",
    statusDot: "bg-orange-400",
    score: undefined,
    scoreColor: "bg-slate-600",
    initial: "N",
    initialColor: "text-on-primary-fixed-variant",
  },
];

export default function DueDiligencePage() {
  return (
    <>
      <SecureTopbar placeholder="Pesquisar fornecedores ou domínios..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="mb-10 flex items-end justify-between">
          <SecurePageHeader
            title="Avaliação de Fornecedores"
            subtitle="Gerencie o ecossistema de confiança de seus parceiros e realize auditorias contínuas de segurança cibernética."
          />
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-container to-primary px-6 py-3 font-semibold text-on-primary-container shadow-lg shadow-primary/10 transition-all hover:opacity-90">
            <span className="material-symbols-outlined">add_circle</span>
            Novo Questionário
          </button>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-2xl border-l-4 border-primary bg-surface-container-low p-6">
            <p className="mb-1 text-sm font-medium text-on-surface-variant">Total de Fornecedores</p>
            <h3 className="text-4xl font-bold text-white">124</h3>
            <div className="mt-2 flex items-center gap-1 text-xs text-primary">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12 este mes</span>
            </div>
          </div>
          <div className="rounded-2xl border-l-4 border-tertiary bg-surface-container-low p-6">
            <p className="mb-1 text-sm font-medium text-on-surface-variant">Risco Critico/Alto</p>
            <h3 className="text-4xl font-bold text-white">14</h3>
            <p className="mt-2 text-xs text-on-surface-variant">Requer atencao imediata</p>
          </div>
          <div className="rounded-2xl border-l-4 border-primary-fixed bg-surface-container-low p-6">
            <p className="mb-1 text-sm font-medium text-on-surface-variant">Questionarios Pendentes</p>
            <h3 className="text-4xl font-bold text-white">32</h3>
            <p className="mt-2 text-xs text-on-surface-variant">8 vencendo esta semana</p>
          </div>
          <div className="rounded-2xl border-l-4 border-on-primary-fixed-variant bg-surface-container-low p-6">
            <p className="mb-1 text-sm font-medium text-on-surface-variant">Score Medio da Cadeia</p>
            <h3 className="text-4xl font-bold text-white">
              82<span className="text-xl text-on-surface-variant">/100</span>
            </h3>
            <p className="mt-2 text-xs text-on-surface-variant">Nivel: Seguro</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-surface-container-low shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between bg-surface-container-high/50 p-6">
            <h4 className="font-headline text-lg font-bold">Fornecedores Cadastrados</h4>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-2 text-xs font-semibold transition-colors hover:bg-surface-variant">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filtrar
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-2 text-xs font-semibold transition-colors hover:bg-surface-variant">
                <span className="material-symbols-outlined text-sm">download</span>
                Exportar Relatorio
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <th className="px-8 py-5">Fornecedor</th>
                  <th className="px-6 py-5">Classificacao de Risco</th>
                  <th className="px-6 py-5">Status do Questionario</th>
                  <th className="px-6 py-5 text-center">Security Score</th>
                  <th className="px-6 py-5 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {suppliers.map((supplier) => (
                  <tr key={supplier.name} className="group transition-colors hover:bg-surface-container-high">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-highest font-bold ${supplier.initialColor}`}>
                          {supplier.initial}
                        </div>
                        <div>
                          <p className="font-bold text-white">{supplier.name}</p>
                          <p className="text-xs text-on-surface-variant">{supplier.domain}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase ${supplier.riskClass}`}>
                        {supplier.risk}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${supplier.statusDot}`} />
                        <span className="text-sm">{supplier.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-white">{supplier.score ?? "--"}</span>
                        <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-surface-container-highest">
                          <div className={`h-full ${supplier.scoreColor}`} style={{ width: `${supplier.score ?? 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-variant">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between bg-surface-container-lowest/50 p-6 text-xs text-on-surface-variant">
            <p>Mostrando 4 de 124 fornecedores</p>
            <div className="flex gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant transition-all hover:bg-surface-variant">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="h-8 w-8 rounded bg-primary font-bold text-on-primary">1</button>
              <button className="h-8 w-8 rounded border border-outline-variant transition-all hover:bg-surface-variant">2</button>
              <button className="h-8 w-8 rounded border border-outline-variant transition-all hover:bg-surface-variant">3</button>
              <button className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant transition-all hover:bg-surface-variant">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="glass-panel relative overflow-hidden rounded-3xl p-8 lg:col-span-2">
            <div className="relative z-10">
              <h5 className="mb-4 text-xl font-bold text-white">Inteligencia de Risco AXION</h5>
              <p className="mb-6 leading-relaxed text-on-surface-variant">
                Detectamos um padrao de vulnerabilidades em fornecedores de infraestrutura cloud na ultima semana.
                Recomendamos revisar os protocolos de criptografia em transito para os parceiros classificados como Risco Critico.
              </p>
              <div className="flex gap-4">
                <button className="rounded-lg border border-white/10 bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/20">
                  Ver Insights Detalhados
                </button>
                <button className="rounded-lg px-5 py-2.5 text-xs font-bold text-primary transition-all">Ignorar Recomendacao</button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10">
              <span className="material-symbols-outlined text-[240px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                security
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-3xl border border-outline-variant/20 bg-surface-container-low p-8">
            <div className="mb-6 flex items-center justify-between">
              <h5 className="font-bold text-white">Compliance Global</h5>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">LGPD / GDPR</span>
            </div>
            <div className="relative mx-auto mb-6 h-32 w-32">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-surface-container-highest" />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray="364.42"
                  strokeDashoffset="40.08"
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">89%</span>
                <span className="text-[9px] font-bold uppercase text-on-surface-variant">Total</span>
              </div>
            </div>
            <p className="text-center text-sm text-on-surface-variant">
              Sua cadeia de suprimentos esta em conformidade com as normas regulatorias vigentes.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
