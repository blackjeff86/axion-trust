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
  markSupplierAccessUserInviteSent,
  sendSupplierQuestionnaires,
  upsertSupplier,
  updateSupplierAssignments,
  type SupplierAccessUser,
  type QuestionnaireOption,
  type SupplierProfile,
} from "../../supplier-data";

function EditableTextField({
  editing,
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
}: {
  editing: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      {editing ? (
        multiline ? (
          <textarea
            rows={rows}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
          />
        )
      ) : (
        <p className="text-sm text-on-surface">{value || "Não informado"}</p>
      )}
    </div>
  );
}

function getAccessUserBadgeClass(status: SupplierAccessUser["invitationStatus"]) {
  return status === "enviado"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

function normalizeAccessUserForView(user: SupplierAccessUser | string) {
  if (typeof user === "string") {
    return {
      email: user,
      invitationStatus: "pendente" as const,
      invitationSentAt: undefined,
    };
  }

  return {
    email: user.email,
    invitationStatus: user.invitationStatus,
    invitationSentAt: user.invitationSentAt,
  };
}

export default function FornecedorDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [draftSupplier, setDraftSupplier] = useState<SupplierProfile | null>(null);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("Selecione os questionários que este fornecedor deve receber.");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<SupplierProfile["internalNotes"]>([]);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [newAccessUserEmail, setNewAccessUserEmail] = useState("");
  const [newCertification, setNewCertification] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    const currentSupplier = getSupplierBySlugClient(slug) ?? null;
    const options = getQuestionnaireOptionsClient();

    setSupplier(currentSupplier);
    setDraftSupplier(currentSupplier);
    setQuestionnaires(options);
    setSelectedIds(currentSupplier?.assignedQuestionnaireIds ?? []);
    setNotes(currentSupplier?.internalNotes ?? []);
    setFeedback(
      currentSupplier?.lifecycleStatus === "pendente-envio"
        ? "Selecione os questionários que este fornecedor deve receber."
        : "Acompanhe abaixo somente os questionários enviados e o progresso de resposta.",
    );
  }, [slug]);

  const profile = draftSupplier ?? supplier;
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

  function updateDraft<K extends keyof SupplierProfile>(field: K, value: SupplierProfile[K]) {
    setDraftSupplier((current) => (current ? { ...current, [field]: value } : current));
  }

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
    setDraftSupplier(refreshed);
    setSelectedIds(refreshed.assignedQuestionnaireIds);
    setFeedback(
      selectedIds.length > 0
        ? `${selectedIds.length} questionário(s) vinculados. Agora você já pode compartilhar com o fornecedor.`
        : "Nenhum questionário vinculado no momento. Selecione pelo menos um template para prosseguir.",
    );
  }

  function handleSendQuestionnaires() {
    if (!supplier) {
      return;
    }

    if (selectedIds.length === 0) {
      setFeedback("Selecione ao menos um questionário antes de compartilhar com o fornecedor.");
      return;
    }

    sendSupplierQuestionnaires(supplier.slug, selectedIds);
    const refreshed = getSupplierBySlugClient(supplier.slug) ?? supplier;
    setSupplier(refreshed);
    setDraftSupplier(refreshed);
    setSelectedIds(refreshed.assignedQuestionnaireIds);
    setFeedback("Questionários compartilhados. Agora a ficha mostra somente os envios e seus respectivos progressos.");
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

  function handleStartEdit() {
    setDraftSupplier(supplier);
    setIsEditingSupplier(true);
  }

  function handleCancelEdit() {
    setDraftSupplier(supplier);
    setIsEditingSupplier(false);
    setNewAccessUserEmail("");
    setNewCertification("");
  }

  function handleSaveSupplier() {
    if (!draftSupplier) {
      return;
    }

    const cleanedSupplier = {
      ...draftSupplier,
      certifications: draftSupplier.certifications.filter((item) => item.trim().length > 0),
      accessUsers: draftSupplier.accessUsers.filter((item) => item.email.trim().length > 0),
    };

    upsertSupplier(cleanedSupplier);
    setSupplier(cleanedSupplier);
    setDraftSupplier(cleanedSupplier);
    setIsEditingSupplier(false);
    setFeedback("Dados cadastrais atualizados com sucesso.");
    setNewAccessUserEmail("");
    setNewCertification("");
  }

  function handleAddAccessUser() {
    const email = newAccessUserEmail.trim();

    if (!email || !email.includes("@")) {
      return;
    }

    setDraftSupplier((current) =>
      current && !current.accessUsers.some((user) => user.email === email)
        ? {
            ...current,
            accessUsers: [...current.accessUsers, { email, invitationStatus: "pendente" }],
          }
        : current,
    );
    setNewAccessUserEmail("");
  }

  function handleRemoveAccessUser(email: string) {
    setDraftSupplier((current) =>
      current
        ? { ...current, accessUsers: current.accessUsers.filter((item) => item.email !== email) }
        : current,
    );
  }

  function handleSendAccessInvite(email: string) {
    if (!supplier) {
      return;
    }

    const refreshed = markSupplierAccessUserInviteSent(supplier.slug, email);

    if (!refreshed) {
      return;
    }

    setSupplier(refreshed);
    setDraftSupplier(refreshed);
    setFeedback(`Link do questionário enviado para ${email}.`);
  }

  function handleAddCertification() {
    const certification = newCertification.trim();

    if (!certification) {
      return;
    }

    setDraftSupplier((current) =>
      current && !current.certifications.includes(certification)
        ? { ...current, certifications: [...current.certifications, certification] }
        : current,
    );
    setNewCertification("");
  }

  function handleRemoveCertification(certification: string) {
    setDraftSupplier((current) =>
      current
        ? { ...current, certifications: current.certifications.filter((item) => item !== certification) }
        : current,
    );
  }

  if (!supplier || !profile) {
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
                Fornecedor não encontrado
              </h2>
              <p className="mb-6 max-w-2xl text-sm text-on-surface-variant">
                Não localizamos este cadastro na sua base local. Se ele acabou de ser criado, tente voltar para a
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
                subtitle="Revise perfil operacional, evidências de conformidade e defina quais questionários existentes serão enviados para este fornecedor."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isEditingSupplier ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                    Cancelar edição
                  </button>
                  <button
                    onClick={handleSaveSupplier}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-base">save</span>
                    Salvar cadastro
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Editar cadastro
                </button>
              )}

              <Link
                href="/due-diligence-terceiros/novo-questionario"
                className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-base">post_add</span>
                Criar novo questionário
              </Link>
              {isPendingSend ? (
                <button
                  onClick={handleSendQuestionnaires}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  Compartilhar questionários
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
                <div className="flex-1">
                  {isEditingSupplier ? (
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(event) => updateDraft("displayName", event.target.value)}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface outline-none focus:border-primary"
                    />
                  ) : (
                    <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
                      {profile.displayName}
                    </h2>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {isEditingSupplier ? (
                      <input
                        type="text"
                        value={profile.segment}
                        onChange={(event) => updateDraft("segment", event.target.value)}
                        className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary outline-none focus:border-primary"
                      />
                    ) : (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                        {profile.segment}
                      </span>
                    )}
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase ${getRiskClass(profile.risk)}`}>
                      {profile.risk}
                    </span>
                    {isEditingSupplier ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={profile.headquartersCity}
                          onChange={(event) => updateDraft("headquartersCity", event.target.value)}
                          className="w-28 rounded-lg border border-outline-variant/20 bg-surface-container-low px-2 py-1 text-xs text-on-surface outline-none focus:border-primary"
                          placeholder="Cidade"
                        />
                        <input
                          type="text"
                          value={profile.headquartersCountry}
                          onChange={(event) => updateDraft("headquartersCountry", event.target.value)}
                          className="w-32 rounded-lg border border-outline-variant/20 bg-surface-container-low px-2 py-1 text-xs text-on-surface outline-none focus:border-primary"
                          placeholder="País"
                        />
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {profile.headquartersCity}, {profile.headquartersCountry}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
                <EditableTextField editing={isEditingSupplier} label="Domínio" value={profile.domain} onChange={(value) => updateDraft("domain", value)} />
                <EditableTextField editing={isEditingSupplier} label="Tipo" value={profile.supplierType} onChange={(value) => updateDraft("supplierType", value)} />
                <EditableTextField editing={isEditingSupplier} label="Criticidade" value={profile.criticality} onChange={(value) => updateDraft("criticality", value)} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">Status atual do cadastro</p>
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
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">Score Geral de Avaliação</p>
              <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-surface-container-high" />
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
                  <span className="text-xs font-bold uppercase tracking-tight text-slate-500">índice de 100</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-500">Anterior</p>
                  <p className="text-lg font-bold text-on-surface">{typeof supplier.previousScore === "number" ? supplier.previousScore : "--"}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-500">Tendência</p>
                  <p className="flex items-center justify-center gap-1 text-lg font-bold text-primary">
                    <span className="material-symbols-outlined text-sm">{(supplier.trend ?? 0) >= 0 ? "trending_up" : "trending_down"}</span>
                    {typeof supplier.trend === "number" ? `${supplier.trend > 0 ? "+" : ""}${supplier.trend}` : "--"}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 space-y-6 rounded-xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel md:col-span-8">
              {isPendingSend ? (
                <>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface">Questionários disponíveis para envio</h3>
                      <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
                        Escolha aqui quais templates existentes farão parte da trilha deste fornecedor antes do primeiro envio.
                      </p>
                    </div>
                    <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-on-surface">{feedback}</div>
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
                                  {questionnaire.source === "catalogo" ? "Catálogo da plataforma" : "Template interno"}
                                </span>
                              </div>
                              <p className="text-sm text-on-surface-variant">{questionnaire.category}</p>
                            </div>
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected ? "border-primary bg-primary text-on-primary" : "border-outline-variant/30 bg-surface-container-lowest text-transparent"}`}>
                              <span className="material-symbols-outlined text-sm">check</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-4 rounded-xl border border-outline-variant/15 bg-surface-container-low p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Questionários selecionados</p>
                      <div className="flex flex-wrap gap-2">
                        {assignedQuestionnaires.length > 0 ? (
                          assignedQuestionnaires.map((questionnaire) => (
                            <span key={questionnaire.id} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                              {questionnaire.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-on-surface-variant">Nenhum questionário associado ainda.</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleSaveAssignments}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                      >
                        <span className="material-symbols-outlined text-base">save</span>
                        Salvar seleção
                      </button>
                      <button
                        onClick={handleSendQuestionnaires}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]"
                      >
                        <span className="material-symbols-outlined text-base">send</span>
                        Compartilhar questionários
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface">Questionários enviados ao fornecedor</h3>
                      <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
                        A partir deste ponto, a análise acompanha somente os questionários já compartilhados e o andamento de preenchimento.
                      </p>
                    </div>
                    <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-on-surface">{feedback}</div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {sentQuestionnaires.length > 0 ? (
                      sentQuestionnaires.map((item) => (
                        <div key={`${item.questionnaireId}-${item.sentAt ?? "sem-data"}`} className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-on-surface">{item.questionnaire?.name ?? item.questionnaireId}</span>
                                <span className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                  {item.questionnaire?.version ?? "v1.0"}
                                </span>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${getQuestionnaireRunStatusClass(item.status)}`}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-sm text-on-surface-variant">{item.questionnaire?.category ?? "Categoria não informada"}</p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                                <span>Enviado em: {item.sentAt ? new Date(item.sentAt).toLocaleDateString("pt-BR") : "--"}</span>
                                <span>Última atualização: {item.lastUpdatedAt ? new Date(item.lastUpdatedAt).toLocaleDateString("pt-BR") : "--"}</span>
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
                        Nenhum questionário enviado foi encontrado para este fornecedor.
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
                <h3 className="font-headline text-lg font-bold text-on-surface">Ficha de cadastro e evidências</h3>
                <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Perfil do fornecedor</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <EditableTextField editing={isEditingSupplier} label="Razão social" value={profile.legalName} onChange={(value) => updateDraft("legalName", value)} />
                <EditableTextField editing={isEditingSupplier} label="Tax ID / CNPJ" value={profile.taxId} onChange={(value) => updateDraft("taxId", value)} />
                <EditableTextField editing={isEditingSupplier} label="Nome do contato principal" value={profile.primaryContactName} onChange={(value) => updateDraft("primaryContactName", value)} />
                <EditableTextField editing={isEditingSupplier} label="Cargo do contato principal" value={profile.primaryContactRole} onChange={(value) => updateDraft("primaryContactRole", value)} />
                <EditableTextField editing={isEditingSupplier} label="E-mail do contato principal" value={profile.primaryContactEmail} onChange={(value) => updateDraft("primaryContactEmail", value)} />
                <EditableTextField editing={isEditingSupplier} label="E-mail de segurança" value={profile.securityContactEmail} onChange={(value) => updateDraft("securityContactEmail", value)} />
                <EditableTextField editing={isEditingSupplier} label="E-mail de privacidade" value={profile.privacyContactEmail} onChange={(value) => updateDraft("privacyContactEmail", value)} />
                <EditableTextField editing={isEditingSupplier} label="Escopo de acesso" value={profile.accessScope} onChange={(value) => updateDraft("accessScope", value)} multiline rows={3} />
                <EditableTextField editing={isEditingSupplier} label="Classificação de dados" value={profile.dataClassification} onChange={(value) => updateDraft("dataClassification", value)} multiline rows={3} />
                <EditableTextField editing={isEditingSupplier} label="Modelo de integração" value={profile.integrationType} onChange={(value) => updateDraft("integrationType", value)} />
                <EditableTextField editing={isEditingSupplier} label="Modelo de hospedagem" value={profile.hostingModel} onChange={(value) => updateDraft("hostingModel", value)} />
                <EditableTextField editing={isEditingSupplier} label="Website" value={profile.website} onChange={(value) => updateDraft("website", value)} />
                <div className="md:col-span-2">
                  <EditableTextField editing={isEditingSupplier} label="Serviços prestados" value={profile.servicesProvided} onChange={(value) => updateDraft("servicesProvided", value)} multiline rows={4} />
                </div>
                <div className="md:col-span-2 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Certificações declaradas</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.length > 0 ? (
                      profile.certifications.map((certification) => (
                        <span key={certification} className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-3 py-1.5 text-xs font-bold text-on-surface">
                          {certification}
                          {isEditingSupplier ? (
                            <button type="button" onClick={() => handleRemoveCertification(certification)} className="text-slate-400 transition hover:text-rose-600">
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          ) : null}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-on-surface-variant">Nenhuma certificação registrada.</span>
                    )}
                  </div>
                  {isEditingSupplier ? (
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={newCertification}
                        onChange={(event) => setNewCertification(event.target.value)}
                        className="flex-1 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                        placeholder="Adicionar certificação"
                      />
                      <button
                        type="button"
                        onClick={handleAddCertification}
                        className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200"
                      >
                        Adicionar
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-outline-variant/15 bg-surface-container-low p-5">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">Evidências de conformidade</p>
                <div className="space-y-3">
                  {supplier.evidences.length > 0 ? (
                    supplier.evidences.map((evidence) => (
                      <div key={evidence.title} className={`flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 ${evidence.muted ? "opacity-60" : ""}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-primary">
                            <span className="material-symbols-outlined">{evidence.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{evidence.title}</p>
                            <p className="text-xs text-on-surface-variant">{evidence.meta}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${evidence.statusClass}`}>{evidence.status}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
                      Ainda não existem evidências anexadas para este fornecedor.
                    </div>
                  )}
                </div>
              </div>
            </article>

            <aside className="space-y-6">
              <article className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">Resumo operacional</h3>
                <div className="space-y-4 text-sm text-on-surface-variant">
                  <EditableTextField editing={isEditingSupplier} label="Responsável interno" value={profile.businessOwner} onChange={(value) => updateDraft("businessOwner", value)} />
                  <EditableTextField editing={isEditingSupplier} label="Regiões ativas" value={profile.activeRegions} onChange={(value) => updateDraft("activeRegions", value)} multiline rows={3} />
                  <EditableTextField editing={isEditingSupplier} label="Países de operação" value={profile.countriesOfOperation} onChange={(value) => updateDraft("countriesOfOperation", value)} multiline rows={3} />
                  <EditableTextField editing={isEditingSupplier} label="Subsegmento" value={profile.subsegment} onChange={(value) => updateDraft("subsegment", value)} />
                  <EditableTextField editing={isEditingSupplier} label="Observações" value={profile.notes} onChange={(value) => updateDraft("notes", value)} multiline rows={4} />
                </div>
              </article>

              <article className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">group</span>
                  <h3 className="font-headline text-lg font-bold text-on-surface">Usuários do fornecedor</h3>
                </div>

                <div className="space-y-3">
                  {profile.accessUsers.length > 0 ? (
                    profile.accessUsers.map((accessUser) => {
                      const user = normalizeAccessUserForView(accessUser);

                      return (
                      <div key={user.email} className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-low p-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-on-surface">{user.email || "E-mail não informado"}</p>
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${getAccessUserBadgeClass(user.invitationStatus)}`}>
                              {user.invitationStatus === "enviado" ? "Link enviado" : "Pendente"}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            {user.invitationStatus === "enviado"
                              ? `Último envio: ${user.invitationSentAt ? new Date(user.invitationSentAt).toLocaleDateString("pt-BR") : "agora"}`
                              : "Conta habilitada, aguardando envio do link do questionário."}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.invitationStatus === "pendente" ? (
                            <button
                              type="button"
                              onClick={() => handleSendAccessInvite(user.email)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary text-white shadow-sm shadow-primary/20 transition hover:scale-[0.98] hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary/30"
                              aria-label={`Enviar link do questionário para ${user.email}`}
                              title="Enviar link do questionário"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="h-[18px] w-[18px]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" />
                                <path d="M5 7l7 6 7-6" stroke="white" />
                              </svg>
                            </button>
                          ) : null}
                          {isEditingSupplier ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveAccessUser(user.email)}
                              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100"
                            >
                              Remover
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )})
                  ) : (
                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4 text-sm text-on-surface-variant">
                      Nenhum usuário adicional cadastrado para acessar os questionários.
                    </div>
                  )}

                  {isEditingSupplier ? (
                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Adicionar novo usuário</p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          type="email"
                          value={newAccessUserEmail}
                          onChange={(event) => setNewAccessUserEmail(event.target.value)}
                          className="flex-1 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                          placeholder="email@fornecedor.com"
                        />
                        <button
                          type="button"
                          onClick={handleAddAccessUser}
                          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary transition hover:bg-primary-container"
                        >
                          Adicionar usuário
                        </button>
                      </div>
                    </div>
                  ) : null}
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
                      placeholder="Adicionar comentário interno sobre este fornecedor..."
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
