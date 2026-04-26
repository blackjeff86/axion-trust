"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import {
  defaultAccessManagementState,
  type AccessGrant,
  type AccessManagementState,
  type DeniedAccess,
  type PendingRequest,
} from "./access-data";

export default function GestaoAcessosPage() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(defaultAccessManagementState.pendingRequests);
  const [accessGrants, setAccessGrants] = useState<AccessGrant[]>(defaultAccessManagementState.accessGrants);
  const [deniedRequests, setDeniedRequests] = useState<DeniedAccess[]>(defaultAccessManagementState.deniedRequests);
  const [stats, setStats] = useState(defaultAccessManagementState.stats);

  useEffect(() => {
    loadAccessState();
  }, []);

  function applyState(state: AccessManagementState) {
    setPendingRequests(state.pendingRequests);
    setAccessGrants(state.accessGrants);
    setDeniedRequests(state.deniedRequests);
    setStats(state.stats);
  }

  async function loadAccessState() {
    const response = await fetch("/api/access-management", { cache: "no-store" });
    if (!response.ok) return;
    applyState((await response.json()) as AccessManagementState);
  }

  async function reviewRequest(id: string, decision: "approve" | "deny") {
    const response = await fetch(`/api/access-management/requests/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });

    if (!response.ok) return;
    applyState((await response.json()) as AccessManagementState);
  }

  async function handleRevokeAccess(access: AccessGrant) {
    const response = await fetch(`/api/access-management/grants/${access.id}/revoke`, {
      method: "POST",
    });

    if (!response.ok) return;
    applyState((await response.json()) as AccessManagementState);
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar solicitacoes, empresas ou documentos..." />

      <main className="min-h-screen p-8">
        <div className="mb-10">
          <SecurePageHeader
            title="Gestao de Acessos ao Trust"
            subtitle="Acompanhe pedidos de acesso a documentos privados do Trust Center. O administrador do cliente decide quem pode baixar cada arquivo sensivel, com validade padrao, expiracao e aceite de NDA quando necessario."
          />
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-primary/10 p-2 text-primary">pending_actions</span>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">PENDENTE</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">{stats.pending}</div>
            <div className="text-xs font-medium text-on-surface-variant">Novas solicitacoes</div>
          </div>

          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-green-400/10 p-2 text-green-400">verified</span>
              <span className="rounded-full bg-green-400/10 px-2 py-1 text-xs font-bold text-green-400">ATIVO</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">{stats.active}</div>
            <div className="text-xs font-medium text-on-surface-variant">Grants ativos</div>
          </div>

          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-tertiary/10 p-2 text-tertiary">schedule</span>
              <span className="rounded-full bg-tertiary/10 px-2 py-1 text-xs font-bold text-tertiary">AVISO</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">{stats.expiring}</div>
            <div className="text-xs font-medium text-on-surface-variant">Expirando em breve</div>
          </div>

          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-error/10 p-2 text-error">history</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">{stats.auditEvents}</div>
            <div className="text-xs font-medium text-on-surface-variant">Eventos auditados</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="flex items-center justify-between border-b border-outline-variant/10 px-8 py-6">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">Solicitacoes pendentes</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Pedidos criados quando um terceiro tenta baixar um documento privado do Trust.
                </p>
              </div>
              <Link href="/gestao-acessos/detalhes/ver-solicitacoes" className="text-xs font-bold text-primary transition-all hover:underline">
                VER TODAS
              </Link>
            </div>

            <div className="divide-y divide-outline-variant/10">
              {pendingRequests.map((request) => (
                <div key={request.id} className="grid grid-cols-1 gap-5 px-8 py-6 lg:grid-cols-[minmax(0,2.8fr)_minmax(0,1.8fr)_minmax(0,1.3fr)] lg:items-end">
                  <div className="min-w-0">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-high">
                        <span className="material-symbols-outlined text-white">lock_open_right</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white">{request.requester}</h4>
                        <p className="text-xs text-on-surface-variant">
                          {request.company} • {request.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                        {request.documentType}
                      </span>
                      <span className="rounded bg-secondary-container/30 px-2 py-0.5 text-[10px] font-bold uppercase text-secondary">
                        {request.document}
                      </span>
                      {request.reviewTag ? (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                          {request.reviewTag}
                        </span>
                      ) : null}
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                        NDA {request.ndaAcceptedAt ? "aceito" : "pendente"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-on-surface-variant">{request.reason}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Data da solicitacao</p>
                      <p className="mt-1 text-sm font-semibold text-white">{request.requestedAt}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Decisao esperada</p>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        Aprovar ou negar acesso ao download deste documento. O grant e emitido por documento e nao abre o tenant inteiro.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-start gap-2 lg:justify-end">
                    <Link
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        reviewRequest(request.id, "deny");
                      }}
                      className="rounded-lg bg-error/10 p-2 text-error transition-all hover:bg-error/20"
                      title="Negar"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </Link>
                    <Link
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        reviewRequest(request.id, "approve");
                      }}
                      className="min-w-[112px] rounded-lg bg-primary px-4 py-2 text-center text-xs font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-container"
                    >
                      APROVAR
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="flex items-center justify-between border-b border-outline-variant/10 px-8 py-6">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">Grants ja liberados</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Pessoas e empresas terceiras que receberam permissao para baixar documentos privados.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-on-surface-variant">Filtrar por:</span>
                <div className="flex gap-1">
                  <Link href="/gestao-acessos/detalhes/filtro-todos" className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold text-primary">
                    Todos
                  </Link>
                  <Link href="/gestao-acessos/detalhes/filtro-expirando" className="rounded-full bg-transparent px-3 py-1 text-[10px] font-bold text-on-surface-variant transition-all hover:bg-surface-container-low">
                    Expirando em breve
                  </Link>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Solicitante</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Documento liberado</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Aprovado em</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Expira em</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-8 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {accessGrants.map((item) => (
                    <tr key={item.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-8 py-5">
                        <div>
                          <div className="text-sm font-semibold text-white">{item.requester}</div>
                          <div className="text-[11px] text-on-surface-variant">
                            {item.company} • {item.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-on-surface">{item.document}</td>
                      <td className="px-8 py-5 text-xs text-on-surface-variant">{item.approvedAt}</td>
                      <td className="px-8 py-5 text-xs font-medium text-white">
                        <div>{item.expiresAt}</div>
                        <div className="mt-1 text-[10px] font-medium text-slate-500">
                          NDA: {item.ndaAcceptedAt ? "aceito" : "pendente"}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-tighter ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRevokeAccess(item)}
                          className="rounded-lg bg-error/10 p-2 text-error transition-all hover:bg-error/20"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/30 px-8 py-4">
              <p className="text-[11px] font-medium text-on-surface-variant">
                Exibindo {accessGrants.length} grants de documento
              </p>
              <div className="flex gap-2">
                <Link href="/gestao-acessos/detalhes/paginacao-anterior" className="rounded bg-surface-container-high p-1.5 text-on-surface-variant hover:text-white">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </Link>
                <Link href="/gestao-acessos/detalhes/paginacao-proxima" className="rounded bg-primary p-1.5 text-on-primary">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="flex items-center justify-between border-b border-outline-variant/10 px-8 py-6">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">Solicitacoes negadas</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Solicitacoes negadas pelo administrador do Trust.
                </p>
              </div>
            </div>

            {deniedRequests.length > 0 ? (
              <div className="divide-y divide-outline-variant/10">
                {deniedRequests.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 gap-5 px-8 py-6 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1.8fr)_minmax(0,1.2fr)] lg:items-end">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.requester}</h4>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {item.company} • {item.email}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                          Negado
                        </span>
                        <span className="rounded bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                          {item.document}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-on-surface-variant">{item.reason}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Negado em</p>
                      <p className="mt-1 text-sm font-semibold text-white">{item.deniedAt}</p>
                    </div>

                    <div className="flex justify-start lg:justify-end">
                      <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface">
                        Revisado
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-8 py-8 text-sm text-on-surface-variant">
                Nenhuma solicitacao negada ate o momento.
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 border-t border-outline-variant/5 pt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            AXION TRUST - O Curador Digital © 2024 | Auditoria em tempo real habilitada
          </p>
        </footer>
      </main>
    </>
  );
}
