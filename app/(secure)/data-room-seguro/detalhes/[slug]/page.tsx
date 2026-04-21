"use client";

import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import {
  getAccessRequestsForDocument,
  getDataRoomWorkspaceClient,
  getDownloadEventsForDocument,
  getStatusBadgeClass,
  getToneClass,
  getTrustDocumentById,
  getVisibilityBadgeClass,
  updateTrustDocumentStatusClient,
  type DataRoomWorkspace,
} from "../../data-room-data";

function buildBackHref(selected?: string | null) {
  return selected ? `/data-room-seguro?selected=${selected}` : "/data-room-seguro";
}

function getMonthKeyFromLabel(timeLabel: string) {
  const match = timeLabel.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  return `${match[2]}/${match[3]}`;
}

function getMonthLabel(monthKey: string) {
  const [month, year] = monthKey.split("/");
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${monthNames[Number(month) - 1] ?? month}/${year}`;
}

function DataRoomDetailPageContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const itemId = searchParams.get("item");
  const downloadSearch = (searchParams.get("downloadSearch") ?? "").trim().toLowerCase();
  const downloadMonth = searchParams.get("downloadMonth") ?? "Todos";
  const [workspace, setWorkspace] = useState<DataRoomWorkspace>(getDataRoomWorkspaceClient());

  useEffect(() => {
    setWorkspace(getDataRoomWorkspaceClient());
    const refresh = () => setWorkspace(getDataRoomWorkspaceClient());
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const document = useMemo(
    () => workspace.documents.find((entry) => entry.id === itemId) ?? workspace.documents[0] ?? null,
    [itemId, workspace.documents],
  );

  if (slug === "visualizacao-grid" || slug === "visualizacao-lista" || slug === "fechar-painel") {
    router.replace(buildBackHref(itemId));
    return null;
  }

  if (slug === "upload-arquivos") {
    return (
      <>
        <SecureTopbar placeholder="Cadastrar novo documento do Trust..." />
        <main className="min-h-screen bg-surface p-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link href="/data-room-seguro" className="flex items-center gap-2 hover:text-primary"><span className="material-symbols-outlined text-base">arrow_back</span>Data Room Seguro</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="font-semibold text-on-surface">Novo documento do Trust</span>
            </div>
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel xl:col-span-8">
                <SecurePageHeader title="Cadastrar novo documento" subtitle="Suba um arquivo, escolha a categoria em que ele deve aparecer no Trust Center e defina se o acesso será público ou privado." />
                <div className="mt-8 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-10 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"><span className="material-symbols-outlined text-4xl text-primary">upload_file</span></div>
                  <h3 className="text-xl font-bold text-white">Arraste o arquivo para upload</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">Ao publicar, o documento passa a compor a biblioteca do Trust Center conforme a categoria e a política de acesso definidas abaixo.</p>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div><label className="mb-2 block text-sm font-bold text-on-surface">Nome do documento</label><input className="w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface outline-none" placeholder="Ex.: SOC_2_Type_II_Report.pdf" /></div>
                  <div><label className="mb-2 block text-sm font-bold text-on-surface">Categoria</label><select className="w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface outline-none">{workspace.categories.map((category) => <option key={category}>{category}</option>)}</select></div>
                  <div><label className="mb-2 block text-sm font-bold text-on-surface">Visibilidade</label><select className="w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface outline-none"><option>Público</option><option>Privado</option></select></div>
                  <div><label className="mb-2 block text-sm font-bold text-on-surface">Status inicial</label><select className="w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface outline-none"><option>Publicado</option><option>Pendente de aprovação</option><option>Rascunho</option></select></div>
                </div>
                <div className="mt-5"><label className="mb-2 block text-sm font-bold text-on-surface">Descrição</label><textarea rows={4} className="w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface outline-none" placeholder="Explique para o cliente o que este documento representa e em que contexto ele deve ser acessado." /></div>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div><label className="mb-2 block text-sm font-bold text-on-surface">Regra de aprovação</label><input className="w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface outline-none" placeholder="Ex.: liberar somente com NDA e aprovação do GRC" /></div>
                  <div><label className="mb-2 block text-sm font-bold text-on-surface">Owner do documento</label><input className="w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface outline-none" placeholder="Nome do responsável pelo conteúdo" /></div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20">Salvar documento</button>
                  <Link href="/data-room-seguro" className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-50">Cancelar</Link>
                </div>
              </article>
              <aside className="space-y-6 xl:col-span-4">
                <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                  <h3 className="font-headline text-lg font-bold text-white">Como isso aparece no Trust</h3>
                  <div className="mt-4 space-y-3 text-sm text-on-surface-variant">
                    <p><strong className="text-white">Público:</strong> o cliente vê e baixa direto.</p>
                    <p><strong className="text-white">Privado:</strong> o cliente pode ver que o documento existe no Trust, mas o download só acontece para usuários autorizados.</p>
                  </div>
                </article>
              </aside>
            </section>
          </div>
        </main>
      </>
    );
  }

  if (slug === "fila-aprovacoes") {
    const documentsInApproval = workspace.documents.filter((entry) => entry.status === "Pendente de aprovação");

    return (
      <>
        <SecureTopbar placeholder="Buscar solicitações de acesso..." />
        <main className="min-h-screen bg-surface p-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link href="/data-room-seguro" className="flex items-center gap-2 hover:text-primary"><span className="material-symbols-outlined text-base">arrow_back</span>Data Room Seguro</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="font-semibold text-on-surface">Fila de aprovações</span>
            </div>
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel xl:col-span-8">
                <SecurePageHeader title="Fila de aprovações" subtitle="Revise documentos pendentes antes da publicação no Trust Center." />
                <div className="mt-8 space-y-4">
                  {documentsInApproval.length > 0 ? (
                    documentsInApproval.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-base font-bold text-white">{entry.name}</h3>
                            <p className="text-sm text-on-surface-variant">{entry.category} • {entry.owner}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeClass(entry.status)}`}>{entry.status}</span>
                        </div>
                        <p className="mt-4 text-sm text-on-surface-variant">{entry.approvalRule}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const next = updateTrustDocumentStatusClient(entry.id, "Publicado");
                              setWorkspace(next);
                            }}
                            className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-4 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20"
                          >
                            Aprovar e publicar
                          </button>
                          <Link href={`/data-room-seguro/detalhes/documento?item=${entry.id}`} className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-50">
                            Ver documento
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-6 text-sm text-on-surface-variant">
                      Nenhum documento aguardando aprovação no momento.
                    </div>
                  )}
                </div>
              </article>
            </section>
          </div>
        </main>
      </>
    );
  }

  if (slug !== "documento" && slug !== "acao-item" && slug !== "ver-relatorio-completo" && slug !== "editar-expiracao") {
    notFound();
  }

  if (!document) {
    notFound();
  }

  const requests = getAccessRequestsForDocument(document.id);
  const events = getDownloadEventsForDocument(document.id);
  const baseDownloadEvents = events.filter((event) => event.actionLabel.toLowerCase().includes("download"));
  const monthOptions = Array.from(new Set(baseDownloadEvents.map((event) => getMonthKeyFromLabel(event.timeLabel)).filter(Boolean))) as string[];
  const downloadEvents = baseDownloadEvents
    .filter((event) => {
      if (!downloadSearch) return true;
      return `${event.actor} ${event.company}`.toLowerCase().includes(downloadSearch);
    })
    .filter((event) => {
      if (downloadMonth === "Todos") return true;
      return getMonthKeyFromLabel(event.timeLabel) === downloadMonth;
    });

  return (
    <>
      <SecureTopbar placeholder="Buscar documento do Trust..." />
      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href={buildBackHref(document.id)} className="flex items-center gap-2 hover:text-primary"><span className="material-symbols-outlined text-base">arrow_back</span>Data Room Seguro</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-semibold text-on-surface">Detalhe do documento</span>
          </div>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel xl:col-span-8">
              <SecurePageHeader title="Detalhe do documento" subtitle="Revise como este arquivo aparece no Trust Center, qual é a política de acesso e como está o fluxo de solicitações." />

              <div className="mt-8 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><span className={`material-symbols-outlined text-3xl ${document.iconClass}`}>{document.icon}</span></div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{document.name}</h3>
                      <p className="mt-1 text-sm text-on-surface-variant">{document.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getVisibilityBadgeClass(document.visibility)}`}>{document.visibility}</span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeClass(document.status)}`}>{document.status}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Categoria</p><p className="mt-1 text-sm font-semibold text-on-surface">{document.category}</p></div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Versão</p><p className="mt-1 text-sm font-semibold text-on-surface">{document.version}</p></div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Publicado</p><p className="mt-1 text-sm font-semibold text-on-surface">{document.publishedAtLabel ?? "Ainda não publicado"}</p></div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Downloads</p><p className="mt-1 text-sm font-semibold text-on-surface">{document.downloads}</p></div>
              </div>

              <div className="mt-8 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
                <h3 className="text-sm font-bold text-on-surface">Política de acesso do documento</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Visibilidade</span><select defaultValue={document.visibility} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary"><option>Público</option><option>Privado</option></select></label>
                  <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Status de publicação</span><select defaultValue={document.status} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none transition focus:border-primary"><option>Publicado</option><option>Pendente de aprovação</option><option>Rascunho</option></select></label>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="block rounded-xl bg-surface-container-lowest p-4"><span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Visível no Trust</span><select defaultValue={document.visibleInTrustCenter ? "Sim" : "Não"} className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm font-semibold text-on-surface outline-none transition focus:border-primary"><option>Sim</option><option>Não</option></select></label>
                  <label className="block rounded-xl bg-surface-container-lowest p-4"><span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Exige aprovação</span><select defaultValue={document.requiresApproval ? "Sim" : "Não"} className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm font-semibold text-on-surface outline-none transition focus:border-primary"><option>Sim</option><option>Não</option></select></label>
                  <label className="block rounded-xl bg-surface-container-lowest p-4"><span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">NDA</span><select defaultValue={document.ndaRequired ? "Obrigatório" : "Não obrigatório"} className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm font-semibold text-on-surface outline-none transition focus:border-primary"><option>Obrigatório</option><option>Não obrigatório</option></select></label>
                </div>
                <div className="mt-4"><label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Regra de aprovação / acesso</span><textarea rows={4} defaultValue={document.approvalRule} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary" /></label></div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20">Salvar alterações</button>
                {workspace.publishingMode === "approval_required" ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = updateTrustDocumentStatusClient(document.id, "Pendente de aprovação");
                      setWorkspace(next);
                    }}
                    className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-50"
                  >
                    Enviar para aprovação
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const next = updateTrustDocumentStatusClient(document.id, "Publicado");
                      setWorkspace(next);
                    }}
                    className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-50"
                  >
                    Publicar no Trust
                  </button>
                )}
                <button className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100">Deletar documento</button>
              </div>
            </article>

            <aside className="space-y-6 xl:col-span-4">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <h3 className="font-headline text-lg font-bold text-white">Solicitações de acesso</h3>
                <div className="mt-4 space-y-3">
                  {requests.length > 0 ? requests.map((request) => (
                    <div key={request.id} className="rounded-xl bg-surface-container-low p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{request.requester}</p>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeClass(request.status)}`}>{request.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-on-surface-variant">{request.company} • {request.requestedAtLabel}</p>
                    </div>
                  )) : <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Nenhuma solicitação recebida para este documento.</div>}
                </div>
              </article>

              <article className="flex min-h-[980px] flex-col rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-white">Downloads do documento</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">Total de vezes que este arquivo foi baixado no Trust Center.</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 px-4 py-3 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Total</p>
                    <p className="mt-1 text-2xl font-extrabold text-primary">{document.downloads}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Legenda</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-3 py-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><span className="text-xs font-semibold text-on-surface">Download público</span></div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-3 py-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /><span className="text-xs font-semibold text-on-surface">Download privado por usuário autorizado</span></div>
                  </div>
                </div>
                <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_150px]">
                  <input type="hidden" name="item" value={document.id} />
                  <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Buscar</span><input type="search" name="downloadSearch" defaultValue={searchParams.get("downloadSearch") ?? ""} placeholder="Nome, email ou empresa" className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary" /></label>
                  <label className="block"><span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">Mês/ano</span><select name="downloadMonth" defaultValue={downloadMonth} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"><option value="Todos">Todos</option>{monthOptions.map((month) => <option key={month} value={month}>{getMonthLabel(month)}</option>)}</select></label>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <button type="submit" className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">Filtrar downloads</button>
                    <Link href={`/data-room-seguro/detalhes/documento?item=${document.id}`} className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-50">Limpar</Link>
                  </div>
                </form>
                <div className="mt-5 flex-1 overflow-y-auto pr-1">
                  <div className="space-y-3">
                    {downloadEvents.length > 0 ? downloadEvents.map((event) => (
                      <div key={event.id} className="rounded-xl bg-surface-container-low p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">{event.actor}</p>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${getToneClass(event.tone)}`}>Download</span>
                        </div>
                        <p className="mt-1 text-xs text-on-surface-variant">{event.company}</p>
                        <p className="mt-2 text-xs font-medium text-slate-500">{event.timeLabel}</p>
                      </div>
                    )) : <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Nenhum download encontrado com os filtros informados.</div>}
                  </div>
                </div>
              </article>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

export default function DataRoomDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <DataRoomDetailPageContent />
    </Suspense>
  );
}
