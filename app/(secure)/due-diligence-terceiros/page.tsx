"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import { MetricCard } from "@/components/ui/metric-card";
import { getAllSuppliersClient, toSupplierRow, type SupplierRow } from "./supplier-data";

export default function DueDiligencePage() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);

  useEffect(() => {
    setSuppliers(getAllSuppliersClient().map(toSupplierRow));
  }, []);

  const kpis = useMemo(() => {
    const total = suppliers.length;
    const critical = suppliers.filter((supplier) => supplier.risk === "Alto Risco" || supplier.risk === "Risco Crítico").length;
    const pending = suppliers.filter(
      (supplier) =>
        supplier.status.includes("Pendente") ||
        supplier.status.includes("Aguardando") ||
        supplier.status.includes("Cadastro") ||
        supplier.status.includes("Preenchimento") ||
        supplier.status.includes("Revisão"),
    ).length;
    const scores = suppliers.map((supplier) => supplier.score).filter((score): score is number => typeof score === "number");
    const avgScore = scores.length ? Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length) : 0;

    return { total, critical, pending, avgScore };
  }, [suppliers]);

  return (
    <>
      <SecureTopbar placeholder="Pesquisar fornecedores ou domínios..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="mb-10 flex items-end justify-between">
          <SecurePageHeader
            title="Avaliação de Fornecedores"
            subtitle="Gestão centralizada do seu ecossistema de confiança. Monitore riscos, conformidade e saúde de segurança de seus parceiros em tempo real."
          />
          <div className="flex items-center gap-3">
            <Link
              href="/due-diligence-terceiros/novo-fornecedor"
              className="flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition-all hover:bg-slate-200"
            >
              <span className="material-symbols-outlined">domain_add</span>
              Novo Fornecedor
            </Link>
            <Link
              href="/due-diligence-terceiros/novo-questionario"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]"
            >
              <span className="material-symbols-outlined">add</span>
              Novo Questionário
            </Link>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <MetricCard
            label="Total de Fornecedores"
            value={kpis.total || 0}
            trailing={
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +3%
              </div>
            }
          />
          <MetricCard
            label="Risco Crítico/Alto"
            value={kpis.critical || 0}
            valueClassName="text-error"
            trailing={
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full border-2 border-white bg-red-100" />
                <div className="h-6 w-6 rounded-full border-2 border-white bg-red-200" />
                <div className="h-6 w-6 rounded-full border-2 border-white bg-red-300" />
              </div>
            }
          />
          <MetricCard
            label="Questionários Pendentes"
            value={kpis.pending || 0}
            trailing={<span className="material-symbols-outlined text-4xl text-primary/40">pending_actions</span>}
          />
          <MetricCard
            label="Score Médio da Cadeia"
            value={kpis.avgScore || "--"}
            suffix="/100"
            trailing={<div className="h-12 w-12 rotate-45 rounded-full border-4 border-primary border-t-slate-100" />}
          />
        </div>

        <div className="mb-12 overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex gap-3">
              <Link
                href="/due-diligence-terceiros/detalhes/filtrar-fornecedores"
                className="flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-bold transition-colors hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filtros
              </Link>
              <Link
                href="/due-diligence-terceiros/detalhes/status-todos"
                className="flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-bold transition-colors hover:bg-slate-200"
              >
                Status: Todos
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <h4 className="font-headline text-lg font-bold">Fornecedores Cadastrados</h4>
              <Link
                href="/due-diligence-terceiros/detalhes/exportar-relatorio"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Exportar Relatório
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low/50 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="px-8 py-5">Fornecedor</th>
                  <th className="px-6 py-5">Risco</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Security Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((supplier) => (
                  <tr key={supplier.name} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low font-bold ${supplier.initialColor}`}>
                          {supplier.initial}
                        </div>
                        <div>
                          <Link
                            href={`/due-diligence-terceiros/fornecedor/${supplier.slug}`}
                            className="font-bold text-white transition-colors hover:text-primary"
                          >
                            {supplier.name}
                          </Link>
                          <p className="text-xs text-on-surface-variant">{supplier.domain}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase ${supplier.riskClass}`}>
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
                      <div className="flex items-center gap-3 w-48">
                        <div className="h-2 flex-grow overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full ${supplier.scoreColor}`} style={{ width: `${supplier.score ?? 0}%` }} />
                        </div>
                        <span className="text-xs font-bold text-white">{supplier.score ?? "--"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-surface-container-low/30 p-4 text-center">
            <button className="text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary">
              Ver Todos os Fornecedores ({suppliers.length})
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-primary/10 p-8 lg:col-span-2">
            <div className="relative z-10">
              <h5 className="mb-3 text-xl font-bold text-primary">Inteligência de Risco AXION</h5>
              <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
                Nossa IA detectou uma vulnerabilidade zero-day em 4 de seus fornecedores de nível 1. Iniciamos automaticamente o reenvio de questionários de compliance específicos.
              </p>
              <div className="flex items-center gap-8">
                <Link
                  href="/due-diligence-terceiros/detalhes/ver-insights"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-md shadow-primary/20 transition-all hover:bg-primary-container"
                >
                  Ver Alerta de Ameaça
                </Link>
                <div className="hidden h-40 w-64 flex-shrink-0 rounded-xl border border-white/60 bg-white/40 p-4 backdrop-blur-sm md:block">
                  <div className="mb-2 h-2 w-1/2 rounded bg-primary/20" />
                  <div className="mb-2 h-2 w-3/4 rounded bg-primary/20" />
                  <div className="mb-6 h-2 w-1/3 rounded bg-primary/20" />
                  <div className="grid h-16 grid-cols-5 items-end gap-1">
                    <div className="h-[30%] rounded-t-sm bg-primary" />
                    <div className="h-[60%] rounded-t-sm bg-primary" />
                    <div className="h-[45%] rounded-t-sm bg-primary" />
                    <div className="h-[90%] rounded-t-sm bg-primary" />
                    <div className="h-[70%] rounded-t-sm bg-primary" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 text-center shadow-panel">
            <p className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Compliance Global</p>
            <div className="relative mb-6 h-32 w-32">
              <svg className="h-full w-full -rotate-90 transform">
                <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="364.42"
                  strokeDashoffset="40.08"
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-extrabold text-white">89%</span>
              </div>
            </div>
            <p className="mb-1 text-sm font-bold text-white">Cadeia em Conformidade</p>
            <p className="text-xs text-on-surface-variant">Baseado em ISO 27001 & SOC2</p>
          </div>
        </div>
      </main>
    </>
  );
}
