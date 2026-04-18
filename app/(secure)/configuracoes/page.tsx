"use client";

import { SecureTopbar } from "@/components/layout/secure-topbar";

const tabs = ["Perfil da Empresa", "Branding", "Dominio", "Usuarios", "Integracoes"];

const members = [
  {
    initials: "MA",
    name: "Mateus Amaral",
    email: "mateus@axiontrust.io",
    access: "Administrador",
    accessClass: "bg-secondary-container/30 text-on-secondary-container",
    status: "Ativo",
    statusDot: "bg-emerald-500",
  },
  {
    initials: "BN",
    name: "Beatriz Nogueira",
    email: "beatriz@axiontrust.io",
    access: "Editor",
    accessClass: "bg-surface-variant text-on-surface-variant",
    status: "Ativo",
    statusDot: "bg-emerald-500",
  },
  {
    initials: "RP",
    name: "Ricardo Pereira",
    email: "ricardo@axiontrust.io",
    access: "Visualizador",
    accessClass: "bg-surface-variant text-on-surface-variant",
    status: "Pendente",
    statusDot: "bg-amber-500",
  },
];

const palette = ["#005cba", "#abc7ff", "#314972", "#ffb688", "#e07316", "#94a3b8"];

export default function ConfiguracoesPage() {
  return (
    <>
      <SecureTopbar placeholder="Pesquisar configuracoes..." />

      <main className="min-h-screen p-8">
        <header className="mb-10">
          <h2 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-white">Configuracoes do Trust Center</h2>
          <p className="max-w-2xl text-on-surface-variant">
            Gerencie a identidade visual, acessos e integracoes da sua plataforma de confianca digital.
          </p>
        </header>

        <div className="mb-10 flex gap-8 overflow-x-auto border-b border-outline-variant/10">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`pb-4 text-sm transition-colors ${
                index === 0
                  ? "border-b-2 border-primary font-bold text-primary"
                  : "font-medium text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="mb-1 font-headline text-xl font-bold text-white">Branding e Identidade</h3>
                  <p className="text-sm text-on-surface-variant">Personalize como sua marca aparece para os auditores.</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-primary/20">palette</span>
              </div>

              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Logotipo da Empresa</label>
                  <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/20 bg-surface-container-low p-8 transition-all hover:border-primary/50">
                    <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-lg bg-surface-container">
                      <span className="material-symbols-outlined text-4xl text-slate-600">cloud_upload</span>
                    </div>
                    <span className="text-sm font-semibold text-on-surface">Upload do Logo</span>
                    <span className="mt-1 text-[10px] text-slate-500">PNG, SVG ate 2MB</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cor Primaria da Interface</label>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 rounded-lg bg-surface-container-low p-3">
                      <div className="h-10 w-10 rounded bg-primary shadow-lg shadow-primary/20" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-on-surface-variant">Hexadecimal</div>
                        <div className="font-mono text-sm font-bold uppercase text-white">#ABC7FF</div>
                      </div>
                      <button className="text-xs font-bold text-primary hover:underline">Alterar</button>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {palette.map((color) => (
                        <button
                          key={color}
                          className={`aspect-square rounded transition-transform hover:scale-110 ${
                            color === "#abc7ff" ? "ring-2 ring-white/20" : ""
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Selecionar cor ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end border-t border-outline-variant/10 pt-6">
                <button className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary/10 transition-all hover:bg-primary/90">
                  Salvar Branding
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="mb-1 font-headline text-xl font-bold text-white">Membros da Equipe</h3>
                  <p className="text-sm text-on-surface-variant">Gerencie quem pode editar e visualizar o Trust Center.</p>
                </div>
                <button className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-slate-200">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Adicionar Membro
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/10 text-xs uppercase tracking-widest text-slate-500">
                      <th className="pb-4 font-bold">Usuario</th>
                      <th className="pb-4 font-bold">Acesso</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 text-right font-bold">Acao</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {members.map((member) => (
                      <tr key={member.email} className="group transition-colors hover:bg-white/[0.02]">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary">
                              {member.initials}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">{member.name}</div>
                              <div className="text-[10px] text-slate-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-tighter ${member.accessClass}`}>
                            {member.access}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-1.5 w-1.5 rounded-full ${member.statusDot}`} />
                            <span className="text-xs text-slate-400">{member.status}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-slate-600 transition-colors hover:text-white" aria-label="Abrir menu de acoes">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-100/50 bg-surface-container-lowest shadow-panel">
              <div className="h-24 bg-gradient-to-r from-primary/20 to-secondary/10" />
              <div className="-mt-10 px-6 pb-6">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl border-4 border-surface-container-high bg-surface-container-lowest shadow-2xl">
                  <span className="material-symbols-outlined text-3xl text-primary">business</span>
                </div>
                <h4 className="text-lg font-bold text-white">AXION Tech Group</h4>
                <p className="text-sm text-slate-400">ID: AX-7749-BT</p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Membros</span>
                    <span className="font-semibold text-on-surface">12 / 20</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-lowest">
                    <div className="h-full w-[60%] bg-primary" />
                  </div>
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-slate-500">Trust Center</span>
                    <span className="font-semibold text-emerald-500">Online</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
              <div className="mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">language</span>
                <h4 className="text-sm font-bold text-white">Dominio Customizado</h4>
              </div>
              <div className="mb-4 rounded-lg bg-surface-container p-3 font-mono text-xs text-primary-fixed">trust.axiontech.com.br</div>
              <p className="mb-4 text-[11px] leading-relaxed text-slate-500">
                O dominio esta propagado e protegido com SSL gerenciado pela AXION Trust.
              </p>
              <button className="w-full rounded bg-surface-variant py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-surface-bright">
                Configurar DNS
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
              <div className="relative z-10">
                <h4 className="mb-2 text-sm font-bold text-white">Precisa de Ajuda?</h4>
                <p className="mb-4 text-xs leading-relaxed text-on-surface-variant">
                  Fale com nosso time para configurar seu branding white-label.
                </p>
                <a className="flex items-center gap-2 text-xs font-bold text-primary transition-all hover:gap-3" href="#">
                  Abrir Chamado de Suporte
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-7xl text-primary/5">support_agent</span>
            </div>
          </aside>
        </div>

        <footer className="sticky bottom-8 mt-12 flex items-center justify-between rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="material-symbols-outlined text-sm">history</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Ultima alteracao: hoje as 14:32</span>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-white">Descartar</button>
            <button className="rounded-lg bg-primary px-8 py-2 text-sm font-bold text-on-primary-container shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Salvar Todas as Alteracoes
            </button>
          </div>
        </footer>
      </main>
    </>
  );
}
