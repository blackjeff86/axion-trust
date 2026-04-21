"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import {
  getDataRoomWorkspace,
  getDataRoomWorkspaceClient,
  updateTrustDocumentPublicationClient,
  type DataRoomWorkspace,
} from "../data-room-seguro/data-room-data";
import {
  DEFAULT_BUILDER_PUBLICATION_META,
  DEFAULT_BUILDER_SETTINGS,
  loadBuilderPublicationMeta,
  loadBuilderSettings,
  saveBuilderPublicationMeta,
  saveBuilderSettings,
  type BuilderPublicationMeta,
  type BuilderCertification,
  type BuilderFaqItem,
  type BuilderSectionId,
  type BuilderSettings,
} from "./builder-settings";
import {
  DEFAULT_TRUST_THEME,
  TRUST_THEME_LABELS,
  getContrastColor,
  hexToRgbChannels,
  loadTrustTheme,
  normalizeHex,
  saveTrustTheme,
  type TrustTheme,
  type TrustThemeRole,
} from "./trust-theme";

const certificationIconOptions = [
  { value: "security", label: "Segurança", iconClass: "text-blue-400 bg-blue-500/10" },
  { value: "verified", label: "Validação", iconClass: "text-emerald-500 bg-emerald-500/10" },
  { value: "workspace_premium", label: "Selo premium", iconClass: "text-amber-500 bg-amber-500/10" },
  { value: "analytics", label: "Auditoria", iconClass: "text-primary bg-primary/10" },
  { value: "gavel", label: "Compliance legal", iconClass: "text-tertiary bg-tertiary/10" },
  { value: "shield", label: "Proteção", iconClass: "text-cyan-500 bg-cyan-500/10" },
  { value: "fact_check", label: "Conformidade", iconClass: "text-violet-500 bg-violet-500/10" },
  { value: "policy", label: "Políticas", iconClass: "text-slate-500 bg-slate-500/10" },
];

export default function BuilderTrustCenterPage() {
  const [theme, setTheme] = useState<TrustTheme>(DEFAULT_TRUST_THEME);
  const [settings, setSettings] = useState<BuilderSettings>(DEFAULT_BUILDER_SETTINGS);
  const [publicationMeta, setPublicationMeta] = useState<BuilderPublicationMeta>(DEFAULT_BUILDER_PUBLICATION_META);
  const [dataRoomWorkspace, setDataRoomWorkspace] = useState<DataRoomWorkspace>(getDataRoomWorkspace());
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setTheme(loadTrustTheme());
    setSettings(loadBuilderSettings());
    setPublicationMeta(loadBuilderPublicationMeta());
    setDataRoomWorkspace(getDataRoomWorkspaceClient());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    saveTrustTheme(theme);
  }, [hasHydrated, theme]);

  useEffect(() => {
    if (!hasHydrated) return;
    saveBuilderSettings(settings);
  }, [hasHydrated, settings]);

  function updateTheme(role: TrustThemeRole, color: string) {
    setTheme((currentTheme) => ({
      ...currentTheme,
      [role]: normalizeHex(color),
    }));
  }

  function updateThemeRgb(role: TrustThemeRole, channel: "r" | "g" | "b", value: string) {
    const currentRgb = hexToRgbChannels(theme[role]);
    const parsedValue = Number.parseInt(value, 10);
    const safeValue = Number.isNaN(parsedValue) ? 0 : Math.min(255, Math.max(0, parsedValue));
    const nextRgb = {
      ...currentRgb,
      [channel]: safeValue,
    };
    const nextHex = `#${[nextRgb.r, nextRgb.g, nextRgb.b]
      .map((item) => item.toString(16).padStart(2, "0"))
      .join("")}`;

    updateTheme(role, nextHex);
  }

  function updateSection(sectionId: BuilderSectionId, enabled: boolean) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      sections: currentSettings.sections.map((section) =>
        section.id === sectionId ? { ...section, enabled } : section,
      ),
    }));
  }

  function updateCertification(certificationId: string, checked: boolean) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      certifications: currentSettings.certifications.map((certification) =>
        certification.id === certificationId ? { ...certification, checked } : certification,
      ),
    }));
  }

  function updateCertificationLabel(certificationId: string, label: string) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      certifications: currentSettings.certifications.map((certification) =>
        certification.id === certificationId ? { ...certification, label } : certification,
      ),
    }));
  }

  function updateCertificationIcon(certificationId: string, icon: string) {
    const selectedIcon =
      certificationIconOptions.find((option) => option.value === icon) ?? certificationIconOptions[0];

    setSettings((currentSettings) => ({
      ...currentSettings,
      certifications: currentSettings.certifications.map((certification) =>
        certification.id === certificationId
          ? { ...certification, icon: selectedIcon.value, iconClass: selectedIcon.iconClass }
          : certification,
      ),
    }));
  }

  function removeCertification(certificationId: string) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      certifications: currentSettings.certifications.filter((certification) => certification.id !== certificationId),
    }));
  }

  function addCertification() {
    const nextIndex = settings.certifications.length + 1;
    const defaultIcon = certificationIconOptions[0];
    const newCertification: BuilderCertification = {
      id: `custom-cert-${Date.now()}`,
      label: `Nova certificação ${nextIndex}`,
      icon: defaultIcon.value,
      iconClass: defaultIcon.iconClass,
      checked: true,
    };

    setSettings((currentSettings) => ({
      ...currentSettings,
      certifications: [...currentSettings.certifications, newCertification],
    }));
  }

  function toggleTrustDocumentPublication(documentId: string, published: boolean) {
    const nextWorkspace = updateTrustDocumentPublicationClient(documentId, published);
    setDataRoomWorkspace(nextWorkspace);
  }

  function updateFaqItem(index: number, field: "question" | "answer", value: string) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      faqItems: currentSettings.faqItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addFaqItem() {
    const nextIndex = settings.faqItems.length + 1;
    const newFaqItem: BuilderFaqItem = {
      id: `faq-${Date.now()}`,
      question: `Nova pergunta frequente ${nextIndex}`,
      answer: "Escreva aqui a resposta que será exibida no portal público.",
    };

    setSettings((currentSettings) => ({
      ...currentSettings,
      faqItems: [...currentSettings.faqItems, newFaqItem],
    }));
  }

  function removeFaqItem(index: number) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      faqItems: currentSettings.faqItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateHeroSignal(signalId: string, field: "label" | "value" | "note", value: string) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      heroSignals: currentSettings.heroSignals.map((signal) =>
        signal.id === signalId ? { ...signal, [field]: value } : signal,
      ),
    }));
  }

  function saveDraft() {
    const savedAt = new Date().toISOString();
    saveTrustTheme(theme);
    saveBuilderSettings(settings);
    const nextMeta = {
      ...publicationMeta,
      draftSavedAt: savedAt,
    };
    setPublicationMeta(nextMeta);
    saveBuilderPublicationMeta(nextMeta);
  }

  function publishTrustCenter() {
    const publishedAt = new Date().toISOString();
    saveTrustTheme(theme);
    saveBuilderSettings(settings);
    const nextMeta = {
      draftSavedAt: publishedAt,
      publishedAt,
    };
    setPublicationMeta(nextMeta);
    saveBuilderPublicationMeta(nextMeta);
  }

  function restoreMockData() {
    setTheme(DEFAULT_TRUST_THEME);
    setSettings(DEFAULT_BUILDER_SETTINGS);
    setPublicationMeta(DEFAULT_BUILDER_PUBLICATION_META);
    saveTrustTheme(DEFAULT_TRUST_THEME);
    saveBuilderSettings(DEFAULT_BUILDER_SETTINGS);
    saveBuilderPublicationMeta(DEFAULT_BUILDER_PUBLICATION_META);
  }

  function formatMetaDate(value: string | null) {
    if (!value) return null;
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  }

  const trustDocumentsForBuilder = dataRoomWorkspace.documents.filter(
    (document) => document.status === "Publicado" || document.publishedAtLabel,
  );

  const publishedTrustDocumentsCount = trustDocumentsForBuilder.filter(
    (document) => document.status === "Publicado",
  ).length;

  return (
    <>
      <SecureTopbar placeholder="Buscar blocos, seções ou documentos..." />

      <main className="min-h-screen bg-surface p-8">
        <header className="mb-12 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <h2 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-white">Builder do Trust Center</h2>
            <p className="max-w-2xl text-on-surface-variant">
              Monte a página pública do Trust da sua empresa: identidade visual, seções exibidas, certificações, documentos e FAQ.
            </p>
            <button
              type="button"
              onClick={restoreMockData}
              className="mt-4 flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:border-primary/40 hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">settings_backup_restore</span>
              Restaurar dados mockados
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/builder-trust-center/detalhes/modo-preview"
              className="flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-lg">visibility</span>
              Modo Preview
            </Link>
            <button
              type="button"
              onClick={saveDraft}
              className="flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:border-primary/40 hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">draft</span>
              Salvar rascunho
            </button>
            <button
              type="button"
              onClick={publishTrustCenter}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              Publicar no Trust
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-surface-container-low px-4 py-2">
            Último rascunho: {formatMetaDate(publicationMeta.draftSavedAt) ?? "ainda não salvo"}
          </span>
          <span className="rounded-full bg-surface-container-low px-4 py-2">
            Última publicação: {formatMetaDate(publicationMeta.publishedAt) ?? "não publicada"}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <section className="col-span-12 rounded-[30px] border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-headline text-lg font-bold">
                  <span className="material-symbols-outlined text-primary">brush</span>
                  Identidade Visual do Trust
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                  Configure a marca e toda a narrativa principal da página pública: como o Trust aparece no header,
                  qual mensagem abre a página e quais sinais de confiança reforçam a proposta logo no primeiro bloco.
                </p>
              </div>
              <span className="self-start rounded-full bg-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary xl:self-auto">
                Marca + narrativa pública
              </span>
            </div>

            <div className="rounded-[30px] border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,249,255,0.94)_100%)] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.05)] md:p-7">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
                <div className="rounded-[28px] border border-outline-variant/10 bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.04)]">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Marca</p>
                      <h4 className="mt-2 text-xl font-bold text-slate-950">Identidade institucional</h4>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                      Header do Trust
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="rounded-[24px] border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(248,251,255,0.92)_0%,rgba(255,255,255,0.96)_100%)] p-5">
                      <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Logo da Empresa</label>
                      <div className="group flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-white transition-colors hover:border-primary">
                        <span className="material-symbols-outlined mb-3 text-3xl text-slate-500 group-hover:text-primary">add_photo_alternate</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Upload mockado</span>
                        <span className="mt-2 text-xs text-slate-400">PNG, SVG ou wordmark institucional</span>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(248,251,255,0.92)_0%,rgba(255,255,255,0.96)_100%)] p-5">
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Nome de Exibição</label>
                      <input
                        type="text"
                        value={settings.displayName}
                        onChange={(event) =>
                          setSettings((currentSettings) => ({
                            ...currentSettings,
                            displayName: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-outline-variant/10 bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                      />
                    </div>

                    <div className="rounded-[24px] border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(248,251,255,0.92)_0%,rgba(255,255,255,0.96)_100%)] p-5">
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Descrição pública</label>
                      <textarea
                        rows={5}
                        onChange={(event) =>
                          setSettings((currentSettings) => ({
                            ...currentSettings,
                            publicDescription: event.target.value,
                          }))
                        }
                        className="w-full resize-none rounded-xl border border-outline-variant/10 bg-white px-4 py-3 text-sm leading-6 text-on-surface outline-none transition focus:border-primary"
                        value={settings.publicDescription}
                      />
                    </div>

                    <div className="rounded-[24px] border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(248,251,255,0.92)_0%,rgba(255,255,255,0.96)_100%)] p-5">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Logo no Preview</label>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                          Header
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {[
                          { id: "icon", label: "Ícone compacto", description: "Marca resumida em um bloco visual menor." },
                          { id: "wordmark", label: "Wordmark ampliado", description: "Nome da marca com mais presença no header." },
                        ].map((option) => {
                          const isActive = settings.logoMode === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() =>
                                setSettings((currentSettings) => ({
                                  ...currentSettings,
                                  logoMode: option.id as BuilderSettings["logoMode"],
                                }))
                              }
                              className={`rounded-2xl border p-4 text-left transition ${
                                isActive
                                  ? "border-primary bg-primary/10"
                                  : "border-outline-variant/20 bg-white hover:border-primary/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className={`text-sm font-bold ${isActive ? "text-primary" : "text-slate-700"}`}>{option.label}</p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">{option.description}</p>
                                </div>
                                <span className={`material-symbols-outlined ${isActive ? "text-primary" : "text-slate-300"}`}>
                                  {isActive ? "radio_button_checked" : "radio_button_unchecked"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(247,250,255,0.96)_0%,rgba(255,255,255,0.98)_100%)] p-6 shadow-[0_14px_30px_rgba(15,23,42,0.04)]">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Hero editor</p>
                      <h4 className="mt-2 text-xl font-bold text-slate-950">Mensagem principal da página</h4>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                      Conteúdo de venda do cliente
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-outline-variant/10 bg-white p-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Badge principal</label>
                        <input
                          type="text"
                          value={settings.heroBadge}
                          onChange={(event) =>
                            setSettings((currentSettings) => ({
                              ...currentSettings,
                              heroBadge: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Texto de atualização</label>
                        <input
                          type="text"
                          value={settings.heroUpdatedLabel}
                          onChange={(event) =>
                            setSettings((currentSettings) => ({
                              ...currentSettings,
                              heroUpdatedLabel: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Título principal</label>
                      <textarea
                        rows={5}
                        value={settings.heroTitle}
                        onChange={(event) =>
                          setSettings((currentSettings) => ({
                            ...currentSettings,
                            heroTitle: event.target.value,
                          }))
                        }
                        className="w-full resize-none rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm leading-6 text-on-surface outline-none transition focus:border-primary"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">CTA primário</label>
                        <input
                          type="text"
                          value={settings.primaryCtaLabel}
                          onChange={(event) =>
                            setSettings((currentSettings) => ({
                              ...currentSettings,
                              primaryCtaLabel: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">CTA secundário</label>
                        <input
                          type="text"
                          value={settings.secondaryCtaLabel}
                          onChange={(event) =>
                            setSettings((currentSettings) => ({
                              ...currentSettings,
                              secondaryCtaLabel: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-outline-variant/10 bg-white p-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Sinais de confiança</p>
                        <h5 className="mt-2 text-base font-bold text-slate-950">Cards de apoio do hero</h5>
                      </div>
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                        {settings.heroSignals.length} indicadores
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                      {settings.heroSignals.map((signal, index) => (
                        <div
                          key={signal.id}
                          className="rounded-[22px] border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(248,251,255,0.9)_0%,rgba(255,255,255,0.98)_100%)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)]"
                        >
                          <div className="mb-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                <span className="text-sm font-black">{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">Indicador {index + 1}</p>
                                <p className="text-xs text-slate-500">Exibido no bloco lateral</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Titulo</label>
                              <input
                                type="text"
                                value={signal.label}
                                onChange={(event) => updateHeroSignal(signal.id, "label", event.target.value)}
                                className="w-full rounded-xl border border-outline-variant/10 bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Valor</label>
                              <input
                                type="text"
                                value={signal.value}
                                onChange={(event) => updateHeroSignal(signal.id, "value", event.target.value)}
                                className="w-full rounded-xl border border-outline-variant/10 bg-white px-4 py-3 text-sm font-bold text-on-surface outline-none transition focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Texto de apoio</label>
                              <input
                                type="text"
                                value={signal.note}
                                onChange={(event) => updateHeroSignal(signal.id, "note", event.target.value)}
                                className="w-full rounded-xl border border-outline-variant/10 bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="col-span-12 rounded-[30px] border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-headline text-lg font-bold">
                  <span className="material-symbols-outlined text-primary">palette</span>
                  Paleta da Página Trust
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                  Defina o sistema visual da página pública. Essas cores alimentam badges, botões, header, blocos de apoio
                  e a atmosfera geral do preview que o cliente final vai enxergar.
                </p>
              </div>
              <span className="self-start rounded-full bg-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary xl:self-auto">
                Sistema visual do preview
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="rounded-[28px] border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(247,250,255,0.96)_0%,rgba(255,255,255,0.98)_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                <div className="mb-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Leitura rápida</p>
                  <h4 className="mt-2 text-xl font-bold text-slate-950">Como a paleta se distribui</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Use este bloco como referência visual antes de abrir o preview completo. A ideia aqui é entender rapidamente
                    se a combinação está sofisticada, legível e coerente com a marca do cliente.
                  </p>
                </div>

                <div className="rounded-[24px] border border-outline-variant/10 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.03)]">
                  <div
                    className="rounded-[20px] border p-3"
                    style={{
                      borderColor: theme.primary + "22",
                      backgroundColor: theme.surface,
                    }}
                  >
                  <div className="rounded-[18px] border px-4 py-4" style={{ borderColor: theme.primary + "22", backgroundColor: theme.header }}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ backgroundColor: theme.secondary, color: getContrastColor(theme.secondary) }}>
                        Header
                      </span>
                      <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ backgroundColor: theme.primary, color: getContrastColor(theme.primary) }}>
                        Principal
                      </span>
                    </div>
                    <div className="mt-4 rounded-2xl p-4" style={{ backgroundColor: "#ffffffE6" }}>
                      <p className="text-sm font-bold text-slate-900">Preview rápido</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">Botão, badge, fundo e áreas suaves representados em escala reduzida.</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ backgroundColor: theme.secondary, color: getContrastColor(theme.secondary) }}>
                          Badge
                        </span>
                        <button
                          type="button"
                          className="rounded-xl px-4 py-2 text-xs font-bold"
                          style={{ backgroundColor: theme.button, color: getContrastColor(theme.button) }}
                        >
                          CTA
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {(Object.keys(theme) as TrustThemeRole[]).map((role) => (
                      <div key={role} className="flex items-center gap-3 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-3">
                        <div className="h-11 w-11 rounded-xl border border-slate-200" style={{ backgroundColor: theme[role] }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900">{TRUST_THEME_LABELS[role].title}</p>
                          <p className="mt-1 truncate text-xs text-slate-500">{theme[role]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-outline-variant/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,251,255,0.95)_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Editor de cores</p>
                    <h4 className="mt-2 text-xl font-bold text-slate-950">Papeis visuais do Trust</h4>
                  </div>
                  <span className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                    Cor livre por papel
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {(Object.keys(TRUST_THEME_LABELS) as TrustThemeRole[]).map((role) => {
                    const rgb = hexToRgbChannels(theme[role]);

                    return (
                      <div key={role} className="rounded-2xl border border-outline-variant/10 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-on-surface">{TRUST_THEME_LABELS[role].title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{TRUST_THEME_LABELS[role].description}</p>
                          </div>
                          <span
                            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
                            style={{ backgroundColor: theme[role], color: getContrastColor(theme[role]) }}
                          >
                            {theme[role]}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[120px_minmax(0,1fr)]">
                          <div>
                            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Cor</label>
                            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-3 shadow-sm">
                              <input
                                type="color"
                                value={theme[role]}
                                onChange={(event) => updateTheme(role, event.target.value)}
                                className="h-20 w-full cursor-pointer rounded-xl border border-outline-variant/20 bg-transparent p-1"
                                aria-label={`Selecionar cor para ${TRUST_THEME_LABELS[role].title}`}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Hexadecimal</label>
                              <div className="flex items-center rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 shadow-sm">
                                <span className="mr-3 text-sm font-bold text-slate-400">#</span>
                                <input
                                  type="text"
                                  value={theme[role].replace("#", "")}
                                  onChange={(event) => updateTheme(role, event.target.value)}
                                  className="w-full bg-transparent text-sm font-semibold uppercase text-slate-700 outline-none"
                                />
                              </div>
                            </div>

                            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-3">
                              <div className="mb-3 flex items-center justify-between">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Ajuste fino RGB</p>
                                <span className="text-xs text-slate-400">0 - 255</span>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                {(["r", "g", "b"] as const).map((channel) => (
                                  <div key={`${role}-${channel}`}>
                                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{channel}</label>
                                    <input
                                      type="number"
                                      min={0}
                                      max={255}
                                      value={rgb[channel]}
                                      onChange={(event) => updateThemeRgb(role, channel, event.target.value)}
                                      className="w-full rounded-xl border border-outline-variant/20 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="col-span-12 self-start rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-6">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">view_quilt</span>
              Seções exibidas
            </h3>

            <div className="space-y-4">
              {settings.sections.map((section) => (
                <label
                  key={section.id}
                  className="group flex cursor-pointer items-center justify-between rounded-lg bg-surface-container-lowest p-3 transition-colors hover:bg-surface-container-high"
                >
                  <div>
                    <p className="text-sm font-medium">{section.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{section.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(event) => updateSection(section.id, event.target.checked)}
                    className="h-5 w-5 rounded border-outline-variant bg-surface text-primary"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-6">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">verified</span>
              Certificações
            </h3>

            <div className="space-y-4">
              {settings.certifications.map((certification) => (
                <div
                  key={certification.id}
                  className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-1 items-start gap-3">
                      <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${certification.iconClass}`}>
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {certification.icon}
                        </span>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            Nome da certificação
                          </label>
                          <input
                            type="text"
                            value={certification.label}
                            onChange={(event) => updateCertificationLabel(certification.id, event.target.value)}
                            className="w-full rounded-xl border border-outline-variant/10 bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                            placeholder="Ex.: ISO 27001"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            Ícone da certificação
                          </label>
                          <select
                            value={certification.icon}
                            onChange={(event) => updateCertificationIcon(certification.id, event.target.value)}
                            className="w-full rounded-xl border border-outline-variant/10 bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                          >
                            {certificationIconOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-3">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        <span>Exibir</span>
                        <input
                          type="checkbox"
                          checked={certification.checked}
                          onChange={(event) => updateCertification(certification.id, event.target.checked)}
                          className="h-5 w-5 rounded border-outline-variant bg-surface text-primary"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => removeCertification(certification.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100"
                        aria-label={`Excluir ${certification.label}`}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addCertification}
                className="mt-2 block w-full rounded-lg border-2 border-dashed border-outline-variant py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:border-primary hover:text-primary"
              >
                Adicionar Certificação
              </button>
            </div>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-headline text-lg font-bold">
                <span className="material-symbols-outlined text-primary">policy</span>
                Categorias e Documentos do Trust
              </h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                {publishedTrustDocumentsCount} Documentos Publicados
              </span>
            </div>

            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              {trustDocumentsForBuilder.map((document) => (
                <div key={document.id} className="flex items-center justify-between border-b border-outline-variant/10 py-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-500">{document.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{document.name}</p>
                      <p className="text-xs text-slate-500">
                        {document.category} • {document.publishedAtLabel ?? document.updatedAtLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          document.status === "Publicado"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {document.status === "Publicado" ? "Publicado" : "Pausado"}
                      </span>
                      <span className="mb-1 text-[9px] font-bold uppercase text-slate-500">Acesso</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${document.visibility === "Público" ? "text-primary" : "text-slate-500"}`}>
                          {document.visibility === "Público" ? "PÚBLICO" : document.visibility.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleTrustDocumentPublication(document.id, document.status !== "Publicado")}
                          className={`relative h-4 w-8 rounded-full ${
                            document.status === "Publicado" ? "bg-primary/30" : "bg-slate-700"
                          }`}
                          aria-label={
                            document.status === "Publicado"
                              ? `Pausar publicação de ${document.name}`
                              : `Publicar novamente ${document.name}`
                          }
                        >
                          <span
                            className={`absolute top-0.5 h-3 w-3 rounded-full ${
                              document.status === "Publicado"
                                ? "right-0.5 bg-primary"
                                : "left-0.5 bg-slate-400"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <Link
                      href={`/data-room-seguro/detalhes/documento?item=${document.id}`}
                      className="text-slate-500 transition-colors hover:text-white"
                      aria-label={`Abrir detalhe de ${document.name}`}
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-6">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">mail</span>
              Atalhos e Contato Público
            </h3>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">E-mail de Contato de Segurança</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-500">alternate_email</span>
                  <input
                    type="email"
                    value={settings.securityContactEmail}
                    onChange={(event) =>
                      setSettings((currentSettings) => ({
                        ...currentSettings,
                        securityContactEmail: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-none bg-surface-container-lowest p-3 pl-12 text-on-surface transition-all ring-primary/50 focus:ring-2"
                  />
                </div>
                <p className="mt-2 text-[11px] italic text-slate-600">Este e-mail será exibido publicamente para reportes de vulnerabilidade.</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Tempo Médio de Resposta (SLA)</label>
                <select
                  className="w-full rounded-lg border-none bg-surface-container-lowest p-3 text-on-surface transition-all ring-primary/50 focus:ring-2"
                  value={settings.responseSla}
                  onChange={(event) =>
                    setSettings((currentSettings) => ({
                      ...currentSettings,
                      responseSla: event.target.value,
                    }))
                  }
                >
                  <option>Menos de 24 horas</option>
                  <option>Até 48 horas</option>
                  <option>Até 5 dias úteis</option>
                </select>
              </div>
            </div>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-6">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">quiz</span>
              FAQ do Trust Center
            </h3>

            <div className="space-y-4">
              <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
                <p className="text-sm font-semibold text-slate-900">Perguntas e respostas públicas</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Preencha a pergunta que o cliente costuma fazer e a resposta que deve aparecer no preview.
                </p>
              </div>

              <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
              {settings.faqItems.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-outline-variant/10 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <span className="text-sm font-black">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Item do FAQ</p>
                        <p className="text-xs text-slate-500">Conteúdo exibido na página pública</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFaqItem(index)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100"
                      aria-label={`Remover pergunta frequente ${index + 1}`}
                    >
                      Remover
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Pergunta</label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(event) => updateFaqItem(index, "question", event.target.value)}
                        className="w-full rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary"
                        placeholder="Ex.: Como vocês tratam incidentes de segurança?"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Resposta pública</label>
                      <textarea
                        rows={4}
                        value={item.answer}
                        onChange={(event) => updateFaqItem(index, "answer", event.target.value)}
                        className="w-full resize-none rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm leading-6 text-on-surface outline-none transition focus:border-primary"
                        placeholder="Explique de forma clara o texto que será mostrado ao visitante."
                      />
                    </div>
                  </div>
                </div>
              ))}
              </div>

              <button type="button" onClick={addFaqItem} className="block w-full rounded-lg border-2 border-dashed border-outline-variant/20 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:border-primary hover:text-primary">
                Adicionar Pergunta Frequente
              </button>
            </div>
          </section>
        </div>

        <footer className="mt-12 flex items-center justify-between rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-sm font-medium text-slate-400">Portal Público Online</span>
            </div>
            <div className="h-8 w-px bg-outline-variant/20" />
            <div>
              <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Última Publicação</span>
              <span className="text-sm font-medium">Há 2 horas por João Silva</span>
            </div>
          </div>

          <div className="text-right">
            <p className="mb-1 text-xs font-bold text-slate-500">Status da Página Trust</p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-surface-container-highest">
              <div className="h-full w-[85%] bg-primary" />
            </div>
            <span className="mt-1 inline-block text-[10px] font-bold text-primary">85% Completo</span>
          </div>
        </footer>
      </main>
    </>
  );
}
