"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import { getDataRoomWorkspace, getDataRoomWorkspaceClient, type DataRoomWorkspace } from "../data-room-seguro/data-room-data";
import {
  BUILDER_SETTINGS_STORAGE_KEY,
  DEFAULT_BUILDER_SETTINGS,
  loadBuilderSettings,
  type BuilderFaqItem,
  type BuilderSectionId,
  type BuilderSettings,
} from "./builder-settings";
import {
  DEFAULT_TRUST_THEME,
  TRUST_THEME_STORAGE_KEY,
  getContrastColor,
  loadTrustTheme,
  toRgba,
  type TrustTheme,
} from "./trust-theme";

const trustNavigation = ["Overview", "Compliance", "Privacidade", "Documentos", "FAQ"];

const requestAccessSteps = [
  "Selecione um documento privado e clique em solicitar acesso.",
  "Informe seus dados profissionais e o contexto da sua análise.",
  "Nossa equipe revisa a solicitação e valida o perfil de acesso.",
  "Depois da aprovação, o material fica disponível conforme a política definida pela empresa.",
];

function buildThemeStyles(theme: TrustTheme) {
  return {
    primaryTint: toRgba(theme.primary, 0.12),
    primarySoft: toRgba(theme.primary, 0.18),
    secondaryTint: toRgba(theme.secondary, 0.9),
    secondaryBorder: toRgba(theme.primary, 0.18),
    headerTint: toRgba(theme.header, 0.9),
    headerStrong: toRgba(theme.header, 0.5),
    buttonText: getContrastColor(theme.button),
    primaryText: theme.primary,
    buttonBg: theme.button,
    pageBg: `radial-gradient(circle at top left, ${toRgba(theme.primary, 0.1)}, transparent 26rem), linear-gradient(180deg, ${theme.surface} 0%, #eef3f8 100%)`,
    heroBg: `radial-gradient(circle at top right, ${toRgba(theme.header, 0.65)}, transparent 18rem), linear-gradient(180deg, ${theme.header} 0%, #ffffff 58%, ${theme.surface} 100%)`,
    iconBg: toRgba(theme.primary, 0.12),
    headerBadgeText: getContrastColor(theme.secondary),
    buttonShadow: `0 18px 32px ${toRgba(theme.button, 0.2)}`,
  };
}

export function BuilderTrustPreviewPage() {
  const [theme, setTheme] = useState<TrustTheme>(DEFAULT_TRUST_THEME);
  const [settings, setSettings] = useState<BuilderSettings>(DEFAULT_BUILDER_SETTINGS);
  const [dataRoomWorkspace, setDataRoomWorkspace] = useState<DataRoomWorkspace>(getDataRoomWorkspace());
  const [documentViewMode, setDocumentViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocumentCategory, setSelectedDocumentCategory] = useState<"Todos" | "Compliance" | "Privacidade" | "Políticas">("Todos");

  useEffect(() => {
    setTheme(loadTrustTheme());
    setSettings(loadBuilderSettings());

    async function loadDataRoomWorkspace() {
      try {
        const response = await fetch("/api/data-room", { cache: "no-store" });
        if (!response.ok) return;
        setDataRoomWorkspace((await response.json()) as DataRoomWorkspace);
      } catch {
        setDataRoomWorkspace(getDataRoomWorkspaceClient());
      }
    }

    loadDataRoomWorkspace();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === TRUST_THEME_STORAGE_KEY) {
        setTheme(loadTrustTheme());
      }

      if (event.key === BUILDER_SETTINGS_STORAGE_KEY) {
        setSettings(loadBuilderSettings());
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadDataRoomWorkspace);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadDataRoomWorkspace);
    };
  }, []);

  const styles = useMemo(() => buildThemeStyles(theme), [theme]);
  const heroSignals = settings.heroSignals ?? DEFAULT_BUILDER_SETTINGS.heroSignals;
  const certifications = settings.certifications ?? DEFAULT_BUILDER_SETTINGS.certifications;
  const faqItems = (settings.faqItems ?? DEFAULT_BUILDER_SETTINGS.faqItems).filter(
    (item): item is BuilderFaqItem => Boolean(item?.question?.trim()),
  );
  const activeCertifications = useMemo(() => certifications.filter((certification) => certification.checked), [certifications]);
  const trustDocuments = useMemo(
    () =>
      dataRoomWorkspace.documents
        .filter((document) => document.status === "Publicado")
        .filter((document) =>
          selectedDocumentCategory === "Todos" ? true : document.category === selectedDocumentCategory,
        )
        .map((document) => ({
        ...document,
        visibility: document.visibility === "Público" ? "Público" : "Privado",
      })),
    [dataRoomWorkspace.documents, selectedDocumentCategory],
  );
  const documentHighlights = useMemo(
    () =>
      trustDocuments.map((document) => ({
        title: document.name,
        category: document.category,
        access: document.visibility === "Público" ? "Público" : "Privado",
        description: document.visibility === "Público"
          ? "Documento visível no Trust para download imediato."
          : "Documento privado que exige liberação do administrador do Trust.",
      })),
    [trustDocuments],
  );
  const enabledSections = useMemo(
    () =>
      settings.sections.reduce<Record<BuilderSectionId, boolean>>(
        (accumulator, section) => ({
          ...accumulator,
          [section.id]: section.enabled,
        }),
        {
          overview: true,
          certifications: true,
          documents: true,
          faq: true,
          "security-contact": true,
        },
      ),
    [settings.sections],
  );

  return (
    <>
      <SecureTopbar placeholder="Buscar blocos do Trust Center..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/builder-trust-center" className="flex items-center gap-2 hover:text-primary">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Builder do Trust Center
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-semibold text-on-surface">Modo Preview do Trust Center</span>
          </div>

          <section className="overflow-hidden rounded-[28px] border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="border-b border-outline-variant/10 bg-surface-container-low px-8 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: styles.primaryText }}>
                    Preview Público
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">Simulação da página que visitantes verão ao acessar o Trust Center publicado.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700" style={{ backgroundColor: "#d1fae5" }}>
                    Tema ativo
                  </span>
                  <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: styles.secondaryTint, color: styles.primaryText }}>
                    Preview desktop
                  </span>
                  <span className="rounded-full bg-surface-container-highest px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Documentos públicos + privados
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 text-slate-900" style={{ background: styles.pageBg }}>
              <div className="grid grid-cols-1 gap-6">
                <section className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <div className="border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {settings.logoMode === "icon" ? (
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: styles.iconBg, color: styles.primaryText }}>
                            <span className="material-symbols-outlined text-xl">verified_user</span>
                          </div>
                        ) : (
                          <div className="rounded-2xl px-4 py-2" style={{ backgroundColor: styles.iconBg, color: styles.primaryText }}>
                            <span className="text-sm font-black uppercase tracking-[0.28em]">AXION</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-950">{settings.displayName}</p>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Trust Center</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {trustNavigation.map((item, index) => (
                          <span
                            key={item}
                            className="rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em]"
                            style={
                              index === 0
                                ? { backgroundColor: theme.secondary, color: styles.headerBadgeText, boxShadow: `0 4px 12px ${toRgba(theme.primary, 0.1)}` }
                                : { backgroundColor: "#f1f5f9", color: "#475569" }
                            }
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 md:p-8">
                    {enabledSections.overview ? (
                      <section className="overflow-hidden rounded-[30px] border p-8" style={{ borderColor: styles.secondaryBorder, background: styles.heroBg }}>
                        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
                          <div className="text-slate-950">
                            <div className="mb-5 flex flex-wrap items-center gap-3">
                              <span className="rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em]" style={{ backgroundColor: styles.secondaryTint, color: styles.headerBadgeText }}>
                                {settings.heroBadge}
                              </span>
                              <span className="rounded-full border bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-600" style={{ borderColor: styles.secondaryBorder }}>
                                {settings.heroUpdatedLabel}
                              </span>
                            </div>

                            <h1 className="max-w-3xl font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
                              {settings.heroTitle}
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">{settings.publicDescription}</p>

                            <div className="mt-8 flex flex-wrap gap-3">
                              <button
                                className="rounded-2xl px-6 py-3 text-sm font-bold transition"
                                style={{ backgroundColor: styles.buttonBg, color: styles.buttonText, boxShadow: styles.buttonShadow }}
                              >
                                {settings.primaryCtaLabel}
                              </button>
                              <button className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50">
                                {settings.secondaryCtaLabel}
                              </button>
                            </div>
                          </div>

                          <div className="rounded-[28px] border p-5 text-slate-950 shadow-[0_18px_40px_rgba(59,130,246,0.10)] backdrop-blur-sm" style={{ borderColor: styles.secondaryBorder, backgroundColor: "#ffffffd9" }}>
                            <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: styles.primaryText }}>
                              Sinais de confiança
                            </p>
                            <div className="mt-4 space-y-3">
                              {heroSignals.map((item) => (
                                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                                  <p className="mt-2 text-3xl font-extrabold text-slate-950">{item.value}</p>
                                  <p className="mt-1 text-sm text-slate-600">{item.note}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>
                    ) : null}

                    <section>
                      {enabledSections.certifications ? (
                        <article className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                        <div className="mb-6 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Certificações e selos</p>
                            <h2 className="mt-2 font-headline text-3xl font-bold text-slate-950">Controles auditados e evidências públicas</h2>
                          </div>
                          <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest" style={{ backgroundColor: styles.secondaryTint, color: styles.primaryText }}>
                            {activeCertifications.length} certificações
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          {activeCertifications.map((item) => (
                            <div key={item.id} className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm" style={{ backgroundColor: styles.iconBg, color: styles.primaryText }}>
                                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                              </div>
                              <h3 className="text-base font-bold text-slate-950">{item.label}</h3>
                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                Evidência configurada no Builder e refletida automaticamente na página pública.
                              </p>
                              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                                Evidência visível no Trust público
                              </div>
                            </div>
                          ))}
                        </div>
                        </article>
                      ) : null}
                    </section>

                    {enabledSections.documents ? (
                      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Biblioteca do Trust</p>
                          <h2 className="mt-2 font-headline text-3xl font-bold text-slate-950">Documentos organizados por categoria</h2>
                          <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Explore políticas, evidências e materiais institucionais organizados para facilitar sua avaliação de segurança e conformidade.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Todos", value: "Todos" as const },
                            { label: "Compliance", value: "Compliance" as const },
                            { label: "Privacidade", value: "Privacidade" as const },
                            { label: "Políticas", value: "Políticas" as const },
                          ].map((filter) => (
                            <span
                              key={filter.value}
                              className="cursor-pointer rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest"
                              onClick={() => setSelectedDocumentCategory(filter.value)}
                              style={
                                selectedDocumentCategory === filter.value
                                  ? { backgroundColor: theme.secondary, color: styles.headerBadgeText }
                                  : { backgroundColor: "#f1f5f9", color: "#334155" }
                              }
                            >
                              {filter.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6 flex items-center justify-end">
                        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => setDocumentViewMode("grid")}
                            className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                              documentViewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                            }`}
                          >
                            Grid
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocumentViewMode("list")}
                            className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                              documentViewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                            }`}
                          >
                            Lista
                          </button>
                        </div>
                      </div>

                      {documentViewMode === "grid" ? (
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                          {documentHighlights.map((doc) => (
                            <article key={doc.title} className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                              <div className="flex items-start justify-between gap-4">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                  {doc.category}
                                </span>
                                <span
                                  className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                                  style={doc.access === "Público" ? { backgroundColor: "#d1fae5", color: "#047857" } : { backgroundColor: styles.secondaryTint, color: styles.primaryText }}
                                >
                                  {doc.access}
                                </span>
                              </div>
                              <h3 className="mt-4 text-lg font-bold text-slate-950">{doc.title}</h3>
                              <p className="mt-3 text-sm leading-6 text-slate-600">{doc.description}</p>
                            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Atualizado em Abril/2026</span>
                              <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                                {doc.access === "Público" ? "Download" : "Solicitar acesso"}
                              </button>
                            </div>
                          </article>
                          ))}
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                          <table className="w-full border-collapse text-left">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Documento</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Categoria</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Atualização</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Acesso</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {trustDocuments.map((doc) => (
                                <tr key={doc.id} className="bg-white">
                                  <td className="px-6 py-5">
                                    <div>
                                      <p className="text-sm font-semibold text-slate-950">{doc.name}</p>
                                      <p className="mt-1 text-xs text-slate-500">
                                        {doc.visibility === "Público"
                                          ? "Download imediato disponível para visitantes autorizados."
                                          : "Exibe CTA de solicitação de acesso antes do download."}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 text-sm text-slate-700">{doc.category}</td>
                                  <td className="px-6 py-5 text-sm text-slate-500">{doc.publishedAtLabel ?? doc.updatedAtLabel}</td>
                                  <td className="px-6 py-5 text-right">
                                    <span
                                      className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                                      style={doc.visibility === "Público" ? { backgroundColor: "#d1fae5", color: "#047857" } : { backgroundColor: styles.secondaryTint, color: styles.primaryText }}
                                    >
                                      {doc.visibility}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      </section>
                    ) : null}

                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                      {enabledSections.faq ? (
                        <article className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] xl:col-span-7">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">FAQ</p>
                        <h2 className="mt-2 font-headline text-3xl font-bold text-slate-950">Perguntas frequentes</h2>

                        <div className="mt-6 space-y-3">
                          {faqItems.map((item, index) => (
                            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                              <div className="flex items-center justify-between gap-4">
                                <h3 className="text-base font-bold text-slate-900">{item.question}</h3>
                                <span className="material-symbols-outlined text-slate-400">
                                  {index === 0 ? "remove" : "add"}
                                </span>
                              </div>
                              <p className={`mt-3 text-sm leading-6 text-slate-600 ${index === 0 ? "block" : "hidden md:block"}`}>
                                {item.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                        </article>
                      ) : null}

                      {enabledSections["security-contact"] ? (
                        <article className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] xl:col-span-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Acesso privado</p>
                        <h2 className="mt-2 font-headline text-3xl font-bold text-slate-950">Como solicitar materiais restritos</h2>
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                          Alguns documentos exigem validação antes do download. Use este fluxo para solicitar acesso ao material correto
                          e falar diretamente com o time responsável pelo Trust.
                        </p>

                        <div className="mt-6 space-y-3">
                          {requestAccessSteps.map((step, index) => (
                            <div key={step} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: styles.iconBg, color: styles.primaryText }}>
                                {index + 1}
                              </span>
                              <p className="text-sm leading-6 text-slate-700">{step}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 rounded-2xl p-5" style={{ backgroundColor: styles.secondaryTint }}>
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: styles.primaryText }}>Contato para acesso e segurança</p>
                          <p className="mt-2 text-lg font-bold text-slate-950">{settings.securityContactEmail}</p>
                          <p className="mt-2 text-sm text-slate-600">Tempo médio de resposta: {settings.responseSla}.</p>
                        </div>
                      </article>
                      ) : null}
                    </section>
                  </div>

                  <footer className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.72)_0%,rgba(241,245,249,0.9)_100%)] px-6 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center">
                          <img
                            src="/Group%2019.svg"
                            alt="Logo AXION"
                            className="h-8 w-auto object-contain opacity-90"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                        <div>
                          <p className="mt-1 text-sm text-slate-700">
                            Serviço fornecido pela AXION TRUST
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Transparência, governança e compartilhamento seguro de evidências.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                        Powered by AXION
                      </div>
                    </div>
                  </footer>
                </section>

              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
