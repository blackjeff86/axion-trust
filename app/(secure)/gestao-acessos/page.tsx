"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import {
  defaultAccessManagementState,
  getAccessManagementStateClient,
  STORAGE_KEY,
  type ApprovedAccess,
  type DeniedAccess,
  type PendingRequest,
} from "./access-data";

export default function GestaoAcessosPage() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [approvedAccesses, setApprovedAccesses] = useState<ApprovedAccess[]>([]);
  const [deniedAccesses, setDeniedAccesses] = useState<DeniedAccess[]>([]);

  useEffect(() => {
    const state = getAccessManagementStateClient();
    setPendingRequests(state.pendingRequests);
    setApprovedAccesses(state.approvedAccesses);
    setDeniedAccesses(state.deniedAccesses);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        pendingRequests,
        approvedAccesses,
        deniedAccesses,
      }),
    );
  }, [approvedAccesses, deniedAccesses, pendingRequests]);

  function handleApprove(request: PendingRequest) {
    const approvedAt = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    const expiresAt = expirationDate.toLocaleDateString("pt-BR");

    setPendingRequests((current) => current.filter((item) => item.id !== request.id));
    setApprovedAccesses((current) => [
      {
        id: `approved-${request.id}`,
        requester: request.requester,
        email: request.email,
        company: request.company,
        document: request.document,
        approvedAt,
        expiresAt,
        status: "Ativo",
        statusClass: "bg-emerald-100 text-emerald-700",
      },
      ...current,
    ]);
  }

  function handleDeny(request: PendingRequest) {
    const deniedAt = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setPendingRequests((current) => current.filter((item) => item.id !== request.id));
    setDeniedAccesses((current) => [{ ...request, deniedAt }, ...current]);
  }

  function handleReviewDenied(item: DeniedAccess) {
    setDeniedAccesses((current) => current.filter((entry) => entry.id !== item.id));
    setPendingRequests((current) => [
      {
        id: `reopened-${item.id}`,
        requester: item.requester,
        email: item.email,
        company: item.company,
        document: item.document,
        requestedAt: item.deniedAt,
        reason: item.reason,
        documentType: item.documentType,
        reviewTag: "Pedido retornado",
      },
      ...current,
    ]);
  }

  function handleRevokeAccess(access: ApprovedAccess) {
    const deniedAt = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setApprovedAccesses((current) => current.filter((item) => item.id !== access.id));
    setDeniedAccesses((current) => [
      {
        id: `denied-${access.id}`,
        requester: access.requester,
        email: access.email,
        company: access.company,
        document: access.document,
        requestedAt: access.approvedAt,
        reason: "Acesso revogado manualmente pelo administrador do Trust.",
        documentType: "Documento privado",
        reviewTag: null,
        deniedAt,
      },
      ...current,
    ]);
  }

  function handleRestoreMocks() {
    setPendingRequests(defaultAccessManagementState.pendingRequests);
    setApprovedAccesses(defaultAccessManagementState.approvedAccesses);
    setDeniedAccesses(defaultAccessManagementState.deniedAccesses);
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar solicitacoes, empresas ou documentos..." />

      <main className="min-h-screen p-8">
        <div className="mb-10">
          <SecurePageHeader
            title="Gestão de Acessos ao Trust"
            subtitle="Acompanhe pedidos de acesso a documentos privados do Trust Center. O administrador do cliente decide quem pode baixar cada arquivo sensível, com validade padrão de 1 ano e ajuste manual quando necessário."
          />
          <div className="mt-4">
            <button
              type="button"
              onClick={handleRestoreMocks}
              className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-slate-50"
            >
              Restaurar dados mockados
            </button>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-primary/10 p-2 text-primary">pending_actions</span>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">PENDENTE</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">{pendingRequests.length}</div>
            <div className="text-xs font-medium text-on-surface-variant">Novas solicitacoes</div>
          </div>

          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-green-400/10 p-2 text-green-400">verified</span>
              <span className="rounded-full bg-green-400/10 px-2 py-1 text-xs font-bold text-green-400">ATIVO</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">
              {approvedAccesses.filter((item) => item.status === "Ativo").length}
            </div>
            <div className="text-xs font-medium text-on-surface-variant">Acessos liberados</div>
          </div>

          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-tertiary/10 p-2 text-tertiary">schedule</span>
              <span className="rounded-full bg-tertiary/10 px-2 py-1 text-xs font-bold text-tertiary">AVISO</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">
              {approvedAccesses.filter((item) => item.status === "Expira em breve").length}
            </div>
            <div className="text-xs font-medium text-on-surface-variant">Expirando em breve</div>
          </div>

          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-error/10 p-2 text-error">history</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">452</div>
            <div className="text-xs font-medium text-on-surface-variant">Eventos auditados</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="flex items-center justify-between border-b border-outline-variant/10 px-8 py-6">
              <div>
                <h3 className="font-headline text-lg font-bold text-white">Solicitações pendentes</h3>
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
                      <p className="mt-1 text-sm text-on-surface-variant">Aprovar ou negar acesso ao download deste documento. Regra padrao: 1 ano de validade, com override manual pelo administrador.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-start gap-2 lg:justify-end">
                    <Link
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handleDeny(request);
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
                        handleApprove(request);
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
                <h3 className="font-headline text-lg font-bold text-white">Acessos já liberados</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Pessoas e empresas terceiras que receberam permissão para baixar documentos privados.
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
                    <th className="px-8 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {approvedAccesses.map((item) => (
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
                      <td className="px-8 py-5 text-xs font-medium text-white">{item.expiresAt}</td>
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
                Exibindo {approvedAccesses.length} acessos liberados
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
                <h3 className="font-headline text-lg font-bold text-white">Acessos não liberados</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Solicitações negadas pelo administrador do Trust.
                </p>
              </div>
            </div>

            {deniedAccesses.length > 0 ? (
              <div className="divide-y divide-outline-variant/10">
                {deniedAccesses.map((item) => (
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
                      <Link
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          handleReviewDenied(item);
                        }}
                        className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-slate-50"
                      >
                        REVISAR
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-8 py-8 text-sm text-on-surface-variant">
                Nenhuma solicitação negada até o momento.
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
