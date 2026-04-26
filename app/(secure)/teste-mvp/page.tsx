"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import { useSecureShell } from "@/components/layout/secure-shell-context";
import {
  MVP_ACCESS_MATRIX,
  ROLE_GROUPS,
  ROLE_LABELS,
  type OrganizationRoleName,
  roleCan,
} from "@/lib/access-control";

type EndpointCheck = {
  id: string;
  label: string;
  method: "GET";
  path: string;
  roles: readonly OrganizationRoleName[];
  purpose: string;
};

type EndpointResult = {
  status: number | null;
  ok: boolean;
  error: string | null;
  checkedAt: string;
};

const endpointChecks: EndpointCheck[] = [
  {
    id: "data-room",
    label: "Data Room",
    method: "GET",
    path: "/api/data-room",
    roles: ROLE_GROUPS.tenantReaders,
    purpose: "Le documentos, requests e eventos do tenant ativo.",
  },
  {
    id: "access-management",
    label: "Gestao de Acessos",
    method: "GET",
    path: "/api/access-management",
    roles: ROLE_GROUPS.tenantReaders,
    purpose: "Le requests, grants e estatisticas do tenant ativo.",
  },
  {
    id: "org-members",
    label: "Membros do Tenant",
    method: "GET",
    path: "/api/org-members",
    roles: ROLE_GROUPS.tenantAdmins,
    purpose: "Lista membros internos; deve bloquear editor/viewer.",
  },
];

const scenarioFallback = {
  title: "Tenant customizado",
  tone: "Operacao multi-tenant",
  description: "Use esta pagina para validar o tenant ativo, papeis, endpoints e segregacao.",
  accentClassName: "from-slate-700/60 to-slate-900/80",
};

function getTenantScenario(displayName: string) {
  if (displayName.includes("Orbit")) {
    return {
      title: "Pagina teste Orbit Cloud",
      tone: "SaaS cloud enterprise",
      description: "Cenario focado em SOC 2, procurement enterprise e grants privados por documento.",
      accentClassName: "from-blue-500/25 to-violet-500/10",
    };
  }

  if (displayName.includes("Helio")) {
    return {
      title: "Pagina teste Helio Bank",
      tone: "Fintech regulada",
      description: "Cenario com LGPD, PCI DSS, continuidade e expiracao curta de grants sensiveis.",
      accentClassName: "from-cyan-500/25 to-amber-500/10",
    };
  }

  if (displayName.includes("AXION")) {
    return {
      title: "Pagina teste AXION Trust",
      tone: "Enterprise security",
      description: "Cenario base com Trust Center, Data Room, due diligence e acessos externos.",
      accentClassName: "from-primary/25 to-emerald-500/10",
    };
  }

  return scenarioFallback;
}

function isExpectedSuccess(role: OrganizationRoleName | null, roles: readonly OrganizationRoleName[]) {
  return Boolean(role && roles.includes(role));
}

function getStatusClass(result: EndpointResult | undefined, expectedSuccess: boolean) {
  if (!result?.status) return "border-slate-700 bg-slate-900/60 text-slate-300";

  const matched = expectedSuccess ? result.status >= 200 && result.status < 300 : result.status === 403;

  return matched
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
    : "border-rose-400/20 bg-rose-500/10 text-rose-200";
}

export default function TesteMvpPage() {
  const shell = useSecureShell();
  const activeRole = shell.organization.role;
  const [results, setResults] = useState<Record<string, EndpointResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [isSwitchingTenantId, setIsSwitchingTenantId] = useState<string | null>(null);
  const activeScenario = useMemo(() => getTenantScenario(shell.organization.displayName), [shell.organization.displayName]);

  const runChecks = useCallback(async () => {
    setIsRunning(true);

    const nextResults = await Promise.all(
      endpointChecks.map(async (check) => {
        try {
          const response = await fetch(check.path, {
            method: check.method,
            cache: "no-store",
          });

          return [
            check.id,
            {
              status: response.status,
              ok: response.ok,
              error: null,
              checkedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            },
          ] as const;
        } catch (error) {
          return [
            check.id,
            {
              status: null,
              ok: false,
              error: error instanceof Error ? error.message : "Falha desconhecida",
              checkedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            },
          ] as const;
        }
      }),
    );

    setResults(Object.fromEntries(nextResults));
    setIsRunning(false);
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  async function switchTenant(organizationId: string) {
    setIsSwitchingTenantId(organizationId);

    try {
      const response = await fetch("/api/auth/active-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        window.location.reload();
        return;
      }
    } finally {
      setIsSwitchingTenantId(null);
    }
  }

  return (
    <>
      <SecureTopbar placeholder="Validar tenant, RBAC e endpoints..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <section className={`overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${activeScenario.accentClassName} p-8 shadow-[0_24px_80px_rgba(15,23,42,0.35)]`}>
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <SecurePageHeader title="Teste MVP multi-tenant" subtitle={activeScenario.description} />
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
                    {activeScenario.tone}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
                    {shell.organization.displayName}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
                    {activeRole ? ROLE_LABELS[activeRole] : "Sem papel"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={runChecks}
                disabled={isRunning}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-slate-950/10 transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                {isRunning ? "Testando..." : "Rodar testes"}
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {shell.organizations.map((organization) => {
              const scenario = getTenantScenario(organization.displayName);
              const isActive = organization.id === shell.organization.id;

              return (
                <article
                  key={organization.id}
                  className={`rounded-3xl border p-5 transition ${
                    isActive
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/10 bg-slate-950/50 hover:border-white/20"
                  }`}
                >
                  <div className={`mb-4 h-24 rounded-2xl bg-gradient-to-br ${scenario.accentClassName}`} />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{scenario.tone}</p>
                  <h2 className="mt-2 text-lg font-extrabold text-white">{scenario.title}</h2>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">{scenario.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
                      {ROLE_LABELS[organization.role]}
                    </span>
                    <button
                      type="button"
                      disabled={isActive || isSwitchingTenantId === organization.id}
                      onClick={() => switchTenant(organization.id)}
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-primary/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isActive ? "Ativo" : isSwitchingTenantId === organization.id ? "Trocando..." : "Testar tenant"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {endpointChecks.map((check) => {
              const result = results[check.id];
              const expectedSuccess = isExpectedSuccess(activeRole, check.roles);

              return (
                <article key={check.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{check.method}</p>
                      <h3 className="mt-2 text-lg font-extrabold text-white">{check.label}</h3>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(result, expectedSuccess)}`}>
                      {result?.status ?? "--"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{check.purpose}</p>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                    <p className="truncate text-xs font-mono text-slate-300">{check.path}</p>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Esperado para {activeRole ? ROLE_LABELS[activeRole] : "sem papel"}:{" "}
                    <span className={expectedSuccess ? "text-emerald-300" : "text-amber-300"}>
                      {expectedSuccess ? "permitido" : "bloqueado"}
                    </span>
                    {result?.checkedAt ? ` · ${result.checkedAt}` : ""}
                    {result?.error ? ` · ${result.error}` : ""}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Matriz de permissoes MVP</p>
                <h2 className="mt-2 text-2xl font-extrabold text-white">Funcoes por tipo de acesso</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                avaliado no tenant ativo
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {MVP_ACCESS_MATRIX.map((permission) => {
                const allowed = roleCan(activeRole, permission.key);

                return (
                  <div key={permission.key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">{permission.label}</h3>
                        <p className="mt-2 text-xs leading-6 text-slate-400">{permission.note}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                        allowed ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-700/50 text-slate-400"
                      }`}>
                        {allowed ? "sim" : "nao"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
