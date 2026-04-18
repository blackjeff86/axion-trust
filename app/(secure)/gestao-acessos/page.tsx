"use client";

import Link from "next/link";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";

const pendingRequests = [
  {
    company: "FinTech Global Inc.",
    requester: "Roberto Silva (roberto@fintech.io)",
    tags: ["Compliance", "Data Room Alpha"],
    icon: "corporate_fare",
    access: "Editor",
    expires: "2024-12-31",
  },
  {
    company: "Advocacia Martins & Co.",
    requester: "Ana Paula (ana@martinsadv.com.br)",
    tags: ["Auditoria Legal"],
    icon: "gavel",
    access: "Visualizador",
    expires: "2024-06-15",
  },
];

const activeAccesses = [
  {
    name: "CloudScale Tech",
    email: "marco.antonio@cloudscale.net",
    permission: "Administrador",
    permissionClass: "bg-on-secondary/30 text-primary border-primary/20",
    start: "12 Jan 2024",
    end: "12 Jan 2025",
    icon: "business",
  },
  {
    name: "Carlos Mendes",
    email: "carlos@mendes-associados.com",
    permission: "Visualizador",
    permissionClass: "bg-surface-container-highest text-on-surface-variant border-outline-variant/20",
    start: "05 Out 2023",
    end: "15 Abr 2024",
    icon: "person",
  },
  {
    name: "Banco Centralizado",
    email: "compliance@bancocen.com.br",
    permission: "Editor",
    permissionClass: "bg-secondary-container/30 text-secondary border-secondary/20",
    start: "02 Fev 2024",
    end: "02 Ago 2024",
    icon: "account_balance",
  },
];

const pendingRowClasses =
  "grid grid-cols-1 gap-y-5 px-8 py-6 lg:grid-cols-[minmax(0,2.45fr)_minmax(0,2.05fr)_minmax(0,1.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-x-4";

export default function GestaoAcessosPage() {
  return (
    <>
      <SecureTopbar />

      <main className="min-h-screen p-8">
        <div className="mb-10">
          <SecurePageHeader
            title="Gestão de Acessos Externos"
            subtitle="Controle rigoroso de quem pode visualizar e interagir com seus dados de Trust. Gerencie permissões de parceiros, auditores e terceiros em um único lugar."
          />
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-primary/10 p-2 text-primary">pending_actions</span>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">PENDENTE</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">08</div>
            <div className="text-xs font-medium text-on-surface-variant">Novas Solicitacoes</div>
          </div>
          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-green-400/10 p-2 text-green-400">verified</span>
              <span className="rounded-full bg-green-400/10 px-2 py-1 text-xs font-bold text-green-400">ATIVO</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">124</div>
            <div className="text-xs font-medium text-on-surface-variant">Acessos Ativos</div>
          </div>
          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-tertiary/10 p-2 text-tertiary">schedule</span>
              <span className="rounded-full bg-tertiary/10 px-2 py-1 text-xs font-bold text-tertiary">AVISO</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">12</div>
            <div className="text-xs font-medium text-on-surface-variant">Expirando em 48h</div>
          </div>
          <div className="rounded-xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined rounded-lg bg-error/10 p-2 text-error">history</span>
            </div>
            <div className="mb-1 text-2xl font-bold text-white">452</div>
            <div className="text-xs font-medium text-on-surface-variant">Log de Auditoria</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="flex items-center justify-between border-b border-outline-variant/10 px-8 py-6">
              <h3 className="font-headline text-lg font-bold text-white">Solicitacoes Pendentes</h3>
              <Link href="/gestao-acessos/detalhes/ver-solicitacoes" className="text-xs font-bold text-primary transition-all hover:underline">
                VER TODAS
              </Link>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {pendingRequests.map((request) => (
                <div key={request.company} className={`${pendingRowClasses} transition-colors hover:bg-slate-50/50`}>
                  <div className="flex min-w-0 items-center gap-5">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-high">
                      <span className="material-symbols-outlined text-white">{request.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white">{request.company}</h4>
                      <p className="text-xs text-on-surface-variant">Solicitado por: {request.requester}</p>
                      <div className="mt-2 flex gap-2">
                        {request.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              tag === "Compliance"
                                ? "bg-secondary-container/30 text-secondary"
                                : "bg-surface-container-highest text-on-surface-variant"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col lg:pr-1">
                    <label className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Nivel de Acesso</label>
                    <select
                      className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low py-1.5 text-xs font-medium text-white focus:ring-1 focus:ring-primary"
                      defaultValue={request.access}
                    >
                      <option value="Visualizador">Visualizador</option>
                      <option value="Editor">Editor</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>

                  <div className="flex min-w-0 flex-col lg:px-1">
                    <label className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Expira em</label>
                    <input
                      className="w-full rounded-lg border border-outline-variant/20 bg-surface-container-low py-1.5 text-xs font-medium text-white focus:ring-1 focus:ring-primary"
                      type="date"
                      defaultValue={request.expires}
                    />
                  </div>

                  <div className="flex min-w-0 items-center justify-start gap-2 lg:justify-end lg:pl-1">
                    <Link
                      href="/gestao-acessos/detalhes/negar-solicitacao"
                      className="rounded-lg bg-error/10 p-2 text-error transition-all hover:bg-error/20"
                      title="Negar"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </Link>
                    <Link
                      href="/gestao-acessos/detalhes/aprovar-solicitacao"
                      className="min-w-[112px] rounded-lg bg-primary px-4 py-2 text-center text-xs font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-container"
                    >
                      APROVAR
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
            <div className="flex items-center justify-between border-b border-outline-variant/10 px-8 py-6">
              <h3 className="font-headline text-lg font-bold text-white">Acessos Ativos</h3>
              <div className="flex items-center gap-4">
                <span className="text-xs text-on-surface-variant">Filtrar por:</span>
                <div className="flex gap-1">
                  <Link href="/gestao-acessos/detalhes/filtro-todos" className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold text-primary">
                    Todos
                  </Link>
                  <Link href="/gestao-acessos/detalhes/filtro-administradores" className="rounded-full bg-transparent px-3 py-1 text-[10px] font-bold text-on-surface-variant transition-all hover:bg-surface-container-low">
                    Administradores
                  </Link>
                  <Link href="/gestao-acessos/detalhes/filtro-expirando" className="rounded-full bg-transparent px-3 py-1 text-[10px] font-bold text-on-surface-variant transition-all hover:bg-surface-container-low">
                    Expirando em breve
                  </Link>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <colgroup>
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Entidade / Usuario</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Permissao</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Data de Inicio</th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Vencimento</th>
                    <th className="px-8 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {activeAccesses.map((item) => (
                    <tr key={item.email} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                            <span className="material-symbols-outlined text-sm text-blue-500">{item.icon}</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{item.name}</div>
                            <div className="text-[11px] text-on-surface-variant">{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`rounded border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-tighter ${item.permissionClass}`}>
                          {item.permission}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs text-on-surface-variant">{item.start}</td>
                      <td className="px-8 py-5 text-xs font-medium text-white">{item.end}</td>
                      <td className="px-8 py-5 text-right">
                        <Link href="/gestao-acessos/detalhes/editar-acesso" className="p-1 text-slate-500 transition-colors hover:text-white">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <Link href="/gestao-acessos/detalhes/remover-acesso" className="ml-2 p-1 text-slate-500 transition-colors hover:text-error">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

              <div className="flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/30 px-8 py-4">
              <p className="text-[11px] font-medium text-on-surface-variant">Exibindo 3 de 124 usuarios com acesso</p>
              <div className="flex gap-2">
                <Link href="/gestao-acessos/detalhes/paginacao-anterior" className="rounded bg-surface-container-high p-1.5 text-on-surface-variant hover:text-white">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </Link>
                <Link href="/gestao-acessos/detalhes/paginacao-proxima" className="rounded bg-primary p-1.5 text-on-primary">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 border-t border-outline-variant/5 pt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            AXION TRUST - O Curador Digital © 2024 | Auditoria em tempo real habilitada
          </p>
        </footer>
      </main>

      <Link
        href="/gestao-acessos/detalhes/novo-acesso"
        className="fixed bottom-8 right-8 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary-container shadow-2xl shadow-primary/30 transition-transform hover:bg-primary-container active:scale-95"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </Link>
    </>
  );
}
