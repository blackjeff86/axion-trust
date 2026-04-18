"use client";

import Link from "next/link";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";

export default function CentralDeAtividadesPage() {
  return (
    <>
      <SecureTopbar placeholder="Pesquisar logs, usuarios ou eventos..." />

      <main className="min-h-screen p-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SecurePageHeader
              title="Central de Atividades"
              subtitle="Acompanhe em tempo real todas as interacoes, acessos e alteracoes de conformidade em sua infraestrutura de confianca."
            />

            <div className="flex items-center gap-3">
              <Link
                href="/notificacoes/detalhes/exportar-relatorio"
                className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 text-sm font-bold text-on-surface transition-all hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Exportar Relatorio
              </Link>

              <Link
                href="/notificacoes/detalhes/historico-completo"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-4 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-lg">history</span>
                Ver Historico Completo
              </Link>
            </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-6 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</span>
              <div className="flex gap-2">
                <Link href="/notificacoes/detalhes/filtro-todas" className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-on-primary">
                  Todas
                </Link>
                <Link href="/notificacoes/detalhes/filtro-acessos" className="rounded-full bg-surface-container-low px-4 py-1.5 text-xs font-bold text-on-surface transition-colors hover:bg-slate-200">
                  Acessos
                </Link>
                <Link href="/notificacoes/detalhes/filtro-documentos" className="rounded-full bg-surface-container-low px-4 py-1.5 text-xs font-bold text-on-surface transition-colors hover:bg-slate-200">
                  Documentos
                </Link>
                <Link href="/notificacoes/detalhes/filtro-seguranca" className="rounded-full bg-surface-container-low px-4 py-1.5 text-xs font-bold text-on-surface transition-colors hover:bg-slate-200">
                  Seguranca
                </Link>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-white/5" />

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Periodo</span>
              <div className="flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2">
                <span className="material-symbols-outlined text-sm text-slate-500">calendar_today</span>
                <span className="text-xs text-on-surface">Ultimos 7 dias</span>
                <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
              </div>
            </div>

            <div className="ml-auto">
              <Link href="/notificacoes/detalhes/filtros-avancados" className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filtros Avancados
              </Link>
            </div>
        </div>

        <div className="relative space-y-4">
            <div className="absolute bottom-0 left-[27px] top-0 w-[2px] bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

            <div className="group relative">
              <div className="absolute left-0 top-3 flex w-14 justify-center">
                <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-surface-container-high shadow-lg shadow-primary/5 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    share
                  </span>
                </div>
              </div>

              <div className="ml-14 rounded-xl border border-slate-100/50 bg-surface-container-lowest p-5 shadow-panel transition-all duration-300 hover:bg-slate-50/50">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="mb-1 text-sm font-bold text-white">Documento compartilhado com Terceiro</h4>
                    <p className="text-xs text-on-surface-variant">
                      O dossie <span className="font-medium text-primary">"Compliance_Q3_Final.pdf"</span> foi compartilhado via Data Room Seguro.
                    </p>
                  </div>
                  <span className="rounded bg-surface-container-lowest px-2 py-1 text-[10px] font-mono text-slate-500">14:22 • HOJE</span>
                </div>

                <div className="mt-4 flex items-center gap-6 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-primary">CM</div>
                    <span className="text-[11px] text-slate-400">
                      Por: <strong className="text-white">Carlos Mendes</strong> (Compliance)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-slate-500">apartment</span>
                    <span className="text-[11px] text-slate-400">
                      Destino: <strong className="text-white">TechFlow Solutions</strong>
                    </span>
                  </div>

                  <div className="ml-auto flex gap-2">
                    <Link href="/notificacoes/detalhes/gerenciar-acesso" className="text-[10px] font-bold text-primary transition-colors hover:text-white">
                      GERENCIAR ACESSO
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute left-0 top-3 flex w-14 justify-center">
                <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-secondary/20 bg-surface-container-high transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    key
                  </span>
                </div>
              </div>

              <div className="ml-14 rounded-xl border border-slate-100/50 bg-surface-container-lowest p-5 shadow-panel transition-all duration-300 hover:bg-slate-50/50">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="mb-1 text-sm font-bold text-white">Novo acesso concedido ao Trust Center</h4>
                    <p className="text-xs text-on-surface-variant">Permissao de leitura concedida para o modulo de "Politicas de Privacidade".</p>
                  </div>
                  <span className="rounded bg-surface-container-lowest px-2 py-1 text-[10px] font-mono text-slate-500">11:05 • HOJE</span>
                </div>

                <div className="mt-4 flex items-center gap-6 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/20 text-[8px] font-bold text-secondary">AM</div>
                    <span className="text-[11px] text-slate-400">
                      Usuario: <strong className="text-white">Ana Maria Silva</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-slate-500">vpn_key</span>
                    <span className="text-[11px] text-slate-400">
                      Nivel: <strong className="text-white">Viewer</strong>
                    </span>
                  </div>

                  <div className="ml-auto flex gap-2">
                    <Link href="/notificacoes/detalhes/recursos-acesso" className="text-[10px] font-bold text-slate-400 transition-colors hover:text-white">
                      RECURSOS
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center py-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <span className="relative bg-surface px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Ontem, 24 de Outubro</span>
            </div>

            <div className="group relative">
              <div className="absolute left-0 top-3 flex w-14 justify-center">
                <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-tertiary/20 bg-surface-container-high transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-tertiary">priority_high</span>
                </div>
              </div>

              <div className="ml-14 rounded-xl border border-slate-100/50 border-l-2 border-tertiary/40 bg-surface-container-lowest p-5 shadow-panel transition-all duration-300 hover:bg-slate-50/50">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Nova Solicitacao de Due Diligence</h4>
                      <span className="rounded bg-tertiary/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-tertiary">URGENTE</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Banco Global iniciou um questionario de avaliacao de risco anual.</p>
                  </div>
                  <span className="rounded bg-surface-container-lowest px-2 py-1 text-[10px] font-mono text-slate-500">17:45 • ONTEM</span>
                </div>

                <div className="mt-4 flex items-center gap-6 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-slate-500">assignment</span>
                    <span className="text-[11px] text-slate-400">
                      Prazo: <strong className="text-tertiary">Em 48 horas</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-slate-500">description</span>
                    <span className="text-[11px] text-slate-400">
                      Itens: <strong className="text-white">42 perguntas</strong>
                    </span>
                  </div>

                  <div className="ml-auto flex gap-3">
                    <Link href="/notificacoes/detalhes/ignorar-solicitacao" className="text-[10px] font-bold text-slate-400 transition-colors hover:text-white">
                      IGNORAR
                    </Link>
                    <Link
                      href="/notificacoes/detalhes/iniciar-resposta"
                      className="rounded bg-tertiary px-3 py-1 text-[10px] font-bold text-on-tertiary-fixed transition-all hover:opacity-90"
                    >
                      INICIAR RESPOSTA
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute left-0 top-3 flex w-14 justify-center">
                <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-error/20 bg-surface-container-high transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                    gpp_maybe
                  </span>
                </div>
              </div>

              <div className="ml-14 rounded-xl border border-slate-100/50 bg-surface-container-lowest p-5 shadow-panel transition-all duration-300 hover:bg-slate-50/50">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="mb-1 text-sm font-bold text-white">Tentativa de login bloqueada</h4>
                    <p className="text-xs text-on-surface-variant">
                      Origem suspeita detectada para o usuario <span className="font-medium text-white">m.almeida@axion.com</span>.
                    </p>
                  </div>
                  <span className="rounded bg-surface-container-lowest px-2 py-1 text-[10px] font-mono text-slate-500">09:12 • ONTEM</span>
                </div>

                <div className="mt-4 flex items-center gap-6 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-error">location_on</span>
                    <span className="text-[11px] text-slate-400">
                      Localizacao: <strong className="text-white">Frankfurt, Alemanha</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-slate-500">shield</span>
                    <span className="text-[11px] text-slate-400">
                      Acao: <strong className="text-white">Auto-Block Ativado</strong>
                    </span>
                  </div>

                  <div className="ml-auto flex gap-2">
                    <Link href="/notificacoes/detalhes/investigar-incidente" className="text-[10px] font-bold tracking-wider text-error transition-colors hover:underline">
                      INVESTIGAR INCIDENTE
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 text-center">
              <Link
                href="/notificacoes/detalhes/carregar-anteriores"
                className="rounded-full border border-white/5 bg-surface-container-lowest px-6 py-2 text-xs font-semibold text-slate-400 transition-all hover:bg-white/5 hover:text-white"
              >
                Carregar atividades anteriores
              </Link>
            </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div>
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                  <span className="material-symbols-outlined text-sm text-primary">analytics</span>
                </div>
                <h5 className="mb-1 text-sm font-bold text-white">Volume de Atividade</h5>
                <p className="text-[11px] text-slate-500">+12% comparado a semana anterior.</p>
              </div>

              <div className="mt-6">
                <div className="h-1 overflow-hidden rounded-full bg-surface-container-highest">
                  <div className="h-full w-[75%] bg-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded bg-secondary/10">
                <span className="material-symbols-outlined text-sm text-secondary">verified</span>
              </div>
              <h5 className="mb-1 text-sm font-bold text-white">Conformidade Ativa</h5>
              <p className="text-2xl font-black text-white">99.8%</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Padrao SOC2 Tipo II</p>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="absolute -bottom-4 -right-4 scale-150 opacity-5 transition-transform group-hover:scale-125">
                <span className="material-symbols-outlined text-9xl text-white">security</span>
              </div>

              <div className="relative z-10">
                <h5 className="mb-1 text-sm font-bold text-white">Relatorio Semanal</h5>
                <p className="mb-4 text-[11px] text-slate-400">
                  Seu resumo automatizado de conformidade e riscos esta pronto para revisao.
                </p>
                <Link href="/notificacoes/detalhes/baixar-pdf-semanal" className="group flex items-center gap-1 text-[10px] font-bold text-primary">
                  BAIXAR PDF
                  <span className="material-symbols-outlined text-[10px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
      </main>

      <div className="pointer-events-none fixed right-0 top-0 -z-10 -mr-96 -mt-96 h-[800px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-0 -z-10 -mb-96 -ml-96 h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[120px]" />
    </>
  );
}
