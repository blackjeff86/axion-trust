"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import {
  getQuestionnaireRunStatusClass,
  getQuestionnaireOptionsClient,
  getSupplierBySlugClient,
  getRiskClass,
  upsertSupplier,
  type QuestionnaireOption,
  type SupplierRisk,
  type SupplierProfile,
} from "../../../../supplier-data";
import {
  getQuestionTypeMeta,
  initialConfig,
  initialQuestions,
  initialSections,
  STORAGE_KEY as TEMPLATE_STORAGE_KEY,
  type Question,
  type SavedTemplate,
  type Section,
} from "../../../../novo-questionario/template-builder-data";

type AnalystAssessmentStatus = "atende" | "parcial" | "nao-atende" | "na" | null;

type QuestionReviewState = {
  assessment: AnalystAssessmentStatus;
  requestAdditionalEvidence: boolean;
  analystObservation: string;
  supplierResponse: string;
  additionalEvidenceNames: string[];
};

const QUESTIONNAIRE_REVIEW_STORAGE_KEY = "axion-trust-dd-questionnaire-review";

const ASSESSMENT_LABELS: Record<Exclude<AnalystAssessmentStatus, null>, string> = {
  atende: "Atende",
  parcial: "Atende parcialmente",
  "nao-atende": "Nao atende",
  na: "N/A",
};

const ASSESSMENT_POINTS: Record<Exclude<AnalystAssessmentStatus, null>, number> = {
  atende: 25,
  parcial: 15,
  "nao-atende": 5,
  na: 0,
};

function getRiskFromScore(score: number): SupplierRisk {
  if (score >= 85) {
    return "Baixo Risco";
  }

  if (score >= 70) {
    return "Medio Risco";
  }

  if (score >= 50) {
    return "Alto Risco";
  }

  return "Risco Critico";
}

function getSampleAnswer(question: Question) {
  if (question.type === "multipla-escolha") {
    return question.options[0] || "Resposta selecionada";
  }

  if (question.type === "sim-ou-nao") {
    return "Sim";
  }

  if (question.type === "texto-longo") {
    return "Resposta textual enviada pelo fornecedor e pronta para revisao do analista.";
  }

  if (question.type === "upload-de-evidencia") {
    return "Evidencia anexada: documento_compliance.pdf";
  }

  return "Nivel 4 de maturidade informado pelo fornecedor.";
}

function createInitialReviewState(questions: Question[]): Record<string, QuestionReviewState> {
  return questions.reduce<Record<string, QuestionReviewState>>((acc, question) => {
    acc[question.id] = {
      assessment: null,
      requestAdditionalEvidence: false,
      analystObservation: "",
      supplierResponse: "",
      additionalEvidenceNames: [],
    };

    return acc;
  }, {});
}

function getReviewStorageKey(slug: string, questionnaireId: string) {
  return `${QUESTIONNAIRE_REVIEW_STORAGE_KEY}:${slug}:${questionnaireId}`;
}

function mergeReviewState(
  questions: Question[],
  savedReviewState: Record<string, Partial<QuestionReviewState>> | null,
) {
  const initialState = createInitialReviewState(questions);

  if (!savedReviewState) {
    return initialState;
  }

  return questions.reduce<Record<string, QuestionReviewState>>((acc, question) => {
    const savedQuestionState = savedReviewState[question.id];

    acc[question.id] = {
      ...initialState[question.id],
      ...savedQuestionState,
      additionalEvidenceNames: Array.isArray(savedQuestionState?.additionalEvidenceNames)
        ? savedQuestionState.additionalEvidenceNames
        : initialState[question.id].additionalEvidenceNames,
    };

    return acc;
  }, {});
}

function getAssessmentButtonClass(current: AnalystAssessmentStatus, value: Exclude<AnalystAssessmentStatus, null>) {
  const isActive = current === value;

  if (value === "atende") {
    return isActive
      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300";
  }

  if (value === "parcial") {
    return isActive
      ? "border-amber-500 bg-amber-500 text-white shadow-sm"
      : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300";
  }

  if (value === "nao-atende") {
    return isActive
      ? "border-rose-500 bg-rose-500 text-white shadow-sm"
      : "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300";
  }

  return isActive
    ? "border-slate-500 bg-slate-600 text-white shadow-sm"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300";
}

function getAssessmentBadgeClass(value: Exclude<AnalystAssessmentStatus, null>) {
  if (value === "atende") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (value === "parcial") {
    return "bg-amber-100 text-amber-700";
  }

  if (value === "nao-atende") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-200 text-slate-700";
}

export default function SupplierQuestionnaireDetailPage() {
  const params = useParams<{ slug: string; questionnaireId: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const questionnaireId = typeof params?.questionnaireId === "string" ? params.questionnaireId : "";

  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireOption | null>(null);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [reviewByQuestion, setReviewByQuestion] = useState<Record<string, QuestionReviewState>>(
    createInitialReviewState(initialQuestions),
  );
  const [hasHydratedReview, setHasHydratedReview] = useState(false);

  useEffect(() => {
    setHasHydratedReview(false);

    const supplierData = getSupplierBySlugClient(slug) ?? null;
    const questionnaireData =
      getQuestionnaireOptionsClient().find((item) => item.id === questionnaireId) ?? null;

    setSupplier(supplierData);
    setQuestionnaire(questionnaireData);

    if (typeof window === "undefined") {
      return;
    }

    const reviewStorageKey = getReviewStorageKey(slug, questionnaireId);
    const rawSavedReview = window.localStorage.getItem(reviewStorageKey);
    let parsedSavedReview: Record<string, Partial<QuestionReviewState>> | null = null;

    if (rawSavedReview) {
      try {
        parsedSavedReview = JSON.parse(rawSavedReview) as Record<string, Partial<QuestionReviewState>>;
      } catch {
        parsedSavedReview = null;
      }
    }
    const rawTemplate = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);

    if (!rawTemplate) {
      setSections(initialSections);
      setQuestions(initialQuestions);
      setReviewByQuestion(mergeReviewState(initialQuestions, parsedSavedReview));
      setHasHydratedReview(true);
      return;
    }

    try {
      const template = JSON.parse(rawTemplate) as SavedTemplate;
      const templateId = `template-${template.config.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}-${template.config.version}`;

      if (templateId === questionnaireId) {
        setSections(template.sections);
        setQuestions(template.questions);
        setReviewByQuestion(mergeReviewState(template.questions, parsedSavedReview));
        setHasHydratedReview(true);
        return;
      }

      setSections(initialSections);
      setQuestions(initialQuestions);
      setReviewByQuestion(mergeReviewState(initialQuestions, parsedSavedReview));
      setHasHydratedReview(true);
    } catch {
      setSections(initialSections);
      setQuestions(initialQuestions);
      setReviewByQuestion(mergeReviewState(initialQuestions, parsedSavedReview));
      setHasHydratedReview(true);
    }
  }, [questionnaireId, slug]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydratedReview) {
      return;
    }

    window.localStorage.setItem(
      getReviewStorageKey(slug, questionnaireId),
      JSON.stringify(reviewByQuestion),
    );
  }, [hasHydratedReview, questionnaireId, reviewByQuestion, slug]);

  const questionnaireRun = useMemo(
    () => supplier?.questionnaireRuns.find((run) => run.questionnaireId === questionnaireId) ?? null,
    [questionnaireId, supplier?.questionnaireRuns],
  );

  const answeredCount = useMemo(() => {
    if (!questionnaireRun || questions.length === 0) {
      return 0;
    }

    return Math.min(questions.length, Math.round((questionnaireRun.progress / 100) * questions.length));
  }, [questionnaireRun, questions.length]);

  const groupedQuestions = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        questions: questions.filter((question) => question.sectionId === section.id),
      })),
    [questions, sections],
  );

  const assessmentSummary = useMemo(() => {
    const values = Object.values(reviewByQuestion);

    return {
      atende: values.filter((item) => item.assessment === "atende").length,
      parcial: values.filter((item) => item.assessment === "parcial").length,
      naoAtende: values.filter((item) => item.assessment === "nao-atende").length,
      na: values.filter((item) => item.assessment === "na").length,
      withEvidenceRequest: values.filter((item) => item.requestAdditionalEvidence).length,
    };
  }, [reviewByQuestion]);

  const scoringSummary = useMemo(() => {
    const reviewedQuestions = questions.filter((question) => reviewByQuestion[question.id]?.assessment !== null);
    const applicableQuestions = reviewedQuestions.filter(
      (question) => reviewByQuestion[question.id]?.assessment !== "na",
    );
    const totalPoints = applicableQuestions.reduce((sum, question) => {
      const assessment = reviewByQuestion[question.id]?.assessment;

      if (!assessment || assessment === "na") {
        return sum;
      }

      return sum + ASSESSMENT_POINTS[assessment];
    }, 0);
    const maximumPoints = applicableQuestions.length * ASSESSMENT_POINTS.atende;
    const normalizedScore = maximumPoints > 0 ? Math.round((totalPoints / maximumPoints) * 100) : 0;
    const risk = getRiskFromScore(normalizedScore);

    return {
      reviewedCount: reviewedQuestions.length,
      applicableCount: applicableQuestions.length,
      totalPoints,
      maximumPoints,
      normalizedScore,
      risk,
    };
  }, [questions, reviewByQuestion]);

  useEffect(() => {
    if (!supplier || scoringSummary.reviewedCount === 0) {
      return;
    }

    if (supplier.score === scoringSummary.normalizedScore && supplier.risk === scoringSummary.risk) {
      return;
    }

    const nextSupplier = {
      ...supplier,
      score: scoringSummary.normalizedScore,
      risk: scoringSummary.risk,
    };

    setSupplier(nextSupplier);
    upsertSupplier(nextSupplier);
  }, [scoringSummary.normalizedScore, scoringSummary.reviewedCount, scoringSummary.risk, supplier]);

  function updateReviewState(questionId: string, updates: Partial<QuestionReviewState>) {
    setReviewByQuestion((current) => ({
      ...current,
      [questionId]: {
        ...current[questionId],
        ...updates,
      },
    }));
  }

  function handleMockAttachEvidence(questionId: string) {
    const currentFiles = reviewByQuestion[questionId]?.additionalEvidenceNames ?? [];
    const nextIndex = currentFiles.length + 1;

    updateReviewState(questionId, {
      additionalEvidenceNames: [...currentFiles, `evidencia_adicional_${nextIndex}.pdf`],
    });
  }

  if (!supplier || !questionnaire || !questionnaireRun) {
    return (
      <>
        <SecureTopbar placeholder="Buscar no sistema..." />

        <main className="min-h-screen bg-surface p-8">
          <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
            <h2 className="mb-2 font-headline text-2xl font-extrabold text-on-surface">
              Questionario nao encontrado
            </h2>
            <p className="mb-6 text-sm text-on-surface-variant">
              Nao localizamos este questionario enviado para o fornecedor selecionado.
            </p>
            <Link
              href={`/due-diligence-terceiros/fornecedor/${slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Voltar para o fornecedor
            </Link>
          </section>
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
                <Link
                  href={`/due-diligence-terceiros/fornecedor/${supplier.slug}`}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  {supplier.displayName}
                </Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="font-semibold text-on-surface">{questionnaire.name}</span>
              </div>

              <SecurePageHeader
                title="Acompanhamento do Questionario"
                subtitle="Visao do analista sobre respostas, evidencias, complementos solicitados e progresso do fornecedor neste questionario especifico."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${getQuestionnaireRunStatusClass(questionnaireRun.status)}`}
              >
                {questionnaireRun.status}
              </span>
              <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold uppercase text-on-surface">
                {questionnaireRun.progress}% preenchido
              </span>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                    {questionnaire.category}
                  </span>
                  <span className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {questionnaire.version}
                  </span>
                  <span className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {supplier.displayName}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Enviado em
                    </p>
                    <p className="text-sm font-semibold text-on-surface">
                      {questionnaireRun.sentAt
                        ? new Date(questionnaireRun.sentAt).toLocaleDateString("pt-BR")
                        : "--"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Ultima atualizacao
                    </p>
                    <p className="text-sm font-semibold text-on-surface">
                      {questionnaireRun.lastUpdatedAt
                        ? new Date(questionnaireRun.lastUpdatedAt).toLocaleDateString("pt-BR")
                        : "--"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Perguntas respondidas
                    </p>
                    <p className="text-sm font-semibold text-on-surface">
                      {answeredCount} de {questions.length}
                    </p>
                  </div>
                </div>
              </article>

              {groupedQuestions.map((section) => (
                <article
                  key={section.id}
                  className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel"
                >
                  <div className="mb-5">
                    <h3 className="font-headline text-lg font-bold text-on-surface">{section.name}</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">{section.description}</p>
                  </div>

                  <div className="space-y-5">
                    {section.questions.map((question) => {
                      const globalIndex = questions.findIndex((item) => item.id === question.id);
                      const answered = globalIndex > -1 && globalIndex < answeredCount;
                      const typeMeta = getQuestionTypeMeta(question.type);
                      const reviewState = reviewByQuestion[question.id] ?? {
                        assessment: null,
                        requestAdditionalEvidence: false,
                        analystObservation: "",
                        supplierResponse: "",
                        additionalEvidenceNames: [],
                      };

                      return (
                        <div
                          key={question.id}
                          className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-5"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-primary">
                                  {typeMeta.icon}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                  {typeMeta.label}
                                </span>
                              </div>
                              <h4 className="font-semibold text-on-surface">
                                {globalIndex + 1}. {question.title}
                              </h4>
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                                answered
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-surface-container-lowest text-on-surface-variant"
                              }`}
                            >
                              {answered ? "Respondido" : "Pendente"}
                            </span>
                          </div>

                          <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4">
                            {answered ? (
                              <p className="text-sm leading-relaxed text-on-surface">
                                {getSampleAnswer(question)}
                              </p>
                            ) : (
                              <p className="text-sm text-on-surface-variant">
                                O fornecedor ainda nao preencheu esta pergunta.
                              </p>
                            )}
                          </div>

                          {question.evidenceHint ? (
                            <p className="mt-3 text-xs text-on-surface-variant">
                              Evidencia esperada: {question.evidenceHint}
                            </p>
                          ) : null}

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-surface-container-lowest px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                              {answered ? "Resposta recebida" : "Aguardando fornecedor"}
                            </span>
                            {reviewState.assessment ? (
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${getAssessmentBadgeClass(
                                  reviewState.assessment,
                                )}`}
                              >
                                Parecer: {ASSESSMENT_LABELS[reviewState.assessment]}
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-600">
                                Parecer pendente
                              </span>
                            )}
                            {reviewState.requestAdditionalEvidence ? (
                              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                                Solicitacao complementar ativa
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-5 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-4">
                            <div className="mb-4">
                              <div className="mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-primary">
                                  rule_settings
                                </span>
                                <h5 className="text-sm font-bold text-on-surface">
                                  Avaliacao do analista
                                </h5>
                              </div>

                              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateReviewState(question.id, { assessment: "atende" })
                                  }
                                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${getAssessmentButtonClass(
                                    reviewState.assessment,
                                    "atende",
                                  )}`}
                                >
                                  Atende
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateReviewState(question.id, { assessment: "parcial" })
                                  }
                                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${getAssessmentButtonClass(
                                    reviewState.assessment,
                                    "parcial",
                                  )}`}
                                >
                                  Atende parcialmente
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateReviewState(question.id, { assessment: "nao-atende" })
                                  }
                                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${getAssessmentButtonClass(
                                    reviewState.assessment,
                                    "nao-atende",
                                  )}`}
                                >
                                  Nao atende
                                </button>

                                <button
                                  type="button"
                                  onClick={() => updateReviewState(question.id, { assessment: "na" })}
                                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${getAssessmentButtonClass(
                                    reviewState.assessment,
                                    "na",
                                  )}`}
                                >
                                  N/A
                                </button>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 lg:grid-cols-4">
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700">
                                  Atende = {ASSESSMENT_POINTS.atende} pts
                                </div>
                                <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-amber-700">
                                  Parcial = {ASSESSMENT_POINTS.parcial} pts
                                </div>
                                <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-rose-700">
                                  Nao atende = {ASSESSMENT_POINTS["nao-atende"]} pts
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                                  N/A = {ASSESSMENT_POINTS.na} pt
                                </div>
                              </div>
                            </div>

                            <div className="mb-4 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-bold text-on-surface">
                                    Solicitar evidencias adicionais
                                  </p>
                                  <p className="text-xs text-on-surface-variant">
                                    Marque esta opcao quando a resposta precisar de complemento,
                                    nova evidencia ou esclarecimento adicional do fornecedor.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateReviewState(question.id, {
                                      requestAdditionalEvidence:
                                        !reviewState.requestAdditionalEvidence,
                                    })
                                  }
                                  className={`inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                                    reviewState.requestAdditionalEvidence
                                      ? "border-primary bg-primary text-on-primary"
                                      : "border-outline-variant/20 bg-surface-container-lowest text-on-surface hover:bg-slate-50"
                                  }`}
                                >
                                  {reviewState.requestAdditionalEvidence
                                    ? "Solicitacao ativa"
                                    : "Solicitar complemento"}
                                </button>
                              </div>
                            </div>

                            {reviewState.requestAdditionalEvidence ? (
                              <>
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                  <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                      <span className="material-symbols-outlined text-base text-primary">
                                        rate_review
                                      </span>
                                      <h6 className="text-sm font-bold text-on-surface">
                                        Solicitacao do analista
                                      </h6>
                                    </div>

                                    <label
                                      htmlFor={`analyst-observation-${question.id}`}
                                      className="mb-2 block text-sm font-semibold text-on-surface"
                                    >
                                      Observacao / nova solicitacao / duvida
                                    </label>
                                    <textarea
                                      id={`analyst-observation-${question.id}`}
                                      value={reviewState.analystObservation}
                                      onChange={(event) =>
                                        updateReviewState(question.id, {
                                          analystObservation: event.target.value,
                                        })
                                      }
                                      rows={6}
                                      placeholder="Descreva aqui a nova solicitacao adicional, a evidencia complementar esperada, a ressalva identificada ou a duvida que o fornecedor deve responder."
                                      className="w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                                    />
                                    <p className="mt-2 text-xs text-on-surface-variant">
                                      Esse texto representa o pedido formal do analista para esta pergunta.
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-outline-variant/15 bg-primary/5 p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                      <span className="material-symbols-outlined text-base text-primary">
                                        forum
                                      </span>
                                      <h6 className="text-sm font-bold text-on-surface">
                                        Devolutiva do fornecedor
                                      </h6>
                                    </div>

                                    <label
                                      htmlFor={`supplier-response-${question.id}`}
                                      className="mb-2 block text-sm font-semibold text-on-surface"
                                    >
                                      Resposta complementar
                                    </label>
                                    <textarea
                                      id={`supplier-response-${question.id}`}
                                      value={reviewState.supplierResponse}
                                      onChange={(event) =>
                                        updateReviewState(question.id, {
                                          supplierResponse: event.target.value,
                                        })
                                      }
                                      rows={6}
                                      placeholder="Campo destinado a resposta complementar do fornecedor, justificativa, esclarecimento ou devolutiva sobre a solicitacao."
                                      className="w-full rounded-xl border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                                    />
                                    <p className="mt-2 text-xs text-on-surface-variant">
                                      O fornecedor pode responder aqui e complementar a pergunta com contexto adicional.
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-low p-4">
                                  <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-bold text-on-surface">
                                        Evidencias adicionais do fornecedor
                                      </p>
                                      <p className="text-xs text-on-surface-variant">
                                        Area para anexos complementares enviados em resposta a solicitacoes do analista.
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleMockAttachEvidence(question.id)}
                                      className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-slate-50"
                                    >
                                      <span className="material-symbols-outlined text-base">attach_file</span>
                                      Anexar evidencia
                                    </button>
                                  </div>

                                  {reviewState.additionalEvidenceNames.length > 0 ? (
                                    <div className="space-y-2">
                                      {reviewState.additionalEvidenceNames.map((fileName) => (
                                        <div
                                          key={fileName}
                                          className="flex items-center justify-between rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-base text-primary">
                                              description
                                            </span>
                                            <span className="text-sm font-medium text-on-surface">
                                              {fileName}
                                            </span>
                                          </div>
                                          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                            Anexado
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="rounded-xl bg-surface-container-lowest px-4 py-5 text-sm text-on-surface-variant">
                                      Nenhuma evidencia adicional anexada ate o momento.
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="mt-4 rounded-xl border border-dashed border-outline-variant/20 bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
                                Os campos de solicitacao, devolutiva e evidencias adicionais ficam visiveis somente apos o analista ativar <span className="font-semibold text-on-surface">Solicitar complemento</span>.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-6 xl:col-span-4">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">
                  Painel de avaliacao
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Fornecedor
                    </p>
                    <p className="text-sm font-semibold text-on-surface">{supplier.displayName}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Objetivo
                    </p>
                    <p className="text-sm text-on-surface-variant">{initialConfig.objective}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Status atual
                    </p>
                    <p className="text-sm font-semibold text-on-surface">{questionnaireRun.status}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Progresso
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${questionnaireRun.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">
                  Resumo da analise
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                      Atende
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                      {assessmentSummary.atende}
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                      Parcial
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-amber-700">
                      {assessmentSummary.parcial}
                    </p>
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-rose-700">
                      Nao atende
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-rose-700">
                      {assessmentSummary.naoAtende}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
                      N/A
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-700">
                      {assessmentSummary.na}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Complementos solicitados
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-on-surface">
                    {assessmentSummary.withEvidenceRequest}
                  </p>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-on-surface">
                      Pontuacao de risco
                    </h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Resultado dinamico conforme o analista revisa cada resposta.
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${getRiskClass(scoringSummary.risk)}`}>
                    {scoringSummary.risk}
                  </span>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Total de pontos do fornecedor
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <p className="text-4xl font-extrabold text-on-surface">
                      {scoringSummary.totalPoints}
                    </p>
                    <p className="text-sm font-semibold text-on-surface-variant">
                      de {scoringSummary.maximumPoints} pts
                    </p>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${scoringSummary.normalizedScore}%` }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Score consolidado
                      </p>
                      <p className="mt-1 text-2xl font-extrabold text-on-surface">
                        {scoringSummary.normalizedScore}
                      </p>
                    </div>

                    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Perguntas revisadas
                      </p>
                      <p className="mt-1 text-2xl font-extrabold text-on-surface">
                        {scoringSummary.reviewedCount}/{questions.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Regra da metrica
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    Atende = 25 pts, Atende parcialmente = 15 pts, Nao atende = 5 pts e N/A = 0.
                    O risco final considera o score consolidado: 85+ Baixo, 70-84 Medio, 50-69 Alto e abaixo de 50 Critico.
                  </p>
                </div>
              </article>

              <article className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">fact_check</span>
                  <h3 className="font-headline text-lg font-bold text-on-surface">
                    Acoes do analista
                  </h3>
                </div>

                <div className="space-y-3">
                  <button className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-left text-sm font-bold text-on-surface transition-colors hover:bg-slate-50">
                    Salvar avaliacao parcial
                  </button>
                  <button className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-left text-sm font-bold text-on-surface transition-colors hover:bg-slate-50">
                    Enviar solicitacoes ao fornecedor
                  </button>
                  <button className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-container px-4 py-3 text-left text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]">
                    Aprovar questionario para consolidacao
                  </button>
                </div>
              </article>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}
