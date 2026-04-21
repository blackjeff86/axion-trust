"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import {
  type Question,
  type QuestionType,
  type Rule,
  type SavedTemplate,
  type Section,
  type TemplateConfig,
  STORAGE_KEY,
  getQuestionTypeMeta,
  initialConfig,
  initialEvidences,
  initialQuestions,
  initialRules,
  initialSections,
  questionTypes,
} from "./template-builder-data";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildQuestion(type: QuestionType, sectionId: string): Question {
  const id = createId("q");

  if (type === "multipla-escolha") {
    return {
      id,
      sectionId,
      type,
      title: "Nova pergunta de multipla escolha",
      required: true,
      options: ["Opcao 1", "Opcao 2"],
    };
  }

  if (type === "sim-ou-nao") {
    return {
      id,
      sectionId,
      type,
      title: "Nova pergunta de validacao",
      required: true,
      options: ["Sim", "Não"],
      evidenceHint: "Defina abaixo as regras que devem abrir novas perguntas.",
    };
  }

  if (type === "upload-de-evidencia") {
    return {
      id,
      sectionId,
      type,
      title: "Nova solicitacao de evidencia",
      required: true,
      options: [],
      evidenceHint: "Formatos aceitos: PDF, PNG, DOCX. Tamanho maximo: 20MB.",
    };
  }

  if (type === "escala-de-maturidade") {
    return {
      id,
      sectionId,
      type,
      title: "Avalie o nivel de maturidade deste controle",
      required: true,
      options: ["Inicial", "Repetivel", "Definido", "Gerenciado", "Otimizado"],
    };
  }

  return {
    id,
    sectionId,
    type,
    title: "Nova pergunta descritiva",
    required: true,
    options: [],
  };
}

function getQuestionLabel(index: number) {
  return `Pergunta ${String(index + 1).padStart(2, "0")}`;
}

export default function NovoQuestionarioPage() {
  const router = useRouter();
  const [config, setConfig] = useState<TemplateConfig>(initialConfig);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [evidences] = useState(initialEvidences);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("Builder pronto para edicao.");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SavedTemplate;
      const loadedSections = parsed.sections?.length ? parsed.sections : initialSections;
      setConfig(parsed.config);
      setSections(loadedSections);
      setQuestions(
        parsed.questions.map((question) => ({
          ...question,
          sectionId: question.sectionId ?? loadedSections[0]?.id ?? initialSections[0].id,
        })),
      );
      setRules(parsed.rules);
      setLastSavedAt(parsed.savedAt);
      setFeedback(`Último ${parsed.saveMode === "rascunho" ? "rascunho" : "template"} carregado automaticamente.`);
    } catch {
      setFeedback("Não foi possível recuperar o último template salvo.");
    }
  }, []);

  function persistTemplate(saveMode: "rascunho" | "template") {
    const savedAt = new Date().toLocaleString("pt-BR");
    const payload: SavedTemplate = {
      config,
      sections,
      questions,
      rules,
      evidences,
      savedAt,
      saveMode,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLastSavedAt(savedAt);
    setFeedback(saveMode === "rascunho" ? "Rascunho salvo localmente com sucesso." : "Template salvo localmente com sucesso.");
  }

  function openPreviewPage() {
    persistTemplate("rascunho");
    router.push("/due-diligence-terceiros/novo-questionario/preview");
  }

  function addQuestion(sectionId: string, type: QuestionType) {
    const newQuestion = buildQuestion(type, sectionId);
    setQuestions((current) => [...current, newQuestion]);
    setActiveQuestionId(newQuestion.id);
    setFeedback(`${getQuestionTypeMeta(type).label} adicionada a secao ${getSectionName(sectionId)}.`);
  }

  function updateQuestion(questionId: string, patch: Partial<Question>) {
    setQuestions((current) => current.map((question) => (question.id === questionId ? { ...question, ...patch } : question)));
  }

  function updateQuestionOption(questionId: string, optionIndex: number, value: string) {
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const options = [...question.options];
        options[optionIndex] = value;
        return { ...question, options };
      }),
    );
  }

  function addQuestionOption(questionId: string) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId ? { ...question, options: [...question.options, `Opcao ${question.options.length + 1}`] } : question,
      ),
    );
    setFeedback("Nova opcao adicionada a pergunta.");
  }

  function removeQuestionOption(questionId: string, optionIndex: number) {
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return { ...question, options: question.options.filter((_, index) => index !== optionIndex) };
      }),
    );
    setFeedback("Opcao removida da pergunta.");
  }

  function duplicateQuestion(questionId: string) {
    setQuestions((current) => {
      const index = current.findIndex((question) => question.id === questionId);

      if (index === -1) {
        return current;
      }

      const source = current[index];
      const clone: Question = {
        ...source,
        id: createId("q"),
        title: `${source.title} (copia)`,
        options: [...source.options],
      };

      const next = [...current];
      next.splice(index + 1, 0, clone);
      setActiveQuestionId(clone.id);
      return next;
    });

    setFeedback("Pergunta duplicada com sucesso.");
  }

  function toggleQuestionRequired(questionId: string) {
    const target = questions.find((question) => question.id === questionId);
    updateQuestion(questionId, { required: !target?.required });
    setFeedback(target?.required ? "Pergunta marcada como opcional." : "Pergunta marcada como obrigatoria.");
  }

  function removeQuestion(questionId: string) {
    setQuestions((current) => current.filter((question) => question.id !== questionId));
    setRules((current) => current.filter((rule) => rule.sourceQuestionId !== questionId && rule.targetQuestionId !== questionId));
    setActiveQuestionId((current) => (current === questionId ? null : current));
    setFeedback("Pergunta removida do template.");
  }

  function addRule() {
    const sourceQuestionId = questions[0]?.id ?? "";
    const targetQuestionId = questions[1]?.id ?? sourceQuestionId;
    const newRule: Rule = {
      id: createId("r"),
      sourceQuestionId,
      condition: "Resposta personalizada",
      targetQuestionId,
    };

    setRules((current) => [...current, newRule]);
    setFeedback("Nova regra condicional adicionada.");
  }

  function updateRule(ruleId: string, patch: Partial<Rule>) {
    setRules((current) => current.map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule)));
  }

  function removeRule(ruleId: string) {
    setRules((current) => current.filter((rule) => rule.id !== ruleId));
    setFeedback("Regra condicional removida.");
  }

  function addSection() {
    const newSection: Section = {
      id: createId("s"),
      name: `Nova Secao ${sections.length + 1}`,
      description: "Descreva aqui o objetivo deste agrupamento de perguntas.",
    };

    setSections((current) => [...current, newSection]);
    setFeedback("Nova secao criada no template.");
  }

  function updateSection(sectionId: string, patch: Partial<Section>) {
    setSections((current) => current.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)));
  }

  function removeSection(sectionId: string) {
    if (sections.length === 1) {
      setFeedback("O template precisa ter ao menos uma secao.");
      return;
    }

    const fallbackSectionId = sections.find((section) => section.id !== sectionId)?.id ?? sections[0].id;
    setSections((current) => current.filter((section) => section.id !== sectionId));
    setQuestions((current) =>
      current.map((question) => (question.sectionId === sectionId ? { ...question, sectionId: fallbackSectionId } : question)),
    );
    setFeedback("Secao removida e perguntas realocadas para outra secao.");
  }

  function getSectionName(sectionId: string) {
    return sections.find((section) => section.id === sectionId)?.name ?? "Secao sem nome";
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar perguntas, seções ou evidências..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <section className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                <Link href="/due-diligence-terceiros" className="flex items-center gap-2 hover:text-primary">
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Due Diligence de Terceiros
                </Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="font-semibold text-on-surface">Novo Questionário</span>
              </div>

              <SecurePageHeader
                title="Novo Questionário de Fornecedor"
                subtitle="Monte formulários no estilo Typeform com perguntas dinâmicas, lógica de resposta e recebimento estruturado de evidências."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => persistTemplate("rascunho")}
                className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
              >
                Salvar Rascunho
              </button>
              <button
                onClick={openPreviewPage}
                className="rounded-lg bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-bright"
              >
                Abrir Preview
              </button>
              <button
                onClick={() => persistTemplate("template")}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/10 transition-all hover:opacity-90"
              >
                Salvar Template
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-on-surface shadow-panel">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <p>{feedback}</p>
              <p className="text-xs text-on-surface-variant">{lastSavedAt ? `Último salvamento: ${lastSavedAt}` : "Ainda não salvo"}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline text-lg font-bold text-white">Configuração do Template</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Etapa 1
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Nome do Template</span>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(event) => setConfig((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Categoria</span>
                    <select
                      value={config.category}
                      onChange={(event) => setConfig((current) => ({ ...current, category: event.target.value }))}
                      className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option>Segurança da Informação</option>
                      <option>Privacidade e LGPD</option>
                      <option>Governanca e Riscos</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Versão do Template</span>
                    <input
                      type="text"
                      value={config.version}
                      onChange={(event) => setConfig((current) => ({ ...current, version: event.target.value }))}
                      className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Nivel de Criticidade</span>
                    <select
                      value={config.criticality}
                      onChange={(event) => setConfig((current) => ({ ...current, criticality: event.target.value }))}
                      className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option>Alto</option>
                      <option>Medio</option>
                      <option>Baixo</option>
                    </select>
                  </label>
                </div>

                <label className="mt-4 block space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Objetivo do Template</span>
                  <textarea
                    rows={3}
                    value={config.objective}
                    onChange={(event) => setConfig((current) => ({ ...current, objective: event.target.value }))}
                    className="w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </label>
              </article>

              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline text-lg font-bold text-white">Builder de Perguntas</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Etapa 2
                  </span>
                </div>

                <div className="mb-6 rounded-xl border border-slate-100/50 bg-surface-container-low p-4 shadow-panel">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-headline text-base font-bold text-white">Seções do Questionário</h4>
                      <p className="text-sm text-on-surface-variant">Agrupe perguntas por blocos tematicos antes de usar o template nos fornecedores.</p>
                    </div>
                    <button
                      onClick={addSection}
                      className="rounded-lg border border-dashed border-outline-variant/30 bg-surface px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      Nova Secao
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sections.map((section) => (
                      <div key={section.id} className="rounded-lg border border-outline-variant/10 bg-surface p-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_2fr_auto]">
                          <input
                            type="text"
                            value={section.name}
                            onChange={(event) => updateSection(section.id, { name: event.target.value })}
                            className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                          />
                          <input
                            type="text"
                            value={section.description}
                            onChange={(event) => updateSection(section.id, { description: event.target.value })}
                            className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => removeSection(section.id)}
                              className="rounded-lg bg-error/10 px-3 py-2 text-xs font-bold uppercase text-error transition-colors hover:bg-error/20"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  {sections.map((section) => {
                    const sectionQuestions = questions.filter((question) => question.sectionId === section.id);

                    return (
                      <div key={section.id} className="rounded-2xl border border-outline-variant/10 bg-surface-container-high/30 p-4">
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Secao</p>
                            <h4 className="font-headline text-lg font-bold text-white">{section.name}</h4>
                            <p className="text-sm text-on-surface-variant">{section.description}</p>
                          </div>
                          <div className="rounded-full bg-surface px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                            {sectionQuestions.length} perguntas
                          </div>
                        </div>

                        <div className="space-y-4">
                          {sectionQuestions.map((question, index) => {
                            const typeMeta = getQuestionTypeMeta(question.type);
                            const isActive = activeQuestionId === question.id;

                            return (
                              <section key={question.id} className="rounded-xl border border-slate-100/50 bg-surface-container-low p-4 shadow-panel">
                                <div className="mb-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{getQuestionLabel(index)}</span>
                                    <span className="text-xs font-semibold text-slate-400">{typeMeta.label}</span>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                        question.required ? "bg-secondary-container/30 text-on-secondary-container" : "bg-surface px-2 text-slate-400"
                                      }`}
                                    >
                                      {question.required ? "Obrigatoria" : "Opcional"}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => setActiveQuestionId((current) => (current === question.id ? null : question.id))}
                                    className="text-slate-500 transition-colors hover:text-white"
                                  >
                                    <span className="material-symbols-outlined text-base">more_horiz</span>
                                  </button>
                                </div>

                                <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                                  <input
                                    type="text"
                                    value={question.title}
                                    onChange={(event) => updateQuestion(question.id, { title: event.target.value })}
                                    className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-high px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                                  />
                                  <select
                                    value={question.sectionId}
                                    onChange={(event) => updateQuestion(question.id, { sectionId: event.target.value })}
                                    className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                                  >
                                    {sections.map((sectionOption) => (
                                      <option key={sectionOption.id} value={sectionOption.id}>
                                        {sectionOption.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {question.options.length > 0 ? (
                                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    {question.options.map((option, optionIndex) => (
                                      <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(event) => updateQuestionOption(question.id, optionIndex, event.target.value)}
                                          className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                                        />
                                        {question.options.length > 1 ? (
                                          <button
                                            onClick={() => removeQuestionOption(question.id, optionIndex)}
                                            className="rounded bg-surface px-2 py-2 text-xs font-bold text-slate-400 transition-colors hover:text-error"
                                          >
                                            X
                                          </button>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                ) : null}

                                {question.type === "multipla-escolha" || question.type === "escala-de-maturidade" ? (
                                  <button
                                    onClick={() => addQuestionOption(question.id)}
                                    className="mt-3 flex items-center gap-2 text-xs font-bold text-primary transition-colors hover:text-white"
                                  >
                                    <span className="material-symbols-outlined text-sm">add_circle</span>
                                    Adicionar opcao
                                  </button>
                                ) : null}

                                {question.type === "texto-longo" ? (
                                  <div className="rounded-lg border border-dashed border-outline-variant/30 bg-surface p-5 text-xs text-slate-500">
                                    Campo aberto para resposta descritiva do fornecedor.
                                  </div>
                                ) : null}

                                {question.type === "upload-de-evidencia" ? (
                                  <div className="rounded-lg border-2 border-dashed border-outline-variant/30 bg-surface p-5">
                                    <p className="mb-2 text-sm font-semibold text-on-surface">Campo de Recebimento de Evidencias</p>
                                    <input
                                      type="text"
                                      value={question.evidenceHint ?? ""}
                                      onChange={(event) => updateQuestion(question.id, { evidenceHint: event.target.value })}
                                      className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                                    />
                                  </div>
                                ) : null}

                                {question.type === "sim-ou-nao" ? (
                                  <div className="mt-4 rounded-lg border border-outline-variant/20 bg-surface p-3">
                                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">Expansao Condicional</p>
                                    <p className="text-xs text-on-surface-variant">
                                      Use as regras laterais para decidir quais perguntas aparecem quando a resposta for Sim ou Não.
                                    </p>
                                  </div>
                                ) : null}

                                {isActive ? (
                                  <div className="mt-4 flex flex-wrap gap-2 border-t border-outline-variant/10 pt-4">
                                    <button
                                      onClick={() => duplicateQuestion(question.id)}
                                      className="rounded-lg bg-surface px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high"
                                    >
                                      Duplicar
                                    </button>
                                    <button
                                      onClick={() => toggleQuestionRequired(question.id)}
                                      className="rounded-lg bg-surface px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high"
                                    >
                                      {question.required ? "Tornar opcional" : "Tornar obrigatoria"}
                                    </button>
                                    <button
                                      onClick={() => removeQuestion(question.id)}
                                      className="rounded-lg bg-error/10 px-3 py-2 text-xs font-bold text-error transition-colors hover:bg-error/20"
                                    >
                                      Remover
                                    </button>
                                  </div>
                                ) : null}
                              </section>
                            );
                          })}
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-100/50 bg-surface-container-low p-4 shadow-panel">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                            Tipos de resposta desta secao
                          </p>

                          <div className="mb-4 flex flex-wrap gap-2">
                            {questionTypes.map((type) => (
                              <button
                                key={`${section.id}-${type.type}`}
                                onClick={() => addQuestion(section.id, type.type)}
                                className="flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface px-3 py-1.5 text-[11px] font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                              >
                                <span className="material-symbols-outlined text-sm">{type.icon}</span>
                                {type.label}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => addQuestion(section.id, "multipla-escolha")}
                            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary-container transition-all hover:opacity-90"
                          >
                            Adicionar nova pergunta
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline text-lg font-bold text-white">Pacote de Evidencias Obrigatorias</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Etapa 3
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        <th className="px-4 py-3">Evidencia</th>
                        <th className="px-4 py-3">Formato</th>
                        <th className="px-4 py-3">Obrigatoriedade</th>
                        <th className="px-4 py-3">SLA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-sm">
                      {evidences.map((evidence) => (
                        <tr key={evidence.id} className="bg-surface-container-low/60">
                          <td className="px-4 py-3 text-on-surface">{evidence.item}</td>
                          <td className="px-4 py-3 text-on-surface-variant">{evidence.format}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                                evidence.required === "Obrigatório"
                                  ? "bg-error/10 text-error"
                                  : "bg-secondary-container/30 text-on-secondary-container"
                              }`}
                            >
                              {evidence.required}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-on-surface-variant">{evidence.sla}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>

            <aside className="space-y-6 xl:col-span-4">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-headline text-base font-bold text-white">Regras de Expansao Condicional</h4>
                  <button
                    onClick={addRule}
                    className="rounded-lg border border-dashed border-outline-variant/30 bg-surface px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="space-y-3">
                  {rules.map((rule, index) => (
                    <div key={rule.id} className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Regra {index + 1}</p>
                        <button onClick={() => removeRule(rule.id)} className="text-xs font-bold text-error transition-colors hover:opacity-80">
                          Remover
                        </button>
                      </div>

                      <div className="space-y-2">
                        <select
                          value={rule.sourceQuestionId}
                          onChange={(event) => updateRule(rule.id, { sourceQuestionId: event.target.value })}
                          className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                        >
                          {questions.map((question, questionIndex) => (
                            <option key={question.id} value={question.id}>
                              {getSectionName(question.sectionId)} • {getQuestionLabel(questionIndex)}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={rule.condition}
                          onChange={(event) => updateRule(rule.id, { condition: event.target.value })}
                          className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                          placeholder="Condicao da resposta"
                        />

                        <select
                          value={rule.targetQuestionId}
                          onChange={(event) => updateRule(rule.id, { targetQuestionId: event.target.value })}
                          className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                        >
                          {questions.map((question, questionIndex) => (
                            <option key={question.id} value={question.id}>
                              Abrir {getSectionName(question.sectionId)} • {getQuestionLabel(questionIndex)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <h4 className="mb-4 font-headline text-base font-bold text-white">Fluxo do Respondente (Typeform Style)</h4>
                <ol className="space-y-3">
                  {[
                    "Tela de boas-vindas com contexto da avaliacao",
                    "Perguntas uma a uma com progresso visivel",
                    "Condicionais de resposta por risco",
                    "Upload de arquivos com validacao de formato",
                    "Tela final de confirmacao e protocolo",
                  ].map((step, index) => (
                    <li key={step} className="flex items-start gap-3 rounded-lg bg-surface-container-lowest p-3 text-sm text-on-surface">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </article>

              <article className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                  <h4 className="font-headline text-base font-bold text-white">Checklist do Template</h4>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    {sections.length} seções configuradas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    {questions.length} perguntas configuradas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    {evidences.filter((evidence) => evidence.required === "Obrigatório").length} evidências obrigatórias definidas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    {rules.length} regras condicionais definidas
                  </li>
                </ul>
                <button
                  onClick={() => persistTemplate("template")}
                  className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary-container transition-all hover:opacity-90"
                >
                  Salvar Template Base
                </button>
              </article>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}
