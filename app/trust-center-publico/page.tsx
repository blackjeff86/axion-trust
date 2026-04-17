"use client";

import { ThemeModeToggle } from "@/components/theme/theme-mode-toggle";
import { UserInitialsAvatar } from "@/components/ui/user-initials-avatar";

export default function TrustCenterPublicoPage() {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary/30">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/5 bg-slate-950/60 px-8 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-container to-primary">
            <span className="material-symbols-outlined text-xl text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
          </div>
          <span className="font-headline text-xl font-extrabold tracking-tighter text-primary">AXION Trust</span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <a className="border-b-2 border-blue-500 pb-1 font-medium text-blue-400 transition-colors" href="#">
            Visao Geral
          </a>
          <a className="font-medium text-slate-400 transition-colors hover:text-blue-300" href="#">
            Relatorios
          </a>
          <a className="font-medium text-slate-400 transition-colors hover:text-blue-300" href="#">
            Audit Log
          </a>
        </nav>
        <div className="flex items-center gap-6">
          <div className="hidden items-center rounded-full border border-outline-variant/10 bg-surface-container-lowest px-4 py-1.5 lg:flex">
            <span className="material-symbols-outlined mr-2 text-sm text-outline">search</span>
            <input
              className="w-48 border-none bg-transparent text-sm text-on-surface placeholder:text-outline focus:ring-0"
              placeholder="Buscar documentos..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined cursor-pointer text-slate-400 hover:text-blue-300">help_outline</span>
            <ThemeModeToggle />
            <UserInitialsAvatar name="Ricardo Menezes" size="sm" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-20 py-8">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Trust Center Publico</span>
            </div>
            <h1 className="font-headline text-5xl font-extrabold leading-tight tracking-tight lg:text-7xl">
              Transparencia Radical. <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Seguranca de Elite.</span>
            </h1>
            <p className="text-xl leading-relaxed text-on-surface-variant">
              Bem-vindo ao portal de confianca da AXION Trust. Aqui voce encontra em tempo real nossa postura de seguranca, conformidade e governanca de dados.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="rounded-lg bg-gradient-to-r from-primary-container to-primary px-10 py-4 font-bold text-on-primary-container shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]">
                Solicitar Acesso ao Data Room
              </button>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight">Postura de Seguranca</h2>
              <p className="mt-2 text-on-surface-variant">Nossos principais pilares de conformidade e infraestrutura.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-6">
            <div className="group flex flex-col justify-between rounded-3xl border border-white/5 bg-surface-container-low p-8 transition-colors hover:bg-surface-container md:col-span-2 lg:col-span-2">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-high transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary">workspace_premium</span>
                </div>
                <h3 className="mb-2 text-xl font-bold">ISO 27001</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Sistema de Gestao de Seguranca da Informacao certificado e auditado anualmente por terceiros independentes.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary">
                <span>Ver Certificado</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-3xl border border-white/5 bg-surface-container-low p-8 transition-colors hover:bg-surface-container md:col-span-2 lg:col-span-2">
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-high transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary">security</span>
                </div>
                <h3 className="mb-2 text-xl font-bold">SOC 2 Type II</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Relatorio rigoroso sobre controles de Seguranca, Disponibilidade e Confidencialidade mantidos consistentemente.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary">
                <span>Solicitar Relatorio</span>
                <span className="material-symbols-outlined text-sm">lock</span>
              </div>
            </div>

            <div className="grid gap-6 md:col-span-2 lg:col-span-2 lg:grid-rows-2">
              <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-surface-container-high p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="material-symbols-outlined text-xl text-primary">database</span>
                </div>
                <div>
                  <p className="font-bold">Encryption at Rest</p>
                  <p className="text-xs text-on-surface-variant">AES-256 Bit Standard</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-surface-container-high p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="material-symbols-outlined text-xl text-primary">cloud_sync</span>
                </div>
                <div>
                  <p className="font-bold">Uptime 99.99%</p>
                  <p className="text-xs text-on-surface-variant">SLA Garantido por Contrato</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-surface-container-low p-8 md:col-span-4 lg:col-span-3">
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <h3 className="mb-2 text-xl font-bold">Residencia de Dados</h3>
                  <p className="max-w-xs text-sm text-on-surface-variant">
                    Oferecemos hospedagem em multiplas regioes (Brasil, EUA e Europa) para garantir conformidade com LGPD e GDPR.
                  </p>
                </div>
                <div className="mt-6 flex -space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-bright text-[10px] font-bold">BR</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-bright text-[10px] font-bold">US</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-bright text-[10px] font-bold">EU</div>
                </div>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 transition-opacity group-hover:opacity-30">
                <img
                  alt="Data Map"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8iqF8aaelMnWNYlJhLGZVM2M5O8a304-z7b3SivVM0e2QkcT5JRVyhIutnnRZZEaSSHRWAb_Gz9U3xbAhtyzLyWo5g9VNQu2UOkW3fKZr28Qmmn73TNRBR4oHPxEBPSlLMln3Iuuzim-XuDPRVeFgv5HnNXL4imYh4ytAZdZw38FlqTyJ8-T0zZ5gRZQ24jTY7JE6vB52KrkoMLp7WT6hy6gPiBK0-8gj5ZiXHpuToneOS0KLBov8YMp913xQfAG4yrZjZ8uWt8M"
                />
              </div>
            </div>

            <div className="flex items-center gap-8 rounded-3xl border border-white/5 bg-gradient-to-br from-surface-container-low to-surface-container-high p-8 md:col-span-4 lg:col-span-3">
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold">Seguranca Ofensiva</h3>
                <p className="text-sm text-on-surface-variant">
                  Testes de invasao semestrais realizados por empresas lideres e programa continuo de Bug Bounty.
                </p>
                <div className="mt-4 flex gap-3">
                  <span className="rounded-full bg-surface-variant px-3 py-1 text-[10px] font-bold uppercase text-primary">Pentest 2024 Clear</span>
                  <span className="rounded-full bg-surface-variant px-3 py-1 text-[10px] font-bold uppercase text-primary">HackerOne Partner</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="material-symbols-outlined text-6xl text-primary/20" style={{ fontVariationSettings: "'FILL' 1" }}>
                  security_update_good
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-headline text-3xl font-bold tracking-tight">Repositorio de Documentos</h2>
            <div className="flex gap-2">
              <button className="rounded-lg bg-surface-container p-2 transition-colors hover:bg-surface-bright">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button className="rounded-lg bg-surface-container p-2 transition-colors hover:bg-surface-bright">
                <span className="material-symbols-outlined">grid_view</span>
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-surface-container-lowest">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-outline">Documento</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-outline">Categoria</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-outline">Data</th>
                  <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-widest text-outline">Acao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="group transition-colors hover:bg-surface-container/30">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <div>
                        <p className="font-bold text-on-surface">Relatorio SOC 3 (Publico)</p>
                        <p className="text-xs text-on-surface-variant">Versao 2024.1 • PDF (1.2 MB)</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-medium text-on-secondary-container">Compliance</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">Mar 15, 2024</td>
                  <td className="px-8 py-5 text-right">
                    <button className="rounded-lg bg-surface-bright/50 px-4 py-2 text-xs font-bold transition-all hover:bg-primary hover:text-on-primary">Download</button>
                  </td>
                </tr>
                <tr className="group transition-colors hover:bg-surface-container/30">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">policy</span>
                      <div>
                        <p className="font-bold text-on-surface">Politica de Privacidade de Dados</p>
                        <p className="text-xs text-on-surface-variant">V4.0 • PDF (850 KB)</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-medium text-on-secondary-container">Legal</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">Jan 10, 2024</td>
                  <td className="px-8 py-5 text-right">
                    <button className="rounded-lg bg-surface-bright/50 px-4 py-2 text-xs font-bold transition-all hover:bg-primary hover:text-on-primary">Download</button>
                  </td>
                </tr>
                <tr className="group transition-colors hover:bg-surface-container/30">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">terminal</span>
                      <div>
                        <p className="font-bold text-on-surface">Arquitetura de Seguranca Tecnica</p>
                        <p className="text-xs text-on-surface-variant">V2.1 • Acesso Restrito</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-medium text-on-secondary-container">Infraestrutura</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">Dez 05, 2023</td>
                  <td className="px-8 py-5 text-right">
                    <button className="float-right flex cursor-not-allowed items-center gap-2 rounded-lg bg-surface-bright/50 px-4 py-2 text-xs font-bold opacity-60">
                      <span className="material-symbols-outlined text-sm">lock</span> Solicitar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="border-t border-white/5 bg-surface-container-low px-8 py-4 text-center">
              <button className="text-sm font-bold text-primary hover:underline">Ver todos os 24 documentos</button>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-container to-primary p-12 text-center">
          <div className="absolute inset-0 opacity-10">
            <img
              alt="Pattern"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX1jhYerZKAR5jhwkx05mGlAcvhPuMcs6e1OpyRtCJjWeWgLvNAMnF0GQeQCRnq8_HHFKbpEpgyb0ZcHg3Iq-1JyKGF4EyjeJ1xZcc8Up7FK7Fw2sx_JwfPkOVwFIiJ8JHVQP-4UOgNwD6z-sIO8eC9adz75bipnrN5QAP_U2W-ZO41IEzZx1YQz9dEQsO_88r3bTOJ0KWbeDzSQUAuMgtwMCTHG3S57pfBb1o6GTrsgQ9jMkTZYuVbqGGewqZVhKnJbTBqOWTesE"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="mb-4 font-headline text-3xl font-extrabold text-on-primary-container">Precisa de um Due Diligence Detalhado?</h2>
            <p className="mb-8 text-lg text-on-primary-container/80">
              Nossa equipe esta pronta para responder questionarios personalizados e fornecer evidencias tecnicas especificas para sua organizacao.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button className="rounded-xl bg-on-primary-container px-8 py-4 font-extrabold text-primary-container transition-transform hover:scale-105">
                Falar com Especialista
              </button>
              <button className="rounded-xl border border-on-primary-container/20 bg-primary-container/20 px-8 py-4 font-bold text-on-primary-container transition-colors hover:bg-primary-container/30">
                Visitar Base de Conhecimento
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-surface-container-lowest px-8 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1">
            <div className="mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
              <span className="font-headline text-xl font-bold">AXION Trust</span>
            </div>
            <p className="text-sm leading-relaxed text-outline">
              Elevando os padroes de seguranca digital atraves da transparencia e governanca inteligente.
            </p>
          </div>
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-outline">Conformidade</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li><a className="transition-colors hover:text-primary" href="#">Relatorios SOC</a></li>
              <li><a className="transition-colors hover:text-primary" href="#">Certificacoes ISO</a></li>
              <li><a className="transition-colors hover:text-primary" href="#">Conformidade LGPD</a></li>
              <li><a className="transition-colors hover:text-primary" href="#">Politicas de Seguranca</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-outline">Plataforma</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li><a className="transition-colors hover:text-primary" href="#">Status da API</a></li>
              <li><a className="transition-colors hover:text-primary" href="#">Bug Bounty</a></li>
              <li><a className="transition-colors hover:text-primary" href="#">Infraestrutura</a></li>
              <li><a className="transition-colors hover:text-primary" href="#">Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-outline">Legal</h4>
            <div className="space-y-4 text-sm text-on-surface-variant">
              <p>© 2024 AXION Trust. Todos os direitos reservados.</p>
              <div className="flex gap-4 pt-2">
                <span className="material-symbols-outlined cursor-pointer text-xl hover:text-primary">language</span>
                <span className="material-symbols-outlined cursor-pointer text-xl hover:text-primary">share</span>
                <span className="material-symbols-outlined cursor-pointer text-xl hover:text-primary">mail</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
