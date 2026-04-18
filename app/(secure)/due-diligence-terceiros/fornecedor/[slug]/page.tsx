"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";
import {
  getLifecycleStatusDescription,
  getLifecycleStatusLabel,
  getLifecycleStatusDot,
  getQuestionnaireRunStatusClass,
  getQuestionnaireOptionsClient,
  getRiskClass,
  getSupplierBySlugClient,
  sendSupplierQuestionnaires,
  updateSupplierAssignments,
  type QuestionnaireOption,
  type SupplierProfile,
} from "../../supplier-data";

export default function FornecedorDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("Selecione os questionarios que este fornecedor deve receber.");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<SupplierProfile["internalNotes"]>([]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    const currentSupplier = getSupplierBySlugClient(slug) ?? null;
    const options = getQuestionnaireOptionsClient();

    setSupplier(currentSupplier);
    setQuestionnaires(options);
    setSelectedIds(currentSupplier?.assignedQuestionnaireIds ?? []);
    setNotes(currentSupplier?.internalNotes ?? []);
    setFeedback(
      currentSupplier?.lifecycleStatus === "pendente-envio"
        ? "Selecione os questionarios que este fornecedor deve receber."
        : "Acompanhe abaixo somente os questionarios enviados e o progresso de resposta.",
    );
  }, [slug]);

  const hasScore = typeof supplier?.score === "number";
  const scoreDashOffset = hasScore && supplier ? 440 - (440 * supplier.score!) / 100 : 440;
  const assignedQuestionnaires = useMemo(
    () => questionnaires.filter((questionnaire) => selectedIds.includes(questionnaire.id)),
    [questionnaires, selectedIds],
  );
  const sentQuestionnaires = useMemo(
    () =>
      (supplier?.questionnaireRuns ?? []).map((run) => ({
        ...run,
        questionnaire: questionnaires.find((item) => item.id === run.questionnaireId),
      })),
    [questionnaires, supplier?.questionnaireRuns],
  );
  const isPendingSend = supplier?.lifecycleStatus === "pendente-envio";

  function toggleQuestionnaire(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function handleSaveAssignments() {
    if (!supplier) {
      return;
    }

    updateSupplierAssignments(supplier.slug, selectedIds);
    const refreshed = getSupplierBySlugClient(supplier.slug) ?? supplier;
    setSupplier(refreshed);
    setSelectedIds(refreshed.assignedQuestionnaireIds);
    setFeedback(
      selectedIds.length > 0
        ? `${selectedIds.length} questionario(s) vinculados. Agora voce ja pode compartilhar com o fornecedor.`
        : "Nenhum questionario vinculado no momento. Selecione pelo menos um template para prosseguir.",
    );
  }

  function handleSendQuestionnaires() {
    if (!supplier) {
      return;
    }

    if (selectedIds.length === 0) {
      setFeedback("Selecione ao menos um questionario antes de compartilhar com o fornecedor.");
      return;
    }

    sendSupplierQuestionnaires(supplier.slug, selectedIds);
    const refreshed = getSupplierBySlugClient(supplier.slug) ?? supplier;
    setSupplier(refreshed);
    setSelectedIds(refreshed.assignedQuestionnaireIds);
    setFeedback("Questionarios compartilhados. Agora a ficha mostra somente os envios e seus respectivos progressos.");
  }

  function handlePublishNote() {
    if (!newNote.trim()) {
      return;
    }

    const nextNote = {
      author: "Ricardo Menezes",
      time: "agora",
      content: newNote.trim(),
    };

    setNotes((current) => [nextNote, ...current]);
    setNewNote("");
  }

  if (!supplier) {
    return (
      <>
        <SecureTopbar placeholder="Buscar no sistema..." />

        <main className="min-h-screen bg-surface p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link href="/due-diligence-terceiros" className="flex items-center gap-2 hover:text-primary">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Due Diligence de Terceiros
              </Link>
            </div>

            <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
              <h2 className="mb-2 font-headline text-2xl font-extrabold text-on-surface">
                Fornecedor nao encontrado
              </h2>
              <p className="mb-6 max-w-2xl text-sm text-on-surface-variant">
                Nao localizamos este cadastro na sua base local. Se ele acabou de ser criado, tente voltar para a
                lista e abrir novamente.
              </p>
              <Link
                href="/due-diligence-terceiros"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Voltar para fornecedores
              </Link>
            </section>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar no sistema..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                <Link href="/due-diligence-terceiros" className="flex items-center gap-2 hover:text-primary">
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Due Diligence de Terceiros
                </Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="font-semibold text-on-surface">{supplier.displayName}</span>
              </div>

              <SecurePageHeader
                title="Detalhamento do Fornecedor"
                subtitle="Revise perfil operacional, evidencias de conformidade e defina quais questionarios existentes serao enviados para este fornecedor."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/due-diligence-terceiros/novo-questionario"
                className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-base">post_add</span>
                Criar novo questionario
              </Link>
              {isPendingSend ? (
                <button
                  onClick={handleSendQuestionnaires}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  Compartilhar questionarios
                </button>
              ) : null}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-4 rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel md:col-span-2">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-container">
                  <span className="material-symbols-outlined text-3xl text-on-primary-container">apartment</span>
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
                    {supplier.displayName}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                      {supplier.segment}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase ${getRiskClass(
                        supplier.risk,
                      )}`}
                    >
                      {supplier.risk}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {supplier.headquartersCity}, {supplier.headquartersCountry}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Dominio</p>
                  <p className="text-sm font-semibold text-on-surface">{supplier.domain}</p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Tipo</p>
                  <p className="text-sm font-semibold text-on-surface">{supplier.supplierType}</p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Criticidade</p>
                  <p className="text-sm font-semibold text-on-surface">{supplier.criticality}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Status atual do cadastro
              </p>
              <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/5 px-4 py-2">
                <span className={`h-2 w-2 rounded-full ${getLifecycleStatusDot(supplier.lifecycleStatus)}`} />
                <span className="text-sm font-semibold text-primary">{getLifecycleStatusLabel(supplier.lifecycleStatus)}</span>
              </div>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {getLifecycleStatusDescription(supplier.lifecycleStatus)}
              </p>
            </div>
          </section>

          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12 rounded-xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel md:col-span-4">
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">Score Geral de Avaliacao</p>
              <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-surface-container-high"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="440"
                    strokeDashoffset={scoreDashOffset}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-on-surface">{hasScore ? supplier.score : "--"}</span>
                  <span className="text-xs font-bold uppercase tracking-tight text-slate-500">indice de 100</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-500">Anterior</p>
                  <p className="text-lg font-bold text-on-surface">
                    {typeof supplier.previousScore === "number" ? supplier.previousScore : "--"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-500">Tendencia</p>
                  <p className="flex items-center justify-center gap-1 text-lg font-bold text-primary">
                    <span className="material-symbols-outlined text-sm">
                      {(supplier.trend ?? 0) >= 0 ? "trending_up" : "trending_down"}
                    </span>
                    {typeof supplier.trend === "number"
                      ? `${supplier.trend > 0 ? "+" : ""}${supplier.trend}`
                      : "--"}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 space-y-6 rounded-xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel md:col-span-8">
              {isPendingSend ? (
                <>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface">
                        Questionarios disponiveis para envio
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
                        Escolha aqui quais templates existentes farao parte da trilha deste fornecedor antes do primeiro envio.
                      </p>
                    </div>
                    <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-on-surface">
                      {feedback}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {questionnaires.map((questionnaire) => {
                      const selected = selectedIds.includes(questionnaire.id);

                      return (
                        <button
                          key={questionnaire.id}
                          onClick={() => toggleQuestionnaire(questionnaire.id)}
                          className={`flex flex-col gap-4 rounded-xl border p-5 text-left transition-all ${
                            selected
                              ? "border-primary/25 bg-primary/5 shadow-[0_10px_30px_-18px_rgba(0,90,182,0.45)]"
                              : "border-outline-variant/15 bg-surface-container-low hover:border-primary/15 hover:bg-slate-50/70"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-on-surface">{questionnaire.name}</span>
                                <span className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                  {questionnaire.version}
                                </span>
                                <span className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                  {questionnaire.source === "catalogo" ? "Catalogo da plataforma" : "Template interno"}
                                </span>
                              </div>
                              <p className="text-sm text-on-surface-variant">{questionnaire.category}</p>
                            </div>
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-primary bg-primary text-on-primary"
                                  : "border-outline-variant/30 bg-surface-container-lowest text-transparent"
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-4 rounded-xl border border-outline-variant/15 bg-surface-container-low p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Questionarios selecionados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {assignedQuestionnaires.length > 0 ? (
                          assignedQuestionnaires.map((questionnaire) => (
                            <span
                              key={questionnaire.id}
                              className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                            >
                              {questionnaire.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-on-surface-variant">
                            Nenhum questionario associado ainda.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleSaveAssignments}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                      >
                        <span className="material-symbols-outlined text-base">save</span>
                        Salvar selecao
                      </button>
                      <button
                        onClick={handleSendQuestionnaires}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-base">send</span>
                        Compartilhar questionarios
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface">
                        Questionarios enviados ao fornecedor
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
                        A partir deste ponto, a analise acompanha somente os questionarios ja compartilhados e o andamento de preenchimento.
                      </p>
                    </div>
                    <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-on-surface">
                      {feedback}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {sentQuestionnaires.length > 0 ? (
                      sentQuestionnaires.map((item) => (
                        <div
                          key={`${item.questionnaireId}-${item.sentAt ?? "sem-data"}`}
                          className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-on-surface">
                                  {item.questionnaire?.name ?? item.questionnaireId}
                                </span>
                                <span className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                  {item.questionnaire?.version ?? "v1.0"}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${getQuestionnaireRunStatusClass(item.status)}`}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-sm text-on-surface-variant">
                                {item.questionnaire?.category ?? "Categoria nao informada"}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                                <span>Enviado em: {item.sentAt ? new Date(item.sentAt).toLocaleDateString("pt-BR") : "--"}</span>
                                <span>Ultima atualizacao: {item.lastUpdatedAt ? new Date(item.lastUpdatedAt).toLocaleDateString("pt-BR") : "--"}</span>
                              </div>
                            </div>

                            <div className="flex min-w-[18rem] flex-col gap-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-on-surface-variant">Preenchimento</span>
                                <span className="font-bold text-on-surface">{item.progress}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
                              </div>
                              <Link
                                href={`/due-diligence-terceiros/fornecedor/${supplier.slug}/questionario/${item.questionnaireId}`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                              >
                                <span className="material-symbols-outlined text-base">visibility</span>
                                Ver respostas e avaliar
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-5 text-sm text-on-surface-variant">
                        Nenhum questionario enviado foi encontrado para este fornecedor.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel xl:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold text-on-surface">Ficha de cadastro e evidencias</h3>
                <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Perfil do fornecedor
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Razao social</p>
                  <p className="text-sm font-semibold text-on-surface">{supplier.legalName}</p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Tax ID / CNPJ</p>
                  <p className="text-sm font-semibold text-on-surface">{supplier.taxId || "Nao informado"}</p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Contato principal</p>
                  <p className="text-sm font-semibold text-on-surface">{supplier.primaryContactName || "Nao informado"}</p>
                  <p className="text-xs text-on-surface-variant">
                    {supplier.primaryContactRole || "Cargo nao informado"} • {supplier.primaryContactEmail || "Sem e-mail"}
                  </p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Contatos de risco</p>
                  <p className="text-xs text-on-surface-variant">Seguranca: {supplier.securityContactEmail || "Nao informado"}</p>
                  <p className="text-xs text-on-surface-variant">Privacidade: {supplier.privacyContactEmail || "Nao informado"}</p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Escopo de acesso</p>
                  <p className="text-sm text-on-surface">{supplier.accessScope || "Nao informado"}</p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Classificacao de dados</p>
                  <p className="text-sm text-on-surface">{supplier.dataClassification || "Nao informado"}</p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Modelo de integracao</p>
                  <p className="text-sm text-on-surface">{supplier.integrationType || "Nao informado"}</p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Hosting model</p>
                  <p className="text-sm text-on-surface">{supplier.hostingModel || "Nao informado"}</p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4 md:col-span-2">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Servicos prestados</p>
                  <p className="text-sm leading-relaxed text-on-surface">
                    {supplier.servicesProvided || "Nenhum servico descrito neste cadastro."}
                  </p>
                </div>
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4 md:col-span-2">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Certificacoes declaradas</p>
                  <div className="flex flex-wrap gap-2">
                    {supplier.certifications.length > 0 ? (
                      supplier.certifications.map((certification) => (
                        <span
                          key={certification}
                          className="rounded-full bg-surface-container-lowest px-3 py-1.5 text-xs font-bold text-on-surface"
                        >
                          {certification}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-on-surface-variant">
                        Nenhuma certificacao registrada.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-outline-variant/15 bg-surface-container-low p-5">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Evidencias de conformidade
                </p>
                <div className="space-y-3">
                  {supplier.evidences.length > 0 ? (
                    supplier.evidences.map((evidence) => (
                      <div
                        key={evidence.title}
                        className={`flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 ${
                          evidence.muted ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-primary">
                            <span className="material-symbols-outlined">{evidence.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{evidence.title}</p>
                            <p className="text-xs text-on-surface-variant">{evidence.meta}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${evidence.statusClass}`}>
                          {evidence.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
                      Ainda nao existem evidencias anexadas para este fornecedor.
                    </div>
                  )}
                </div>
              </div>
            </article>

            <aside className="space-y-6">
              <article className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">Resumo operacional</h3>
                <div className="space-y-4 text-sm text-on-surface-variant">
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Responsavel interno</p>
                    <p className="font-semibold text-on-surface">{supplier.businessOwner || "Nao informado"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Regioes ativas</p>
                    <p>{supplier.activeRegions || "Nao informado"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Paises de operacao</p>
                    <p>{supplier.countriesOfOperation || "Nao informado"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Observacoes</p>
                    <p>{supplier.notes || "Nenhuma observacao adicional cadastrada."}</p>
                  </div>
                </div>
              </article>

              <article className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">speaker_notes</span>
                  <h3 className="font-headline text-lg font-bold text-on-surface">Notas internas</h3>
                </div>

                <div className="space-y-4">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={`${note.author}-${note.time}-${note.content}`} className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <UserInitialsAvatar name={note.author} size="sm" className="h-6 w-6 text-[10px]" />
                          <div>
                            <p className="text-xs font-bold text-on-surface">{note.author}</p>
                            <p className="text-[10px] text-on-surface-variant">{note.time}</p>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-on-surface-variant">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4 text-sm text-on-surface-variant">
                      Nenhuma nota interna registrada.
                    </div>
                  )}

                  <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                    <textarea
                      rows={4}
                      value={newNote}
                      onChange={(event) => setNewNote(event.target.value)}
                      className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 text-sm text-on-surface placeholder:text-on-surface-variant"
                      placeholder="Adicionar comentario interno sobre este fornecedor..."
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={handlePublishNote}
                        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-md shadow-primary/20 transition-all hover:bg-primary-container"
                      >
                        Publicar nota
                      </button>
                    </div>
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
