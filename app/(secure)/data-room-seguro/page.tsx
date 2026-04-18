"use client";

import Link from "next/link";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";

const files = [
  { name: "01_Documentos_Financeiros", type: "folder", color: "text-amber-500", access: "Ha 2 horas", size: "12 pastas" },
  { name: "02_Compliance_e_Legal", type: "folder", color: "text-amber-500", access: "Ontem, 16:45", size: "5 pastas" },
  { name: "Relatorio_Auditoria_V4.pdf", type: "description", color: "text-primary-container", access: "Ha 15 min", size: "4.2 MB", selected: true },
  { name: "Planilha_Consolidada_Q3.xlsx", type: "table_chart", color: "text-green-500", access: "02/11/2023", size: "1.8 MB" },
];

export default function DataRoomSeguroPage() {
  return (
    <>
      <SecureTopbar placeholder="Pesquisar arquivos ou pastas..." />

      <main className="min-h-screen p-8">
        <div className="mb-10 flex items-end justify-between">
          <SecurePageHeader
            title="Data Room Seguro"
            subtitle="Ambiente criptografado e auditado para compartilhamento de ativos críticos."
          />
          <div className="flex gap-2">
            <Link
              href="/data-room-seguro/detalhes/visualizacao-grid"
              className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-2.5 text-slate-400 transition-all hover:bg-slate-200 hover:text-primary"
            >
              <span className="material-symbols-outlined">grid_view</span>
            </Link>
            <Link
              href="/data-room-seguro/detalhes/visualizacao-lista"
              className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-2.5 text-primary transition-all"
            >
              <span className="material-symbols-outlined">list</span>
            </Link>
          </div>
        </div>

        <div className="flex gap-6">
          <section className="flex flex-1 flex-col gap-6">
            <Link
              href="/data-room-seguro/detalhes/upload-arquivos"
              className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/50 bg-surface-container-low/30 p-10 transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl text-primary">upload_file</span>
              </div>
              <p className="text-lg font-semibold text-white">Arraste arquivos ou pastas para upload</p>
              <p className="mt-1 text-sm text-slate-500">Criptografia AES-256 aplicada automaticamente no upload.</p>
            </Link>

            <nav className="flex items-center gap-2 text-sm text-slate-400">
              <span className="material-symbols-outlined text-base">home</span>
              <span>Raiz</span>
              <span className="material-symbols-outlined text-base">chevron_right</span>
              <span className="font-medium text-white">Due Diligence M&A 2024</span>
            </nav>

            <div className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
              <table className="w-full border-collapse text-left">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nome</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ultimo Acesso</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tamanho</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {files.map((file) => (
                    <tr
                      key={file.name}
                      className={`${file.selected ? "border-l-4 border-primary bg-primary/10" : ""} group transition-colors hover:bg-slate-50/50`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`material-symbols-outlined ${file.color}`}
                            style={file.type === "folder" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            {file.type}
                          </span>
                          <span className={`text-sm ${file.selected ? "font-semibold text-white" : "font-medium text-white"}`}>{file.name}</span>
                          {file.selected && (
                            <span className="rounded bg-primary-container/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-primary">
                              Confidencial
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{file.access}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{file.size}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href="/data-room-seguro/detalhes/acao-item"
                          className={`material-symbols-outlined cursor-pointer transition-all ${file.selected ? "text-primary" : "text-slate-500 opacity-0 group-hover:opacity-100 hover:text-white"}`}
                        >
                          {file.selected ? "info" : "more_vert"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="flex w-80 flex-col gap-6">
            <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <span className="material-symbols-outlined text-2xl text-primary">description</span>
                </div>
                <Link href="/data-room-seguro/detalhes/fechar-painel" className="text-slate-500 hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </Link>
              </div>
              <h3 className="font-headline text-lg font-bold leading-tight text-white">Relatorio_Auditoria_V4.pdf</h3>
              <p className="mt-1 text-xs text-slate-500">Hash: e3b0c44298fc1c149afbf4c899...</p>

              <div className="mt-8 space-y-6">
                <div>
                  <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Controle de Acesso</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-slate-400">visibility</span>
                        <span className="text-sm text-white">Visualizacao Offline</span>
                      </div>
                      <div className="relative h-4 w-8 rounded-full bg-primary">
                        <div className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="material-symbols-outlined text-lg">download</span>
                        <span className="text-sm">Permitir Download</span>
                      </div>
                      <div className="relative h-4 w-8 rounded-full bg-surface-variant">
                        <div className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-slate-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-slate-400">print</span>
                        <span className="text-sm text-white">Watermark Dinamica</span>
                      </div>
                      <div className="relative h-4 w-8 rounded-full bg-primary">
                        <div className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Data de Expiracao</label>
                  <div className="flex items-center justify-between rounded-lg border border-outline-variant/10 bg-surface-container-highest/50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">event</span>
                      <span className="text-sm text-white">31 Dez, 2024</span>
                    </div>
                    <Link href="/data-room-seguro/detalhes/editar-expiracao" className="material-symbols-outlined text-base text-slate-500">
                      edit
                    </Link>
                  </div>
                </div>

                <div>
                  <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Logs de Auditoria</label>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold">JD</div>
                        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0c1321] bg-green-500">
                          <span className="material-symbols-outlined text-[10px] text-white">visibility</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Joao Doria (Parceiro)</p>
                        <p className="text-[10px] text-slate-500">Visualizou via Web • 2 min atras</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold">AL</div>
                        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0c1321] bg-blue-500">
                          <span className="material-symbols-outlined text-[10px] text-white">download</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Ana Lucia (Admin)</p>
                        <p className="text-[10px] text-slate-500">Fez download • Hoje, 09:12</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold">EB</div>
                        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0c1321] bg-amber-500">
                          <span className="material-symbols-outlined text-[10px] text-white">warning</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Eduardo B. (Externo)</p>
                        <p className="text-[10px] font-medium text-error">Tentativa de print bloqueada • Ontem</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/data-room-seguro/detalhes/ver-relatorio-completo"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
                  >
                    Ver Relatorio Completo
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <h4 className="text-sm font-bold text-white">Ambiente Certificado</h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Este Data Room opera sob a certificacao ISO 27001 e os dados sao redundantes em multiplos clusters geograficos.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
