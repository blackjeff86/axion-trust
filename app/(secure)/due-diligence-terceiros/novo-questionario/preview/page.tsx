"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import {
  type Question,
  type SavedTemplate,
  STORAGE_KEY,
  getQuestionTypeMeta,
  initialConfig,
  initialEvidences,
  initialQuestions,
  initialRules,
  initialSections,
} from "../template-builder-data";

type LoadedTemplate = Omit<SavedTemplate, "savedAt" | "saveMode">;
type PreviewAnswers = Record<string, string>;

export default function QuestionarioPreviewPage() {
  const [template, setTemplate] = useState<LoadedTemplate>({
    config: initialConfig,
    sections: initialSections,
    questions: initialQuestions,
    rules: initialRules,
    evidences: initialEvidences,
  });
  const [answers, setAnswers] = useState<PreviewAnswers>({});

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SavedTemplate;
      setTemplate({
        config: parsed.config,
        sections: parsed.sections?.length ? parsed.sections : initialSections,
        questions: parsed.questions?.length ? parsed.questions : initialQuestions,
        rules: parsed.rules ?? initialRules,
        evidences: parsed.evidences ?? initialEvidences,
      });
    } catch {
      // Keep defaults if local state cannot be restored.
    }
  }, []);

  function getQuestionLabel(index: number) {
    return `Pergunta ${String(index + 1).padStart(2, "0")}`;
  }

  function updateAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function simulateEvidenceUpload(questionId: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: current[questionId] ? "" : `evidencia_${questionId}.pdf`,
    }));
  }

  function renderQuestion(question: Question, index: number) {
    return (
      <article key={question.id} className="rounded-2xl border border-outline-variant/10 bg-surface p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">{getQuestionLabel(index)}</p>
            <h3 className="text-base font-bold text-white">{question.title}</h3>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
              question.required ? "bg-secondary-container/30 text-on-secondary-container" : "bg-surface-container-lowest text-slate-400"
            }`}
          >
            {question.required ? "Obrigatoria" : "Opcional"}
          </span>
        </div>

        {question.type === "multipla-escolha" || question.type === "sim-ou-nao" ? (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = answers[question.id] === option;

              return (
                <button
                  key={option}
                  onClick={() => updateAnswer(question.id, option)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? "border-primary/50 bg-primary/10 text-white"
                      : "border-outline-variant/20 bg-surface-container-low text-on-surface hover:border-primary/30"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected ? "border-primary bg-primary text-on-primary-container" : "border-slate-500"
                    }`}
                  >
                    {isSelected ? <span className="h-2 w-2 rounded-full bg-on-primary-container" /> : null}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {question.type === "texto-longo" ? (
          <textarea
            rows={5}
            value={answers[question.id] ?? ""}
            onChange={(event) => updateAnswer(question.id, event.target.value)}
            className="w-full resize-none rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-slate-500 focus:border-primary focus:outline-none"
            placeholder="Digite aqui a resposta detalhada do fornecedor..."
          />
        ) : null}

        {question.type === "escala-de-maturidade" ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {question.options.map((option) => {
              const isSelected = answers[question.id] === option;

              return (
                <button
                  key={option}
                  onClick={() => updateAnswer(question.id, option)}
                  className={`rounded-xl border px-4 py-4 text-center text-sm font-semibold transition-colors ${
                    isSelected
                      ? "border-primary/50 bg-primary/10 text-white"
                      : "border-outline-variant/20 bg-surface-container-low text-on-surface hover:border-primary/30"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : null}

        {question.type === "upload-de-evidencia" ? (
          <div className="rounded-2xl border-2 border-dashed border-outline-variant/20 bg-surface-container-low p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Anexar evidencia</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {question.evidenceHint ?? "Formatos aceitos: PDF, PNG, DOCX. Tamanho maximo: 20MB."}
                </p>
              </div>
              <button
                onClick={() => simulateEvidenceUpload(question.id)}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary-container transition-all hover:opacity-90"
              >
                {answers[question.id] ? "Remover anexo" : "Selecionar arquivo"}
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-surface px-4 py-3 text-sm text-on-surface">
              {answers[question.id] ? (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">attach_file</span>
                  <span>{answers[question.id]}</span>
                </div>
              ) : (
                <span className="text-on-surface-variant">Nenhum arquivo anexado.</span>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-sm text-primary">{getQuestionTypeMeta(question.type).icon}</span>
          <span>{getQuestionTypeMeta(question.type).label}</span>
        </div>
      </article>
    );
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar perguntas deste questionario..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/due-diligence-terceiros/novo-questionario" className="flex items-center gap-2 hover:text-primary">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Builder do Questionário
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-semibold text-on-surface">Preview</span>
          </div>

          <section className="overflow-hidden rounded-[28px] border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="border-b border-outline-variant/10 bg-surface-container-low p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-surface text-center">
                    <div>
                      <span className="material-symbols-outlined text-2xl text-primary">image</span>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Logo</p>
                    </div>
                  </div>

                  <div className="max-w-3xl">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Questionário para Fornecedor</p>
                    <h1 className="font-headline text-2xl font-extrabold text-white">{template.config.name}</h1>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">{template.config.category}</span>
                      <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-bold text-on-surface-variant">{template.config.version}</span>
                      <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-bold text-on-surface-variant">
                        Criticidade {template.config.criticality}
                      </span>
                    </div>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-on-surface-variant">{template.config.objective}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 shadow-panel">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Visualizacao</p>
                  <p className="mt-1 text-sm font-semibold text-white">Tela de resposta do fornecedor</p>
                  <p className="mt-1 text-xs text-on-surface-variant">Todas as perguntas do template sao exibidas por secao.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {template.sections.map((section) => {
                const sectionQuestions = template.questions.filter((question) => question.sectionId === section.id);

                if (sectionQuestions.length === 0) {
                  return null;
                }

                return (
                  <div key={section.id} className="rounded-2xl border border-slate-100/50 bg-surface-container-low p-5 shadow-panel">
                    <div className="mb-5 border-b border-outline-variant/10 pb-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Secao</p>
                      <h2 className="mt-2 font-headline text-xl font-bold text-white">{section.name}</h2>
                      <p className="mt-2 text-sm text-on-surface-variant">{section.description}</p>
                    </div>

                    <div className="space-y-5">
                      {sectionQuestions.map((question, index) => renderQuestion(question, index))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-outline-variant/10 bg-surface-container-low px-6 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Ao enviar, o fornecedor confirma que as respostas e evidências refletem o estado atual dos controles.
                </p>
                <div className="flex gap-3">
                  <button className="rounded-lg border border-outline-variant/20 bg-surface px-4 py-2.5 text-sm font-semibold text-on-surface">
                    Salvar resposta parcial
                  </button>
                  <button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary-container">
                    Enviar questionario
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
