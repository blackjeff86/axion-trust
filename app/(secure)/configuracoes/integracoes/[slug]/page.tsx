"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import { getIntegrationDetailBySlug } from "../../integration-detail-data";

export default function ConfiguracaoIntegracaoDetalhePage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const detail = getIntegrationDetailBySlug(slug);

  if (!detail) {
    notFound();
  }

  const [primaryFields, setPrimaryFields] = useState(detail.primaryFields);
  const [deliveryFields, setDeliveryFields] = useState(detail.deliveryFields);
  const [notes, setNotes] = useState(detail.notes.join("\n"));
  const [toolConfigs, setToolConfigs] = useState(
    detail.tools.map((tool) => ({
      ...tool,
      configFields: tool.configFields.map((field) => ({ ...field })),
    })),
  );
  const [activeGuide, setActiveGuide] = useState<"endpoint" | "auth" | "routing" | "tools">("endpoint");

  const guideContent = {
    endpoint: {
      title: "Endpoint e destino",
      body:
        "Aqui o admin define para onde o AXION Trust envia ou consome dados. O ideal é usar uma URL estável, protegida e separada por ambiente, com owner técnico claro.",
      checklist: [
        "Usar endpoint exclusivo por ambiente",
        "Definir owner interno e owner do lado do cliente",
        "Garantir allowlist, firewall ou proteção equivalente",
      ],
    },
    auth: {
      title: "Autenticação e segurança",
      body:
        "Essa etapa garante que apenas sistemas autorizados troquem dados com o AXION Trust. O cliente deve escolher o método de autenticação que já usa internamente e documentar rotação de segredo ou certificado.",
      checklist: [
        "Validar bearer token, segredo ou certificado",
        "Registrar política de rotação e expiração",
        "Testar falha segura quando a credencial estiver inválida",
      ],
    },
    routing: {
      title: "Roteamento e eventos",
      body:
        "Aqui o admin escolhe quais tipos de evento deseja receber, com qual frequência e para qual destino operacional. Isso reduz ruído e evita integrações superdimensionadas.",
      checklist: [
        "Separar eventos críticos de eventos informativos",
        "Definir janela de sincronização compatível com o uso",
        "Mapear destino operacional e chave de correlação",
      ],
    },
    tools: {
      title: "Ferramentas conectadas",
      body:
        "Use esta parte para preparar conectores indiretos do AXION Trust com o stack do cliente, como Slack, Jira, Google Drive, Splunk, Datadog ou IdP corporativo.",
      checklist: [
        "Escolher ferramentas realmente usadas pelo time",
        "Definir qual app recebe alerta, ticket ou arquivo",
        "Documentar o fluxo de suporte e troubleshooting",
      ],
    },
  } as const;

  return (
    <>
      <SecureTopbar placeholder="Pesquisar configurações internas..." />

      <main className="min-h-screen space-y-8 p-8">
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/configuracoes?tab=integracoes" className="flex items-center gap-2 hover:text-primary">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Configurações
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <Link href="/configuracoes?tab=integracoes" className="font-semibold text-on-surface hover:text-primary">
              Integrações
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-semibold text-on-surface">{detail.title}</span>
          </div>

          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <SecurePageHeader title={detail.title} subtitle={detail.subtitle} />

            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${detail.statusClass} bg-surface-container-low`}>
                {detail.status}
              </span>
              <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface">
                {detail.category}
              </span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr,0.65fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-xl font-bold text-white">Configuração principal</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Parâmetros-base que deixam a integração pronta para comunicar com o stack do cliente.
                  </p>
                </div>
                <span className="material-symbols-outlined text-3xl text-primary/20">tune</span>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {primaryFields.map((field, index) => (
                  <div key={field.label}>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(event) =>
                        setPrimaryFields((current) =>
                          current.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, value: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-primary/20 bg-surface-container-low p-3 text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-xl font-bold text-white">Entrega e roteamento</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Defina para onde os dados vão, como são agrupados e em que janela devem ser sincronizados.
                  </p>
                </div>
                <span className="material-symbols-outlined text-3xl text-primary/20">alt_route</span>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {deliveryFields.map((field, index) => (
                  <div key={field.label}>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      {field.label}
                    </label>
                    <textarea
                      rows={field.value.length > 48 ? 4 : 3}
                      value={field.value}
                      onChange={(event) =>
                        setDeliveryFields((current) =>
                          current.map((item, currentIndex) =>
                            currentIndex === index ? { ...item, value: event.target.value } : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-primary/20 bg-surface-container-low p-3 text-sm text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-xl font-bold text-white">Ferramentas suportadas</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Referências práticas para o admin conectar o AXION Trust com ferramentas externas já conhecidas pelo cliente.
                  </p>
                </div>
                <span className="material-symbols-outlined text-3xl text-primary/20">hub</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {toolConfigs.map((tool) => (
                  <article key={tool.name} className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-5">
                    <p className="text-sm font-bold text-white">{tool.name}</p>
                    <p className="mt-3 text-sm text-on-surface-variant">{tool.purpose}</p>
                    <div className="mt-4 rounded-lg bg-surface-container-lowest p-3 text-xs leading-relaxed text-on-surface">
                      {tool.setup}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-xl font-bold text-white">Configuração por ferramenta</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Aqui é onde o admin do cliente realmente configura cada destino integrado ao AXION Trust.
                  </p>
                </div>
                <span className="material-symbols-outlined text-3xl text-primary/20">construction</span>
              </div>

              <div className="space-y-5">
                {toolConfigs.map((tool, toolIndex) => (
                  <article key={`${tool.name}-config`} className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-white">{tool.name}</h4>
                        <p className="mt-1 text-sm text-on-surface-variant">{tool.setup}</p>
                      </div>
                      <button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                        Salvar configuração do {tool.name}
                      </button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                      {tool.configFields.map((field, fieldIndex) => (
                        <div key={field.label}>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                            {field.label}
                          </label>
                          <input
                            type="text"
                            value={field.value}
                            onChange={(event) =>
                              setToolConfigs((current) =>
                                current.map((item, currentToolIndex) =>
                                  currentToolIndex === toolIndex
                                    ? {
                                        ...item,
                                        configFields: item.configFields.map((configField, currentFieldIndex) =>
                                          currentFieldIndex === fieldIndex
                                            ? { ...configField, value: event.target.value }
                                            : configField,
                                        ),
                                      }
                                    : item,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-primary/20 bg-surface-container-lowest p-3 text-sm text-on-surface outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-xl font-bold text-white">Guia assistido de configuração</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Explicação prática de cada grupo de opções para o admin do cliente conseguir configurar a integração sem depender do time técnico da AXION.
                  </p>
                </div>
                <span className="material-symbols-outlined text-3xl text-primary/20">school</span>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px,1fr]">
                <div className="space-y-2">
                  {[
                    { id: "endpoint", label: "Endpoint e destino" },
                    { id: "auth", label: "Autenticação" },
                    { id: "routing", label: "Roteamento e eventos" },
                    { id: "tools", label: "Ferramentas conectadas" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveGuide(item.id as typeof activeGuide)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-bold transition-colors ${
                        activeGuide === item.id
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-outline-variant/10 bg-surface-container-low text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
                  <h4 className="text-lg font-bold text-white">{guideContent[activeGuide].title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{guideContent[activeGuide].body}</p>

                  <div className="mt-6 grid grid-cols-1 gap-3">
                    {guideContent[activeGuide].checklist.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-xl bg-surface-container-lowest p-4">
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                        <p className="text-sm text-on-surface">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">grid_view</span>
                <h4 className="text-sm font-bold text-white">Resumo rápido</h4>
              </div>
              <div className="space-y-3 text-sm text-on-surface-variant">
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                  <span>Status</span>
                  <span className={`font-semibold ${detail.statusClass}`}>{detail.status}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                  <span>Owner</span>
                  <span className="font-semibold text-white">{detail.owner}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                  <span>Janela</span>
                  <span className="font-semibold text-white">{detail.syncWindow}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">checklist</span>
                <h4 className="text-sm font-bold text-white">Mapeamento de eventos</h4>
              </div>
              <div className="space-y-3">
                {detail.eventCards.map((eventCard) => (
                  <div key={eventCard.title} className="rounded-lg bg-surface-container-low p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{eventCard.title}</p>
                    <p className="mt-2 text-sm text-on-surface">{eventCard.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                <h4 className="text-sm font-bold text-white">Recomendações operacionais</h4>
              </div>
              <textarea
                rows={10}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full rounded-xl border border-primary/20 bg-white/80 p-4 text-sm text-slate-700 outline-none focus:border-primary"
              />
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
