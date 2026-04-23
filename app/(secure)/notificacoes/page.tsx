"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import {
  defaultAccessManagementState,
  type AccessManagementState,
} from "../gestao-acessos/access-data";
import {
  getDataRoomWorkspace,
  type DataRoomWorkspace,
} from "../data-room-seguro/data-room-data";

type ActivityItem = {
  id: string;
  category: "Acessos" | "Documentos" | "Segurança";
  daysAgo: number;
  timeLabel: string;
  title: string;
  description: string;
  icon: string;
  iconContainerClass: string;
  iconClass: string;
  borderClass?: string;
  badge?: {
    label: string;
    className: string;
  };
  details: Array<{
    icon?: string;
    iconClass?: string;
    label: string;
    value: string;
    valueClassName?: string;
    initials?: string;
    initialsClassName?: string;
  }>;
  actions: Array<{
    label: string;
    href: string;
    className: string;
  }>;
};

const securityActivities: ActivityItem[] = [
  {
    id: "security-support-approved",
    category: "Segurança",
    daysAgo: 0,
    timeLabel: "10:14 • HOJE",
    title: "Acesso de sustentação liberado para revisão operacional",
    description: "Ricardo Menezes recebeu permissão temporária para revisar evidências de segurança no ambiente Trust.",
    icon: "admin_panel_settings",
    iconContainerClass: "border-secondary/20 bg-surface-container-high",
    iconClass: "text-secondary",
    details: [
      { label: "Perfil:", value: "ADMIN / CISO" },
      { icon: "schedule", iconClass: "text-slate-500", label: "Validade:", value: "temporária" },
    ],
    actions: [
      {
        label: "ABRIR GESTÃO DE ACESSOS",
        href: "/gestao-acessos",
        className: "text-[10px] font-bold text-primary transition-colors hover:text-white",
      },
    ],
  },
  {
    id: "security-blocked-login",
    category: "Segurança",
    daysAgo: 1,
    timeLabel: "09:12 • ONTEM",
    title: "Tentativa de acesso indevido bloqueada",
    description: "Origem suspeita detectada para o usuário m.almeida@axion.com durante tentativa de entrada na plataforma.",
    icon: "gpp_maybe",
    iconContainerClass: "border-error/20 bg-surface-container-high",
    iconClass: "text-error",
    details: [
      { icon: "location_on", iconClass: "text-error", label: "Origem:", value: "Frankfurt, Alemanha" },
      { icon: "shield", iconClass: "text-slate-500", label: "Resposta:", value: "Auto-Block ativado" },
    ],
    actions: [
      {
        label: "VER TIMELINE DE SEGURANÇA",
        href: "/notificacoes/detalhes/filtro-seguranca",
        className: "text-[10px] font-bold tracking-wider text-error transition-colors hover:underline",
      },
    ],
  },
  {
    id: "security-scan-blocked",
    category: "Segurança",
    daysAgo: 24,
    timeLabel: "08:41 • 24 DIAS",
    title: "Varredura suspeita bloqueada no perimeter",
    description: "Motor de defesa identificou padrão recorrente de scan automatizado e aplicou bloqueio preventivo na borda da plataforma.",
    icon: "network_check",
    iconContainerClass: "border-error/20 bg-surface-container-high",
    iconClass: "text-error",
    details: [
      { icon: "public", iconClass: "text-slate-500", label: "Origem:", value: "ASN internacional" },
      { icon: "gpp_good", iconClass: "text-slate-500", label: "Resposta:", value: "Blacklist local atualizada" },
    ],
    actions: [
      {
        label: "VER TIMELINE DE SEGURANÇA",
        href: "/notificacoes/detalhes/filtro-seguranca",
        className: "text-[10px] font-bold tracking-wider text-error transition-colors hover:underline",
      },
    ],
  },
];

const categoryOptions = ["Todas", "Acessos", "Documentos", "Segurança"] as const;
const periodOptions = [
  { label: "Últimos 7 dias", value: 7 },
  { label: "Últimos 30 dias", value: 30 },
  { label: "Últimos 90 dias", value: 90 },
] as const;

function getDaysAgoFromLabel(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("ha") || normalized.includes("hoje")) return 0;
  if (normalized.includes("ontem")) return 1;

  const match = normalized.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return 30;

  const [, day, month, year] = match;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
  const now = new Date();
  const diffInMs = now.getTime() - parsedDate.getTime();
  return Math.max(0, Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
}

function formatTimelineLabel(daysAgo: number, fallback: string) {
  if (daysAgo === 0) return fallback.includes("HOJE") ? fallback : `${fallback} • HOJE`;
  if (daysAgo === 1) return fallback.includes("ONTEM") ? fallback : `${fallback} • ONTEM`;
  return fallback;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function buildTimelineActivities(workspace: DataRoomWorkspace, accessState: AccessManagementState): ActivityItem[] {
  const dataRoomRequestActivities: ActivityItem[] = workspace.requests.map((request) => {
    const document = workspace.documents.find((item) => item.id === request.documentId);
    const daysAgo = getDaysAgoFromLabel(request.requestedAtLabel);

    return {
      id: `request-${request.id}`,
      category: "Acessos",
      daysAgo,
      timeLabel: formatTimelineLabel(daysAgo, request.requestedAtLabel.toUpperCase()),
      title: "Solicitação de acesso a documento privado",
      description: `${request.requester} solicitou acesso ao documento "${document?.name ?? request.documentId}" no Trust Center.`,
      icon: "lock_open_right",
      iconContainerClass: "border-primary/20 bg-surface-container-high shadow-lg shadow-primary/5",
      iconClass: "text-primary",
      badge:
        request.status === "Pendente"
          ? { label: "PENDENTE", className: "bg-primary/10 text-primary" }
          : request.status === "Aprovado"
            ? { label: "APROVADO", className: "bg-emerald-100 text-emerald-700" }
            : { label: "NEGADO", className: "bg-rose-100 text-rose-700" },
      details: [
        {
          label: "Solicitante:",
          value: request.requester,
          initials: getInitials(request.requester),
          initialsClassName: "bg-primary/20 text-primary",
        },
        {
          icon: "description",
          iconClass: "text-slate-500",
          label: "Documento:",
          value: document?.name ?? request.documentId,
        },
        {
          icon: "apartment",
          iconClass: "text-slate-500",
          label: "Empresa:",
          value: request.company,
        },
      ],
      actions: [
        {
          label: "ABRIR GESTÃO DE ACESSOS",
          href: "/gestao-acessos",
          className: "text-[10px] font-bold text-primary transition-colors hover:text-white",
        },
      ],
    };
  });

  const approvedPlatformAccessActivities: ActivityItem[] = accessState.approvedAccesses.map((access) => {
    const daysAgo = getDaysAgoFromLabel(access.approvedAt);
    return {
      id: `approved-${access.id}`,
      category: "Acessos",
      daysAgo,
      timeLabel: formatTimelineLabel(daysAgo, access.approvedAt.toUpperCase()),
      title: "Acesso concedido a item privado do Trust",
      description: `${access.requester} recebeu autorização para visualizar ou baixar "${access.document}".`,
      icon: "key",
      iconContainerClass: "border-secondary/20 bg-surface-container-high",
      iconClass: "text-secondary",
      details: [
        {
          label: "Usuário:",
          value: access.requester,
          initials: getInitials(access.requester),
          initialsClassName: "bg-secondary/20 text-secondary",
        },
        {
          icon: "vpn_key",
          iconClass: "text-slate-500",
          label: "Status:",
          value: access.status,
        },
        {
          icon: "event",
          iconClass: "text-slate-500",
          label: "Expira em:",
          value: access.expiresAt,
        },
      ],
      actions: [
        {
          label: "ABRIR GESTÃO DE ACESSOS",
          href: "/gestao-acessos",
          className: "text-[10px] font-bold text-slate-400 transition-colors hover:text-white",
        },
      ],
    };
  });

  const documentActivities: ActivityItem[] = workspace.documents
    .filter((document) => document.visibility === "Público" || document.status === "Pendente de aprovação")
    .map((document) => {
      const daysAgo = getDaysAgoFromLabel(document.updatedAtLabel);
      return {
        id: `document-${document.id}`,
        category: "Documentos",
        daysAgo,
        timeLabel: formatTimelineLabel(daysAgo, document.updatedAtLabel.toUpperCase()),
        title:
          document.status === "Pendente de aprovação"
            ? "Documento aguardando aprovação no Data Room"
            : "Documento ofertado no Trust Center atualizado",
        description:
          document.status === "Pendente de aprovação"
            ? `"${document.name}" está pronto para revisão antes de ficar disponível no AXION Trust.`
            : `"${document.name}" está ofertado no Trust Center para ${document.visibility.toLowerCase()} e revisão dos clientes.`,
        icon: document.status === "Pendente de aprovação" ? "pending_actions" : "share",
        iconContainerClass: "border-primary/20 bg-surface-container-high shadow-lg shadow-primary/5",
        iconClass: document.status === "Pendente de aprovação" ? "text-amber-500" : "text-primary",
        badge:
          document.status === "Pendente de aprovação"
            ? { label: "REVISÃO", className: "bg-amber-100 text-amber-700" }
            : undefined,
        details: [
          {
            label: "Owner:",
            value: document.owner,
            initials: getInitials(document.owner),
            initialsClassName: "bg-primary/20 text-primary",
          },
          {
            icon: "folder",
            iconClass: "text-slate-500",
            label: "Categoria:",
            value: document.category,
          },
          {
            icon: "public",
            iconClass: "text-slate-500",
            label: "Acesso:",
            value: document.visibility,
          },
        ],
        actions: [
          {
            label: "ABRIR DATA ROOM",
            href: `/data-room-seguro?selected=${document.id}`,
            className: "text-[10px] font-bold text-primary transition-colors hover:text-white",
          },
        ],
      };
    });

  return [...dataRoomRequestActivities, ...approvedPlatformAccessActivities, ...documentActivities, ...securityActivities].sort(
    (a, b) => a.daysAgo - b.daysAgo,
  );
}

export default function CentralDeAtividadesPage() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categoryOptions)[number]>("Todas");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [workspace, setWorkspace] = useState<DataRoomWorkspace>(getDataRoomWorkspace());
  const [accessState, setAccessState] = useState<AccessManagementState>(defaultAccessManagementState);

  useEffect(() => {
    async function refresh() {
      const [dataRoomResponse, accessResponse] = await Promise.all([
        fetch("/api/data-room", { cache: "no-store" }),
        fetch("/api/access-management", { cache: "no-store" }),
      ]);

      if (dataRoomResponse.ok) {
        setWorkspace((await dataRoomResponse.json()) as DataRoomWorkspace);
      }

      if (accessResponse.ok) {
        setAccessState((await accessResponse.json()) as AccessManagementState);
      }
    }

    refresh();
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const activities = useMemo(() => buildTimelineActivities(workspace, accessState), [accessState, workspace]);

  const filteredActivities = useMemo(
    () =>
      activities.filter((activity) => {
        const matchesCategory = selectedCategory === "Todas" || activity.category === selectedCategory;
        const matchesPeriod = activity.daysAgo < selectedPeriod;
        return matchesCategory && matchesPeriod;
      }),
    [selectedCategory, selectedPeriod],
  );

  const groupedActivities = useMemo(() => {
    const groups: Array<{ label: string | null; items: ActivityItem[] }> = [];

    filteredActivities.forEach((activity) => {
      const label = activity.daysAgo === 0 ? null : activity.daysAgo === 1 ? "Ontem" : `${activity.daysAgo} dias atrás`;
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.label !== label) {
        groups.push({ label, items: [activity] });
        return;
      }

      lastGroup.items.push(activity);
    });

    return groups;
  }, [filteredActivities]);

  return (
    <>
      <SecureTopbar placeholder="Pesquisar logs, usuários ou eventos..." />

      <main className="min-h-screen p-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SecurePageHeader
              title="Central de Atividades"
              subtitle="Acompanhe em tempo real todas as interações, acessos e alterações de conformidade em sua infraestrutura de confiança."
            />

            <div className="flex items-center gap-3">
              <Link
                href="/notificacoes/detalhes/exportar-relatorio"
                className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 text-sm font-bold text-on-surface transition-all hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Exportar Relatório
              </Link>
            </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-6 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</span>
              <div className="flex gap-2">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                      selectedCategory === category
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-on-surface hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-10 w-[1px] bg-white/5" />

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Período</span>
              <label className="relative block">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">calendar_today</span>
                <select
                  value={selectedPeriod}
                  onChange={(event) => setSelectedPeriod(Number(event.target.value))}
                  className="w-full min-w-[170px] appearance-none rounded-xl border border-outline-variant/20 bg-surface-container-low py-2 pl-10 pr-9 text-xs font-medium text-on-surface outline-none transition focus:border-primary"
                >
                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">expand_more</span>
              </label>
            </div>

            <div className="ml-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("Todas");
                  setSelectedPeriod(7);
                }}
                className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Limpar filtro
              </button>
            </div>
        </div>

        <div className="relative space-y-4">
            <div className="absolute bottom-0 left-[27px] top-0 w-[2px] bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />

            {groupedActivities.length > 0 ? (
              groupedActivities.map((group) => (
                <div key={group.label ?? "hoje"} className="space-y-4">
                  {group.label ? (
                    <div className="relative flex items-center justify-center py-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5" />
                      </div>
                      <span className="relative bg-surface px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{group.label}</span>
                    </div>
                  ) : null}

                  {group.items.map((activity) => (
                    <div key={activity.id} className="group relative">
                      <div className="absolute left-0 top-3 flex w-14 justify-center">
                        <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-transform group-hover:scale-110 ${activity.iconContainerClass}`}>
                          <span className={`material-symbols-outlined ${activity.iconClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {activity.icon}
                          </span>
                        </div>
                      </div>

                      <div className={`ml-14 rounded-xl border border-slate-100/50 bg-surface-container-lowest p-5 shadow-panel transition-all duration-300 hover:bg-slate-50/50 ${activity.borderClass ?? ""}`}>
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{activity.title}</h4>
                              {activity.badge ? (
                                <span className={`rounded px-2 py-0.5 text-[9px] font-bold tracking-wider ${activity.badge.className}`}>
                                  {activity.badge.label}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-on-surface-variant">{activity.description}</p>
                          </div>
                          <span className="rounded bg-surface-container-lowest px-2 py-1 text-[10px] font-mono text-slate-500">{activity.timeLabel}</span>
                        </div>

                        <div className="mt-4 flex items-center gap-6 border-t border-white/5 pt-4">
                          {activity.details.map((detail) => (
                            <div key={`${activity.id}-${detail.label}`} className="flex items-center gap-2">
                              {detail.initials ? (
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold ${detail.initialsClassName}`}>
                                  {detail.initials}
                                </div>
                              ) : detail.icon ? (
                                <span className={`material-symbols-outlined text-xs ${detail.iconClass ?? "text-slate-500"}`}>{detail.icon}</span>
                              ) : null}
                              <span className="text-[11px] text-slate-400">
                                {detail.label} <strong className={detail.valueClassName ?? "text-white"}>{detail.value}</strong>
                              </span>
                            </div>
                          ))}

                          <div className="ml-auto flex gap-2">
                            {activity.actions.map((action) => (
                              <Link key={action.label} href={action.href} className={action.className}>
                                {action.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="ml-14 rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-panel">
                Nenhum evento encontrado para a categoria e período selecionados.
              </div>
            )}

            <div className="pt-8 text-center">
              <Link
                href="/notificacoes/detalhes/carregar-anteriores"
                className="rounded-full border border-white/5 bg-surface-container-lowest px-6 py-2 text-xs font-semibold text-slate-400 transition-all hover:bg-white/5 hover:text-white"
              >
                Carregar atividades anteriores
              </Link>
            </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div>
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                  <span className="material-symbols-outlined text-sm text-primary">analytics</span>
                </div>
                <h5 className="mb-1 text-sm font-bold text-white">Volume de Atividade</h5>
                <p className="text-[11px] text-slate-500">+12% comparado a semana anterior.</p>
              </div>

              <div className="mt-6">
                <div className="h-1 overflow-hidden rounded-full bg-surface-container-highest">
                  <div className="h-full w-[75%] bg-primary" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded bg-secondary/10">
                <span className="material-symbols-outlined text-sm text-secondary">verified</span>
              </div>
              <h5 className="mb-1 text-sm font-bold text-white">Conformidade Ativa</h5>
              <p className="text-2xl font-black text-white">99.8%</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Padrão SOC 2 Tipo II</p>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="absolute -bottom-4 -right-4 scale-150 opacity-5 transition-transform group-hover:scale-125">
                <span className="material-symbols-outlined text-9xl text-white">security</span>
              </div>

              <div className="relative z-10">
                <h5 className="mb-1 text-sm font-bold text-white">Relatório Semanal</h5>
                <p className="mb-4 text-[11px] text-slate-400">
                  Seu resumo automatizado de conformidade e riscos está pronto para revisão.
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                  RESUMO INTERNO
                </span>
              </div>
            </div>
          </div>
      </main>

      <div className="pointer-events-none fixed right-0 top-0 -z-10 -mr-96 -mt-96 h-[800px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-0 -z-10 -mb-96 -ml-96 h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[120px]" />
    </>
  );
}
