"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import { MetricCard } from "@/components/ui/metric-card";
import {
  getAccessRequestsForDocument,
  getDataRoomWorkspaceClient,
  getStatusBadgeClass,
  getVisibilityBadgeClass,
  type DataRoomWorkspace,
} from "./data-room-data";

function buildRoomHref(filters: {
  category?: string;
  visibility?: string;
  status?: string;
  selected?: string | null;
}) {
  const params = new URLSearchParams();

  if (filters.category && filters.category !== "Todos") params.set("category", filters.category);
  if (filters.visibility && filters.visibility !== "Todos") params.set("visibility", filters.visibility);
  if (filters.status && filters.status !== "Todos") params.set("status", filters.status);
  if (filters.selected) params.set("selected", filters.selected);

  const query = params.toString();
  return query ? `/data-room-seguro?${query}` : "/data-room-seguro";
}

function DataRoomSeguroPageContent() {
  const searchParams = useSearchParams();
  const [workspace, setWorkspace] = useState<DataRoomWorkspace>(getDataRoomWorkspaceClient());

  useEffect(() => {
    setWorkspace(getDataRoomWorkspaceClient());

    function handleStorage(event: StorageEvent) {
      if (event.key) {
        setWorkspace(getDataRoomWorkspaceClient());
      }
    }

    function handleFocus() {
      setWorkspace(getDataRoomWorkspaceClient());
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const selectedCategory = searchParams.get("category") ?? "Todos";
  const selectedVisibility = searchParams.get("visibility") ?? "Todos";
  const selectedStatus = searchParams.get("status") ?? "Todos";
  const selectedId = searchParams.get("selected");

  const documents = useMemo(
    () =>
      workspace.documents.filter((document) => {
        if (selectedCategory !== "Todos" && document.category !== selectedCategory) return false;
        if (selectedVisibility !== "Todos" && document.visibility !== selectedVisibility) return false;
        if (selectedStatus !== "Todos" && document.status !== selectedStatus) return false;
        return true;
      }),
    [selectedCategory, selectedStatus, selectedVisibility, workspace.documents],
  );

  const selectedDocument = useMemo(
    () => workspace.documents.find((entry) => entry.id === selectedId) ?? documents[0] ?? workspace.documents[0] ?? null,
    [documents, selectedId, workspace.documents],
  );

  const selectedRequests = useMemo(
    () => getAccessRequestsForDocument(selectedDocument?.id).slice(0, 3),
    [selectedDocument?.id, workspace.requests],
  );

  const totalPublished = workspace.documents.filter((document) => document.status === "Publicado").length;
  const totalPending = workspace.documents.filter((document) => document.status === "Pendente de aprovacao").length;
  const totalPublic = workspace.documents.filter((document) => document.visibility === "Publico").length;
  const totalApprovalFlow = workspace.documents.filter((document) => document.requiresApproval).length;

  return (
    <>
      <SecureTopbar placeholder="Pesquisar documentos do Trust..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <SecurePageHeader title={workspace.title} subtitle={workspace.subtitle} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/data-room-seguro/detalhes/upload-arquivos"
                className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined mr-2 align-middle text-base">upload_file</span>
                Novo documento
              </Link>
              <Link
                href="/data-room-seguro/detalhes/fila-aprovacoes"
                className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-50"
              >
                <span className="material-symbols-outlined mr-2 align-middle text-base">approval</span>
                Fila de aprovacoes
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <MetricCard
              label="Publicados"
              value={totalPublished}
              valueClassName="text-emerald-600"
              trailing={
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                  Liberados
                </div>
              }
            />
            <MetricCard
              label="Pendentes"
              value={totalPending}
              valueClassName="text-amber-500"
              trailing={<span className="material-symbols-outlined text-4xl text-amber-300">schedule</span>}
            />
            <MetricCard
              label="Públicos"
              value={totalPublic}
              valueClassName="text-blue-600"
              trailing={<span className="material-symbols-outlined text-4xl text-blue-300">public</span>}
            />
            <MetricCard
              label="Com Aprovação"
              value={totalApprovalFlow}
              valueClassName="text-rose-600"
              trailing={<span className="material-symbols-outlined text-4xl text-rose-300">approval</span>}
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <form action="/data-room-seguro" method="get" className="flex flex-col gap-4 xl:flex-row xl:items-end">
                  {selectedDocument?.id ? <input type="hidden" name="selected" value={selectedDocument.id} /> : null}

                  <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Categoria</span>
                      <select name="category" defaultValue={selectedCategory} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary">
                        {["Todos", ...workspace.categories].map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Tipo de acesso</span>
                      <select name="visibility" defaultValue={selectedVisibility} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary">
                        {["Todos", "Publico", "Privado"].map((visibility) => (
                          <option key={visibility} value={visibility}>{visibility}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Status de publicacao</span>
                      <select name="status" defaultValue={selectedStatus} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary">
                        {["Todos", "Publicado", "Pendente de aprovacao", "Rascunho"].map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 xl:pb-px">
                    <button type="submit" className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">
                      Aplicar filtros
                    </button>
                    <Link href={buildRoomHref({ selected: selectedDocument?.id, category: "Todos", visibility: "Todos", status: "Todos" })} className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-50">
                      Limpar
                    </Link>
                  </div>
                </form>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-outline-variant/15 bg-surface-container-low px-4 py-3">
                  <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">{documents.length}</strong> documento(s) encontrado(s)</p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Biblioteca do Trust Center</p>
                </div>
              </article>

              <article className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-surface-container-low/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Documento</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Categoria</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Acesso</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Downloads</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {documents.map((document) => {
                      const isSelected = selectedDocument?.id === document.id;

                      return (
                        <tr key={document.id} className={`${isSelected ? "border-l-4 border-primary bg-primary/10" : ""} group transition-colors hover:bg-slate-50/40`}>
                          <td className="px-6 py-4">
                            <Link href={buildRoomHref({ category: selectedCategory, visibility: selectedVisibility, status: selectedStatus, selected: document.id })} className="flex items-center gap-3">
                              <span className={`material-symbols-outlined text-2xl ${document.iconClass}`}>{document.icon}</span>
                              <div>
                                <p className="text-sm font-semibold text-white">{document.name}</p>
                                <p className="text-xs text-on-surface-variant">{document.description}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface">{document.category}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getVisibilityBadgeClass(document.visibility)}`}>{document.visibility}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeClass(document.status)}`}>{document.status}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface">{document.downloads}</td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/data-room-seguro/detalhes/documento?item=${document.id}`} className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-slate-50">
                              Gerenciar
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </article>
            </div>

            <aside className="space-y-6 xl:col-span-4">
              {selectedDocument ? (
                <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <span className={`material-symbols-outlined text-3xl ${selectedDocument.iconClass}`}>{selectedDocument.icon}</span>
                    </div>
                    <Link href={`/data-room-seguro/detalhes/documento?item=${selectedDocument.id}`} className="rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
                      Abrir detalhe
                    </Link>
                  </div>

                  <h3 className="font-headline text-xl font-bold text-white">{selectedDocument.name}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{selectedDocument.description}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getVisibilityBadgeClass(selectedDocument.visibility)}`}>{selectedDocument.visibility}</span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeClass(selectedDocument.status)}`}>{selectedDocument.status}</span>
                    <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{selectedDocument.category}</span>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Versao</p>
                      <p className="mt-1 text-sm font-semibold text-on-surface">{selectedDocument.version}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Owner</p>
                      <p className="mt-1 text-sm font-semibold text-on-surface">{selectedDocument.owner}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Atualizacao</p>
                      <p className="mt-1 text-sm font-semibold text-on-surface">{selectedDocument.updatedAtLabel}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Downloads</p>
                      <p className="mt-1 text-sm font-semibold text-on-surface">{selectedDocument.downloads}</p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                    <p className="text-sm font-bold text-on-surface">Modelo de acesso</p>
                    <p className="mt-2 text-sm text-on-surface-variant">{selectedDocument.approvalRule}</p>
                    <div className="mt-3 space-y-2 text-xs text-on-surface-variant">
                      <p>Visivel no Trust Center: {selectedDocument.visibleInTrustCenter ? "Sim" : "Nao"}</p>
                      <p>Exige aprovacao: {selectedDocument.requiresApproval ? "Sim" : "Nao"}</p>
                      <p>NDA: {selectedDocument.ndaRequired ? "Obrigatorio" : "Nao obrigatorio"}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="mb-3 text-sm font-bold text-on-surface">Ultimas solicitacoes</p>
                    <div className="space-y-3">
                      {selectedRequests.length > 0 ? (
                        selectedRequests.map((request) => (
                          <div key={request.id} className="rounded-xl bg-surface-container-low p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-white">{request.requester}</p>
                              <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeClass(request.status)}`}>{request.status}</span>
                            </div>
                            <p className="mt-1 text-xs text-on-surface-variant">{request.company} • {request.requestedAtLabel}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Nenhuma solicitacao recente para este documento.</div>
                      )}
                    </div>
                  </div>
                </article>
              ) : null}
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

export default function DataRoomSeguroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <DataRoomSeguroPageContent />
    </Suspense>
  );
}
