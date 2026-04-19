"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import { slugifySupplierName, type SupplierProfile, upsertSupplier } from "../supplier-data";

type SupplierFormState = {
  legalName: string;
  displayName: string;
  domain: string;
  website: string;
  supplierType: string;
  segment: string;
  subsegment: string;
  headquartersCity: string;
  headquartersCountry: string;
  taxId: string;
  primaryContactName: string;
  primaryContactRole: string;
  primaryContactEmail: string;
  securityContactEmail: string;
  privacyContactEmail: string;
  businessOwner: string;
  criticality: string;
  integrationType: string;
  dataClassification: string;
  accessScope: string;
  hostingModel: string;
  activeRegions: string;
  servicesProvided: string;
  countriesOfOperation: string;
  certifications: string[];
  notes: string;
  risk: SupplierProfile["risk"];
};

const certificationOptions = ["ISO 27001", "SOC 2 Type II", "PCI-DSS", "LGPD", "GDPR", "CSA STAR"];
const accessScopeOptions = [
  "Sem acesso a sistemas internos",
  "Acesso somente leitura",
  "Acesso operacional restrito",
  "Acesso administrativo controlado",
  "Acesso a dados sensiveis regulados",
];

function normalizeTaxId(value: string) {
  return value.replace(/\D/g, "");
}

type CnpjLookupResponse = {
  legalName: string;
  displayName: string;
  domain: string;
  website: string;
  supplierType: string;
  segment: string;
  subsegment: string;
  headquartersCity: string;
  headquartersCountry: string;
  taxId: string;
  primaryContactEmail: string;
  criticality: string;
  integrationType: string;
  dataClassification: string;
  accessScope: string;
  hostingModel: string;
  activeRegions: string;
  servicesProvided: string;
  countriesOfOperation: string;
  risk: SupplierProfile["risk"];
  source: "brasilapi" | "fallback";
};

const initialState: SupplierFormState = {
  legalName: "",
  displayName: "",
  domain: "",
  website: "",
  supplierType: "SaaS / Plataforma",
  segment: "",
  subsegment: "",
  headquartersCity: "",
  headquartersCountry: "Brasil",
  taxId: "",
  primaryContactName: "",
  primaryContactRole: "",
  primaryContactEmail: "",
  securityContactEmail: "",
  privacyContactEmail: "",
  businessOwner: "",
  criticality: "Alta",
  integrationType: "API",
  dataClassification: "Dados corporativos e PII",
  accessScope: "Leitura operacional",
  hostingModel: "SaaS multi-tenant",
  activeRegions: "",
  servicesProvided: "",
  countriesOfOperation: "",
  certifications: [],
  notes: "",
  risk: "Medio Risco",
};

export default function NovoFornecedorPage() {
  const router = useRouter();
  const [form, setForm] = useState<SupplierFormState>(initialState);
  const [feedback, setFeedback] = useState("Preencha o cadastro do fornecedor para habilitar envio de questionarios.");
  const [lookupLoading, setLookupLoading] = useState(false);

  const generatedSlug = useMemo(() => slugifySupplierName(form.displayName || form.legalName || "novo-fornecedor"), [form.displayName, form.legalName]);

  function updateField<Key extends keyof SupplierFormState>(key: Key, value: SupplierFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCertification(certification: string) {
    setForm((current) => ({
      ...current,
      certifications: current.certifications.includes(certification)
        ? current.certifications.filter((item) => item !== certification)
        : [...current.certifications, certification],
    }));
  }

  async function lookupCnpj() {
    const normalized = normalizeTaxId(form.taxId);

    if (normalized.length !== 14) {
      setFeedback("Informe um CNPJ valido com 14 digitos para buscar os dados automaticamente.");
      return;
    }

    setLookupLoading(true);
    setFeedback("Consultando dados cadastrais do fornecedor...");

    try {
      const response = await fetch(`/api/cnpj/${normalized}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setFeedback(payload?.error || "Nao foi possivel consultar o CNPJ agora.");
        return;
      }

      const payload = (await response.json()) as CnpjLookupResponse;

      setForm((current) => ({
        ...current,
        legalName: payload.legalName || current.legalName,
        displayName: payload.displayName || current.displayName,
        domain: payload.domain || current.domain,
        website: payload.website || current.website,
        supplierType: payload.supplierType || current.supplierType,
        segment: payload.segment || current.segment,
        subsegment: payload.subsegment || current.subsegment,
        headquartersCity: payload.headquartersCity || current.headquartersCity,
        headquartersCountry: payload.headquartersCountry || current.headquartersCountry,
        taxId: payload.taxId || current.taxId,
        primaryContactEmail: payload.primaryContactEmail || current.primaryContactEmail,
        criticality: payload.criticality || current.criticality,
        integrationType: payload.integrationType || current.integrationType,
        dataClassification: payload.dataClassification || current.dataClassification,
        accessScope: payload.accessScope || current.accessScope,
        hostingModel: payload.hostingModel || current.hostingModel,
        activeRegions: payload.activeRegions || current.activeRegions,
        servicesProvided: payload.servicesProvided || current.servicesProvided,
        countriesOfOperation: payload.countriesOfOperation || current.countriesOfOperation,
        risk: payload.risk || current.risk,
      }));

      setFeedback(
        payload.source === "brasilapi"
          ? "Dados carregados a partir da consulta de CNPJ. Revise e complemente os campos antes de salvar."
          : "Dados iniciais carregados a partir da base de contingencia. Revise antes de salvar.",
      );
    } catch {
      setFeedback("O backend nao conseguiu concluir a consulta do CNPJ neste momento.");
    } finally {
      setLookupLoading(false);
    }
  }

  function handleSubmit() {
    if (!form.legalName || !form.displayName || !form.domain || !form.primaryContactEmail) {
      setFeedback("Preencha razao social, nome de exibicao, dominio e e-mail principal antes de salvar.");
      return;
    }

    const profile: SupplierProfile = {
      slug: generatedSlug,
      legalName: form.legalName,
      displayName: form.displayName,
      domain: form.domain,
      website: form.website || `https://${form.domain}`,
      supplierType: form.supplierType,
      segment: form.segment || "Fornecedor sem segmentacao",
      subsegment: form.subsegment || "Nao informado",
      headquartersCity: form.headquartersCity,
      headquartersCountry: form.headquartersCountry,
      taxId: form.taxId,
      primaryContactName: form.primaryContactName,
      primaryContactRole: form.primaryContactRole,
      primaryContactEmail: form.primaryContactEmail,
      securityContactEmail: form.securityContactEmail,
      privacyContactEmail: form.privacyContactEmail,
      businessOwner: form.businessOwner,
      criticality: form.criticality,
      integrationType: form.integrationType,
      dataClassification: form.dataClassification,
      accessScope: form.accessScope,
      hostingModel: form.hostingModel,
      activeRegions: form.activeRegions,
      servicesProvided: form.servicesProvided,
      countriesOfOperation: form.countriesOfOperation,
      certifications: form.certifications,
      accessUsers: form.primaryContactEmail ? [form.primaryContactEmail] : [],
      notes: form.notes,
      risk: form.risk,
      lifecycleStatus: "pendente-envio",
      status: "Cadastro concluido • Aguardando envio de questionario",
      score: undefined,
      previousScore: 0,
      trend: 0,
      evidences: [],
      internalNotes: [],
      assignedQuestionnaireIds: [],
      questionnaireRuns: [],
      createdAt: new Date().toISOString(),
    };

    upsertSupplier(profile);
    router.push(`/due-diligence-terceiros/fornecedor/${profile.slug}`);
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar no sistema..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                <Link href="/due-diligence-terceiros" className="flex items-center gap-2 hover:text-primary">
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Due Diligence de Terceiros
                </Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="font-semibold text-on-surface">Novo Fornecedor</span>
              </div>

              <SecurePageHeader
                title="Cadastro de Novo Fornecedor"
                subtitle="Registre dados operacionais, contatos, escopo de acesso e contexto regulatorio para deixar o fornecedor pronto para receber questionarios existentes."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98]"
              >
                Salvar fornecedor
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-on-surface shadow-panel">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <p>{feedback}</p>
              <p className="text-xs text-on-surface-variant">Slug sugerido: {generatedSlug}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline text-lg font-bold text-white">Identificacao do fornecedor</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">Etapa 1</span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Razao social</span>
                    <input value={form.legalName} onChange={(event) => updateField("legalName", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Nome de exibicao</span>
                    <input value={form.displayName} onChange={(event) => updateField("displayName", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Dominio principal</span>
                    <input value={form.domain} onChange={(event) => updateField("domain", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" placeholder="empresa.com" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Website</span>
                    <input value={form.website} onChange={(event) => updateField("website", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" placeholder="https://empresa.com" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Tipo de fornecedor</span>
                    <select value={form.supplierType} onChange={(event) => updateField("supplierType", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm">
                      <option>SaaS / Plataforma</option>
                      <option>Infraestrutura Cloud</option>
                      <option>Consultoria / Auditoria</option>
                      <option>Pagamentos / Fintech</option>
                      <option>Parceiro de Dados</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">CNPJ / Tax ID</span>
                    <div className="flex gap-2">
                      <input
                        value={form.taxId}
                        onChange={(event) => updateField("taxId", event.target.value)}
                        onBlur={() => {
                          if (normalizeTaxId(form.taxId).length === 14) {
                            void lookupCnpj();
                          }
                        }}
                        className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => void lookupCnpj()}
                        disabled={lookupLoading}
                        className="shrink-0 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {lookupLoading ? "Buscando..." : "Buscar CNPJ"}
                      </button>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Ao informar um CNPJ valido, o sistema tenta preencher automaticamente os principais dados cadastrais do fornecedor.
                    </p>
                  </label>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline text-lg font-bold text-white">Escopo operacional e risco</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">Etapa 2</span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Segmento</span>
                    <input value={form.segment} onChange={(event) => updateField("segment", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Subsegmento</span>
                    <input value={form.subsegment} onChange={(event) => updateField("subsegment", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Cidade sede</span>
                    <input value={form.headquartersCity} onChange={(event) => updateField("headquartersCity", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Pais sede</span>
                    <input value={form.headquartersCountry} onChange={(event) => updateField("headquartersCountry", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Criticidade do fornecedor</span>
                    <select value={form.criticality} onChange={(event) => updateField("criticality", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm">
                      <option>Alta</option>
                      <option>Media</option>
                      <option>Baixa</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Risco inicial</span>
                    <select value={form.risk} onChange={(event) => updateField("risk", event.target.value as SupplierProfile["risk"])} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm">
                      <option>Baixo Risco</option>
                      <option>Medio Risco</option>
                      <option>Alto Risco</option>
                      <option>Risco Critico</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Modelo de integracao</span>
                    <select value={form.integrationType} onChange={(event) => updateField("integrationType", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm">
                      <option>API</option>
                      <option>SFTP</option>
                      <option>Portal Web</option>
                      <option>Sem integracao tecnica</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Classificacao de dados</span>
                    <select value={form.dataClassification} onChange={(event) => updateField("dataClassification", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm">
                      <option>Dados corporativos e PII</option>
                      <option>Dados financeiros</option>
                      <option>Dados sensiveis regulados</option>
                      <option>Somente metadados operacionais</option>
                    </select>
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Servicos prestados</span>
                    <textarea rows={3} value={form.servicesProvided} onChange={(event) => updateField("servicesProvided", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Escopo de acesso</span>
                    <select value={form.accessScope} onChange={(event) => updateField("accessScope", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm">
                      {accessScopeOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Modelo de hospedagem</span>
                    <input value={form.hostingModel} onChange={(event) => updateField("hostingModel", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Regioes ativas</span>
                    <input value={form.activeRegions} onChange={(event) => updateField("activeRegions", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" placeholder="Brasil, EUA, UE..." />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Paises de operacao</span>
                    <input value={form.countriesOfOperation} onChange={(event) => updateField("countriesOfOperation", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" />
                  </label>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline text-lg font-bold text-white">Contatos e governanca</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">Etapa 3</span>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
                    <div className="mb-4">
                      <h4 className="font-headline text-base font-bold text-white">Contato do fornecedor</h4>
                      <p className="text-sm text-on-surface-variant">
                        Pessoa ou area responsavel por responder o questionario e coordenar evidencias.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Nome do contato</span>
                        <input value={form.primaryContactName} onChange={(event) => updateField("primaryContactName", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Cargo / funcao</span>
                        <input value={form.primaryContactRole} onChange={(event) => updateField("primaryContactRole", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">E-mail principal</span>
                        <input type="email" value={form.primaryContactEmail} onChange={(event) => updateField("primaryContactEmail", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">E-mail de seguranca</span>
                        <input type="email" value={form.securityContactEmail} onChange={(event) => updateField("securityContactEmail", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm" />
                      </label>
                      <label className="space-y-2 md:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">E-mail de privacidade / DPO</span>
                        <input type="email" value={form.privacyContactEmail} onChange={(event) => updateField("privacyContactEmail", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm" />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
                    <div className="mb-4">
                      <h4 className="font-headline text-base font-bold text-white">Responsavel interno</h4>
                      <p className="text-sm text-on-surface-variant">
                        Pessoa da empresa contratante responsavel por este fornecedor e pelo fluxo de avaliacao.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="space-y-2 md:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Responsavel interno</span>
                        <input value={form.businessOwner} onChange={(event) => updateField("businessOwner", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm" />
                      </label>
                    </div>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-6 shadow-panel">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline text-lg font-bold text-white">Certificacoes e observacoes</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">Etapa 4</span>
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                  {certificationOptions.map((certification) => {
                    const selected = form.certifications.includes(certification);

                    return (
                      <button
                        key={certification}
                        onClick={() => toggleCertification(certification)}
                        className={`rounded-full border px-3 py-2 text-xs font-bold transition-colors ${
                          selected
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-primary/20 hover:text-primary"
                        }`}
                      >
                        {certification}
                      </button>
                    );
                  })}
                </div>

                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Notas de cadastro</span>
                  <textarea rows={6} value={form.notes} onChange={(event) => updateField("notes", event.target.value)} className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm" />
                </label>
              </article>
            </div>

            <aside className="space-y-6 xl:col-span-4">
              <article className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-panel">
                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">checklist</span>
                  <h3 className="font-headline text-lg font-bold text-white">Checklist recomendado de cadastro</h3>
                </div>

                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    Identificacao juridica, dominio principal e website oficial do fornecedor
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    Contatos do fornecedor para negocio, seguranca e privacidade
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    Escopo de acesso, modelo de integracao e classificacao de dados tratados
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    Regioes de operacao, modelo de hospedagem e certificacoes declaradas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    Responsavel interno e contexto inicial de risco para priorizacao dos questionarios
                  </li>
                </ul>
              </article>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}
