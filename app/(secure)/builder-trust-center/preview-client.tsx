"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import {
  DEFAULT_BUILDER_SETTINGS,
  loadBuilderSettings,
  type BuilderSectionId,
  type BuilderSettings,
} from "./builder-settings";
import {
  DEFAULT_TRUST_THEME,
  getContrastColor,
  loadTrustTheme,
  toRgba,
  type TrustTheme,
} from "./trust-theme";

const trustStats = [
  { label: "Clientes enterprise", value: "1.200+" },
  { label: "Disponibilidade", value: "99,98%" },
  { label: "Tempo de resposta", value: "< 24h" },
  { label: "Auditorias anuais", value: "6" },
];

const trustNavigation = ["Overview", "Compliance", "Privacidade", "Documentos", "FAQ"];

const trustSignals = [
  { label: "Uptime do serviço", value: "99,98%", note: "Últimos 12 meses" },
  { label: "SLA para incidentes", value: "< 24h", note: "Resposta inicial do time" },
  { label: "Certificações ativas", value: "3", note: "Selos públicos exibidos" },
];

const requestAccessSteps = [
  "Visitante encontra um documento privado no catálogo.",
  "Ao clicar em solicitar acesso, informa nome, e-mail, empresa e motivo.",
  "O pedido entra na fila do admin do Trust para aprovação.",
  "Após aprovação, o acesso é liberado com validade configurada pela conta.",
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

  useEffect(() => {
    setTheme(loadTrustTheme());
    setSettings(loadBuilderSettings());
  }, []);

  const styles = useMemo(() => buildThemeStyles(theme), [theme]);
  const activeCertifications = useMemo(() => settings.certifications.filter((certification) => certification.checked), [settings.certifications]);
  const trustDocuments = useMemo(
    () =>
      settings.documents.map((document) => ({
        ...document,
        visibility: document.isPublic ? "Público" : "Privado",
      })),
    [settings.documents],
  );
  const documentHighlights = useMemo(
    () =>
      settings.documents.slice(0, 3).map((document) => ({
        title: document.title,
        category: document.category,
        access: document.isPublic ? "Publico" : "Privado",
        description: document.isPublic
          ? "Documento visivel no Trust para download imediato."
          : "Documento privado que exige liberacao do administrador do Trust.",
      })),
    [settings.documents],
  );
  const publicCollections = useMemo(() => {
    const groupedDocuments = settings.documents.reduce<Record<string, number>>((accumulator, document) => {
      accumulator[document.category] = (accumulator[document.category] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(groupedDocuments).slice(0, 3).map(([category, items]) => ({
      title: category,
      items,
      description: `Colecao com ${items} documento(s) publicada(s) nesta categoria do Trust.`,
    }));
  }, [settings.documents]);
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
                    Documentos público + privado
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 text-slate-900" style={{ background: styles.pageBg }}>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
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
                    <section className="flex flex-col gap-4 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Header público</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-950">Trust Center pronto para visitantes, clientes e auditores</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                          Esta faixa simula um cabeçalho mais próximo de uma página final publicada, com navegação simples, mensagem objetiva e visual limpo.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                          Dominio trust.axiontech.com.br
                        </span>
                        <span className="rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700" style={{ backgroundColor: "#d1fae5" }}>
                          Publicacao ativa
                        </span>
                      </div>
                    </section>

                    {enabledSections.overview ? (
                      <section className="overflow-hidden rounded-[30px] border p-8" style={{ borderColor: styles.secondaryBorder, background: styles.heroBg }}>
                        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
                          <div className="text-slate-950">
                            <div className="mb-5 flex flex-wrap items-center gap-3">
                              <span className="rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em]" style={{ backgroundColor: styles.secondaryTint, color: styles.headerBadgeText }}>
                                Segurança e transparência
                              </span>
                              <span className="rounded-full border bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-600" style={{ borderColor: styles.secondaryBorder }}>
                                Atualizado em Abril/2026
                              </span>
                            </div>

                            <h1 className="max-w-3xl font-headline text-4xl font-extrabold tracking-tight md:text-5xl">
                              A página pública onde seus clientes validam a maturidade do seu programa de segurança.
                            </h1>
                            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">{settings.publicDescription}</p>

                            <div className="mt-8 flex flex-wrap gap-3">
                              <button
                                className="rounded-2xl px-6 py-3 text-sm font-bold transition"
                                style={{ backgroundColor: styles.buttonBg, color: styles.buttonText, boxShadow: styles.buttonShadow }}
                              >
                                Ver documentos públicos
                              </button>
                              <button className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50">
                                Solicitar acesso privado
                              </button>
                            </div>
                          </div>

                          <div className="rounded-[28px] border p-5 text-slate-950 shadow-[0_18px_40px_rgba(59,130,246,0.10)] backdrop-blur-sm" style={{ borderColor: styles.secondaryBorder, backgroundColor: "#ffffffd9" }}>
                            <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: styles.primaryText }}>
                              Sinais de confiança
                            </p>
                            <div className="mt-4 space-y-3">
                              {trustSignals.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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

                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                      {enabledSections.certifications ? (
                        <article className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] xl:col-span-8">
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
                                Evidencia configurada no Builder e refletida automaticamente na pagina publica.
                              </p>
                              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                                Evidencia visivel no Trust publico
                              </div>
                            </div>
                          ))}
                        </div>
                        </article>
                      ) : null}

                      <article className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] xl:col-span-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Coleções públicas</p>
                        <h2 className="mt-2 font-headline text-3xl font-bold text-slate-950">Como a biblioteca aparece</h2>
                        <div className="mt-6 space-y-4">
                          {publicCollections.map((item, index) => (
                            <div
                              key={item.title}
                              className="rounded-2xl border bg-gradient-to-br p-4"
                              style={{
                                borderColor: index === 0 ? toRgba(theme.primary, 0.18) : index === 1 ? "#bbf7d0" : "#fde68a",
                                background: index === 0 ? `linear-gradient(135deg, ${toRgba(theme.primary, 0.08)}, #ffffff)` : index === 1 ? "linear-gradient(135deg, #ecfdf5, #ffffff)" : "linear-gradient(135deg, #fffbeb, #ffffff)",
                              }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-sm font-bold text-slate-950">{item.title}</p>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm">
                                  {item.items} itens
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>
                    </section>

                    {enabledSections.documents ? (
                      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Biblioteca do Trust</p>
                          <h2 className="mt-2 font-headline text-3xl font-bold text-slate-950">Documentos organizados por categoria</h2>
                          <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Um visitante entende rápido o que pode baixar agora e o que depende de autorização do administrador do Trust.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["Todos", "Compliance", "Privacidade", "Políticas"].map((filter, index) => (
                            <span
                              key={filter}
                              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest"
                              style={index === 0 ? { backgroundColor: theme.secondary, color: styles.headerBadgeText } : { backgroundColor: "#f1f5f9", color: "#334155" }}
                            >
                              {filter}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        {documentHighlights.map((doc) => (
                          <article key={doc.title} className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                            <div className="flex items-start justify-between gap-4">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                {doc.category}
                              </span>
                              <span
                                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                                style={doc.access === "Publico" ? { backgroundColor: "#d1fae5", color: "#047857" } : { backgroundColor: styles.secondaryTint, color: styles.primaryText }}
                              >
                                {doc.access}
                              </span>
                            </div>
                            <h3 className="mt-4 text-lg font-bold text-slate-950">{doc.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{doc.description}</p>
                            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Atualizado em Abril/2026</span>
                              <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                                Ver detalhe
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>

                      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
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
                                    <p className="text-sm font-semibold text-slate-950">{doc.title}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {doc.visibility === "Público"
                                        ? "Download imediato disponível para visitantes autorizados."
                                        : "Exibe CTA de solicitação de acesso antes do download."}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-sm text-slate-700">{doc.category}</td>
                                <td className="px-6 py-5 text-sm text-slate-500">{doc.updatedAt}</td>
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
                      </section>
                    ) : null}

                    <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                      {enabledSections.faq ? (
                        <article className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] xl:col-span-7">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">FAQ</p>
                        <h2 className="mt-2 font-headline text-3xl font-bold text-slate-950">Perguntas frequentes</h2>

                        <div className="mt-6 space-y-3">
                          {settings.faqItems.map((item, index) => (
                            <div key={`${item}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                              <div className="flex items-center justify-between gap-4">
                                <h3 className="text-base font-bold text-slate-900">{item}</h3>
                                <span className="material-symbols-outlined text-slate-400">
                                  {index === 0 ? "remove" : "add"}
                                </span>
                              </div>
                              <p className={`mt-3 text-sm leading-6 text-slate-600 ${index === 0 ? "block" : "hidden md:block"}`}>
                                Resposta configurada para apoiar due diligence, acelerar vendas e reduzir trocas manuais com o time de seguranca.
                              </p>
                            </div>
                          ))}
                        </div>
                        </article>
                      ) : null}

                      {enabledSections["security-contact"] ? (
                        <article className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] xl:col-span-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Fluxo privado</p>
                        <h2 className="mt-2 font-headline text-3xl font-bold text-slate-950">Como o pedido de acesso aparece</h2>
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                          Este bloco ajuda o admin a revisar se o Trust está explicando corretamente o caminho para materiais privados.
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
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: styles.primaryText }}>Contato público</p>
                          <p className="mt-2 text-lg font-bold text-slate-950">{settings.securityContactEmail}</p>
                          <p className="mt-2 text-sm text-slate-600">Tempo medio de resposta configurado: {settings.responseSla}.</p>
                        </div>
                      </article>
                      ) : null}
                    </section>
                  </div>
                </section>

                <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Checklist do admin</p>
                    <h2 className="mt-2 font-headline text-2xl font-bold text-slate-950">O que revisar neste preview</h2>
                    <div className="mt-5 space-y-3">
                      {[
                        "Hero claro com proposta de confiança e CTA principal.",
                        "Certificações visíveis e com explicação objetiva.",
                        "Documentos públicos e privados separados de forma intuitiva.",
                        "FAQ cobrindo as dúvidas mais comuns da due diligence.",
                        "Canal de contato público e fluxo de acesso privado explícito.",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                          <span className="material-symbols-outlined" style={{ color: styles.primaryText }}>task_alt</span>
                          <span className="text-sm leading-6 text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Estado do preview</p>
                    <div className="mt-5 space-y-4">
                      {trustStats.map((stat, index) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl border p-4"
                          style={{
                            borderColor: index === 0 ? styles.secondaryBorder : "#e2e8f0",
                            backgroundColor: index === 0 ? styles.secondaryTint : "#f8fafc",
                          }}
                        >
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                          <p className="mt-2 text-2xl font-extrabold text-slate-950">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
