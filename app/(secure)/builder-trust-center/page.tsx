"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import {
  DEFAULT_BUILDER_PUBLICATION_META,
  DEFAULT_BUILDER_SETTINGS,
  loadBuilderPublicationMeta,
  loadBuilderSettings,
  saveBuilderPublicationMeta,
  saveBuilderSettings,
  type BuilderPublicationMeta,
  type BuilderCertification,
  type BuilderDocument,
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

export default function BuilderTrustCenterPage() {
  const [theme, setTheme] = useState<TrustTheme>(DEFAULT_TRUST_THEME);
  const [settings, setSettings] = useState<BuilderSettings>(DEFAULT_BUILDER_SETTINGS);
  const [publicationMeta, setPublicationMeta] = useState<BuilderPublicationMeta>(DEFAULT_BUILDER_PUBLICATION_META);

  useEffect(() => {
    setTheme(loadTrustTheme());
    setSettings(loadBuilderSettings());
    setPublicationMeta(loadBuilderPublicationMeta());
  }, []);

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

  function addCertification() {
    const nextIndex = settings.certifications.length + 1;
    const newCertification: BuilderCertification = {
      id: `custom-cert-${nextIndex}`,
      label: `Nova certificacao ${nextIndex}`,
      icon: "verified",
      iconClass: "text-blue-400 bg-blue-500/10",
      checked: true,
    };

    setSettings((currentSettings) => ({
      ...currentSettings,
      certifications: [...currentSettings.certifications, newCertification],
    }));
  }

  function updateDocument(documentId: string, updates: Partial<BuilderDocument>) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      documents: currentSettings.documents.map((document) =>
        document.id === documentId ? { ...document, ...updates } : document,
      ),
    }));
  }

  function addDocument() {
    const nextIndex = settings.documents.length + 1;
    const newDocument: BuilderDocument = {
      id: `custom-doc-${nextIndex}`,
      title: `Novo documento ${nextIndex}`,
      updatedAt: "Atualizado agora",
      icon: "description",
      category: "Governanca",
      isPublic: true,
    };

    setSettings((currentSettings) => ({
      ...currentSettings,
      documents: [...currentSettings.documents, newDocument],
    }));
  }

  function updateFaqItem(index: number, value: string) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      faqItems: currentSettings.faqItems.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function addFaqItem() {
    setSettings((currentSettings) => ({
      ...currentSettings,
      faqItems: [...currentSettings.faqItems, "Nova pergunta frequente"],
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

  function formatMetaDate(value: string | null) {
    if (!value) return null;
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar blocos, secoes ou documentos..." />

      <main className="min-h-screen bg-surface p-8">
        <header className="mb-12 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <h2 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-white">Builder do Trust Center</h2>
            <p className="max-w-2xl text-on-surface-variant">
              Monte a pagina publica do Trust da sua empresa: identidade visual, secoes exibidas, certificacoes, documentos e FAQ.
            </p>
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
            Ultimo rascunho: {formatMetaDate(publicationMeta.draftSavedAt) ?? "ainda nao salvo"}
          </span>
          <span className="rounded-full bg-surface-container-low px-4 py-2">
            Ultima publicacao: {formatMetaDate(publicationMeta.publishedAt) ?? "nao publicada"}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-headline text-lg font-bold">
                <span className="material-symbols-outlined text-primary">brush</span>
                Identidade Visual do Trust
              </h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Pagina publica
              </span>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[160px_1fr]">
              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">Logo da Empresa</label>
                <div className="group flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest transition-colors hover:border-primary">
                  <span className="material-symbols-outlined mb-2 text-3xl text-slate-500 group-hover:text-primary">add_photo_alternate</span>
                  <span className="text-[10px] font-bold uppercase text-slate-600">Upload</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Nome de Exibicao</label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(event) =>
                      setSettings((currentSettings) => ({
                        ...currentSettings,
                        displayName: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border-none bg-surface-container-lowest p-3 text-on-surface transition-all ring-primary/50 focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Descricao Publica</label>
                  <textarea
                    rows={3}
                    onChange={(event) =>
                      setSettings((currentSettings) => ({
                        ...currentSettings,
                        publicDescription: event.target.value,
                      }))
                    }
                    className="w-full resize-none rounded-lg border-none bg-surface-container-lowest p-3 text-on-surface transition-all ring-primary/50 focus:ring-2"
                    value={settings.publicDescription}
                  />
                </div>

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">Estilo do logo no preview</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: "icon", label: "Icone compacto" },
                      { id: "wordmark", label: "Wordmark ampliado" },
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
                          className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                            isActive
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-outline-variant/20 bg-white text-slate-600 hover:border-primary/40"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">Paleta da pagina Trust</label>
                  <p className="mb-4 max-w-3xl text-sm text-slate-500">
                    Defina livremente as cores da pagina publica. O admin pode escolher por seletor visual ou preencher manualmente em `HEX` e `RGB`, e o preview respeita esses papeis visuais.
                  </p>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {(Object.keys(TRUST_THEME_LABELS) as TrustThemeRole[]).map((role) => {
                      const rgb = hexToRgbChannels(theme[role]);

                      return (
                        <div key={role} className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-4">
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
                              <div className="rounded-2xl border border-outline-variant/20 bg-white p-3 shadow-sm">
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
                                <div className="flex items-center rounded-2xl border border-outline-variant/20 bg-white px-4 py-3 shadow-sm">
                                  <span className="mr-3 text-sm font-bold text-slate-400">#</span>
                                  <input
                                    type="text"
                                    value={theme[role].replace("#", "")}
                                    onChange={(event) => updateTheme(role, event.target.value)}
                                    className="w-full bg-transparent text-sm font-semibold uppercase text-slate-700 outline-none"
                                  />
                                </div>
                              </div>

                              <div className="rounded-2xl border border-outline-variant/10 bg-white/70 p-3">
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
                                        className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary"
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

                  <div className="mt-5 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Resumo rapido do tema</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {(Object.keys(theme) as TrustThemeRole[]).map((role) => (
                        <div key={role} className="min-w-[140px] rounded-xl border border-outline-variant/10 bg-white p-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{TRUST_THEME_LABELS[role].title}</p>
                          <div className="mt-3 h-10 rounded-lg" style={{ backgroundColor: theme[role] }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-4">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">view_quilt</span>
              Secoes exibidas
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

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-4">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">verified</span>
              Certificacoes
            </h3>

            <div className="space-y-4">
              {settings.certifications.map((certification) => (
                <label
                  key={certification.id}
                  className="group flex cursor-pointer items-center justify-between rounded-lg bg-surface-container-lowest p-3 transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${certification.iconClass}`}>
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {certification.icon}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{certification.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={certification.checked}
                    onChange={(event) => updateCertification(certification.id, event.target.checked)}
                    className="h-5 w-5 rounded border-outline-variant bg-surface text-primary"
                  />
                </label>
              ))}

              <button
                type="button"
                onClick={addCertification}
                className="mt-2 block w-full rounded-lg border-2 border-dashed border-outline-variant py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:border-primary hover:text-primary"
              >
                Adicionar Certificacao
              </button>
            </div>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-8">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-headline text-lg font-bold">
                <span className="material-symbols-outlined text-primary">policy</span>
                Categorias e Documentos do Trust
              </h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                {settings.documents.length} Documentos Ativos
              </span>
            </div>

            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              {settings.documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between border-b border-outline-variant/10 py-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-500">{document.icon}</span>
                    <div>
                      <input
                        type="text"
                        value={document.title}
                        onChange={(event) => updateDocument(document.id, { title: event.target.value })}
                        className="w-full bg-transparent text-sm font-semibold text-on-surface outline-none"
                      />
                      <p className="text-xs text-slate-500">{document.updatedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="mb-1 text-[9px] font-bold uppercase text-slate-500">Visibilidade</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${document.isPublic ? "text-primary" : "text-slate-500"}`}>
                          {document.isPublic ? "PUBLICO" : "PRIVADO"}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateDocument(document.id, { isPublic: !document.isPublic })}
                          className={`relative h-4 w-8 rounded-full ${document.isPublic ? "bg-primary/30" : "bg-slate-700"}`}
                          aria-label={`Alterar visibilidade de ${document.title}`}
                        >
                          <span className={`absolute top-0.5 h-3 w-3 rounded-full ${document.isPublic ? "right-0.5 bg-primary" : "left-0.5 bg-slate-400"}`} />
                        </button>
                      </div>
                    </div>
                    <Link href="/builder-trust-center/detalhes/documento-configuracao" className="text-slate-500 transition-colors hover:text-white" aria-label="Abrir menu de documento">
                      <span className="material-symbols-outlined">more_vert</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addDocument} className="mt-8 flex items-center gap-2 text-sm font-bold tracking-tight text-primary hover:underline">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Carregar novo documento
            </button>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-6">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">mail</span>
              Atalhos e Contato Publico
            </h3>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">E-mail de Contato de Seguranca</label>
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
                <p className="mt-2 text-[11px] italic text-slate-600">Este e-mail sera exibido publicamente para reportes de vulnerabilidade.</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Tempo Medio de Resposta (SLA)</label>
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
                  <option>Ate 48 horas</option>
                  <option>Ate 5 dias uteis</option>
                </select>
              </div>
            </div>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-6">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">quiz</span>
              FAQ do Trust Center
            </h3>

            <div className="max-h-[220px] space-y-3 overflow-y-auto">
              {settings.faqItems.map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-lowest p-3">
                  <input
                    type="text"
                    value={item}
                    onChange={(event) => updateFaqItem(index, event.target.value)}
                    className="w-full bg-transparent text-sm text-on-surface outline-none"
                  />
                  <button type="button" className="text-slate-500 transition-colors hover:text-white" aria-label="Editar item do FAQ">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>
              ))}

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
              <span className="text-sm font-medium text-slate-400">Portal Publico Online</span>
            </div>
            <div className="h-8 w-px bg-outline-variant/20" />
            <div>
              <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Ultima Publicacao</span>
              <span className="text-sm font-medium">Ha 2 horas por Joao Silva</span>
            </div>
          </div>

          <div className="text-right">
            <p className="mb-1 text-xs font-bold text-slate-500">Status da Pagina Trust</p>
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
