"use client";

import Link from "next/link";
import { SecureTopbar } from "@/components/layout/secure-topbar";

type Certification = {
  label: string;
  icon: string;
  iconClass: string;
  checked: boolean;
};

type PolicyDoc = {
  title: string;
  updatedAt: string;
  icon: string;
  isPublic: boolean;
};

const certifications: Certification[] = [
  { label: "ISO 27001", icon: "security", iconClass: "text-blue-400 bg-blue-500/10", checked: true },
  { label: "SOC 2 Type II", icon: "analytics", iconClass: "text-primary bg-primary/10", checked: true },
  { label: "LGPD / GDPR", icon: "gavel", iconClass: "text-tertiary bg-tertiary/10", checked: false },
];

const docs: PolicyDoc[] = [
  { title: "Politica de Privacidade", updatedAt: "Atualizado em 12 Out, 2023", icon: "article", isPublic: true },
  { title: "Plano de Resposta a Incidentes", updatedAt: "Atualizado em 05 Jan, 2024", icon: "shield", isPublic: false },
  { title: "Relatorio de Penetration Test", updatedAt: "Atualizado em 15 Dez, 2023", icon: "lock_open", isPublic: false },
  { title: "Arquitetura de Nuvem", updatedAt: "Atualizado em 20 Fev, 2024", icon: "dns", isPublic: true },
];

const faqItems = [
  "Como os dados sao criptografados?",
  "Voces possuem certificacao PCI-DSS?",
  "Onde os servidores estao localizados?",
];

export default function BuilderTrustCenterPage() {
  return (
    <>
      <SecureTopbar placeholder="Buscar configuracoes..." />

      <main className="min-h-screen bg-surface p-8">
        <header className="mb-12 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <h2 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-white">Builder do Trust Center</h2>
            <p className="max-w-xl text-on-surface-variant">
              Configure a identidade visual, certificacoes e governanca que seus clientes verao em seu portal de transparencia.
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
            <Link
              href="/builder-trust-center/detalhes/salvar-alteracoes"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              Salvar Alteracoes
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-8">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">business</span>
              Perfil da Empresa
            </h3>

            <div className="flex flex-col gap-8 xl:flex-row">
              <div className="flex-shrink-0">
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">Logo da Empresa</label>
                <div className="group flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest transition-colors hover:border-primary">
                  <span className="material-symbols-outlined mb-2 text-3xl text-slate-500 group-hover:text-primary">add_photo_alternate</span>
                  <span className="text-[10px] font-bold uppercase text-slate-600">Upload</span>
                </div>
              </div>

              <div className="flex-grow space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Nome de Exibicao</label>
                  <input
                    type="text"
                    value="AXION Digital Solutions"
                    readOnly
                    className="w-full rounded-lg border-none bg-surface-container-lowest p-3 text-on-surface transition-all ring-primary/50 focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Descricao da Empresa</label>
                  <textarea
                    rows={4}
                    readOnly
                    className="w-full resize-none rounded-lg border-none bg-surface-container-lowest p-3 text-on-surface transition-all ring-primary/50 focus:ring-2"
                    value="Lider global em solucoes de ciberseguranca e curadoria de dados para empresas de alto crescimento. Comprometidos com a transparencia radical e privacidade por design."
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-4">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">verified</span>
              Certificacoes
            </h3>

            <div className="space-y-4">
              {certifications.map((cert) => (
                <label
                  key={cert.label}
                  className="group flex cursor-pointer items-center justify-between rounded-lg bg-surface-container-lowest p-3 transition-colors hover:bg-surface-container-high"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${cert.iconClass}`}>
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {cert.icon}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{cert.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cert.checked}
                    readOnly
                    className="h-5 w-5 rounded border-outline-variant bg-surface text-primary focus:ring-offset-surface"
                  />
                </label>
              ))}

              <Link
                href="/builder-trust-center/detalhes/adicionar-certificacao"
                className="mt-2 block w-full rounded-lg border-2 border-dashed border-outline-variant py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:border-primary hover:text-primary"
              >
                Adicionar Certificacao
              </Link>
            </div>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-headline text-lg font-bold">
                <span className="material-symbols-outlined text-primary">policy</span>
                Politicas e Documentos de Governanca
              </h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                8 Documentos Ativos
              </span>
            </div>

            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              {docs.map((doc) => (
                <div key={doc.title} className="flex items-center justify-between border-b border-outline-variant/10 py-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-500">{doc.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{doc.title}</p>
                      <p className="text-xs text-slate-500">{doc.updatedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="mb-1 text-[9px] font-bold uppercase text-slate-500">Visibilidade</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${doc.isPublic ? "text-primary" : "text-slate-500"}`}>
                          {doc.isPublic ? "PUBLICO" : "PRIVADO"}
                        </span>
                        <div className={`relative h-4 w-8 rounded-full ${doc.isPublic ? "bg-primary/30" : "bg-slate-700"}`}>
                          <div className={`absolute top-0.5 h-3 w-3 rounded-full ${doc.isPublic ? "right-0.5 bg-primary" : "left-0.5 bg-slate-400"}`} />
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/builder-trust-center/detalhes/documento-configuracao"
                      className="text-slate-500 transition-colors hover:text-white"
                      aria-label="Abrir menu de documento"
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/builder-trust-center/detalhes/carregar-documento"
              className="mt-8 flex items-center gap-2 text-sm font-bold tracking-tight text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Carregar novo documento
            </Link>
          </section>

          <section className="col-span-12 rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel lg:col-span-6">
            <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
              <span className="material-symbols-outlined text-primary">mail</span>
              Suporte de Seguranca
            </h3>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">E-mail de Contato de Seguranca</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-500">alternate_email</span>
                  <input
                    type="email"
                    readOnly
                    value="security@axiondigital.com"
                    className="w-full rounded-lg border-none bg-surface-container-lowest p-3 pl-12 text-on-surface transition-all ring-primary/50 focus:ring-2"
                  />
                </div>
                <p className="mt-2 text-[11px] italic text-slate-600">
                  Este e-mail sera exibido publicamente para reportes de vulnerabilidade.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Tempo Medio de Resposta (SLA)</label>
                <select className="w-full rounded-lg border-none bg-surface-container-lowest p-3 text-on-surface transition-all ring-primary/50 focus:ring-2" defaultValue="Menos de 24 horas">
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
              {faqItems.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg bg-surface-container-lowest p-3">
                  <span className="text-sm">{item}</span>
                  <Link
                    href="/builder-trust-center/detalhes/editar-faq"
                    className="text-slate-500 transition-colors hover:text-white"
                    aria-label="Editar item do FAQ"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </Link>
                </div>
              ))}

              <Link
                href="/builder-trust-center/detalhes/adicionar-faq"
                className="block w-full rounded-lg border-2 border-dashed border-outline-variant/20 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:border-primary hover:text-primary"
              >
                Adicionar Pergunta Frequente
              </Link>
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
            <p className="mb-1 text-xs font-bold text-slate-500">Status de Configuracao</p>
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
