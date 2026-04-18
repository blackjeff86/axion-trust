import Link from "next/link";
import { notFound } from "next/navigation";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";
import { BuilderTrustPreviewPage } from "../../preview-client";

type Detail = {
  title: string;
  summary: string;
  deliverables: string[];
};

const details: Record<string, Detail> = {
  "salvar-alteracoes": {
    title: "Publicação de Alterações",
    summary: "Centraliza governança de publicação e histórico de versões do Builder.",
    deliverables: [
      "Confirmação de versão publicada",
      "Registro de auditoria com usuário e horário",
      "Resumo das mudanças aplicadas",
    ],
  },
  "adicionar-certificacao": {
    title: "Adicionar Certificação",
    summary: "Inclua novos selos e evidências para reforçar a postura de confiança.",
    deliverables: [
      "Cadastro de certificação com validade",
      "Upload de comprovantes e anexos",
      "Definição de exposição pública no portal",
    ],
  },
  "documento-configuracao": {
    title: "Configuração de Documento",
    summary: "Defina metadados, visibilidade e governança de cada documento publicado.",
    deliverables: [
      "Atualização de título, categoria e data",
      "Ajuste de permissão público/privado",
      "Histórico de alterações do item",
    ],
  },
  "carregar-documento": {
    title: "Carregar Novo Documento",
    summary: "Adicione políticas e evidências com controle de versão e trilha de auditoria.",
    deliverables: [
      "Upload validado (PDF, DOCX, XLSX)",
      "Versionamento automático do documento",
      "Publicação imediata ou agendada",
    ],
  },
  "editar-faq": {
    title: "Editar Pergunta do FAQ",
    summary: "Mantenha respostas de confiança sempre atualizadas para clientes e auditorias.",
    deliverables: [
      "Edição de pergunta e resposta",
      "Controle de ordem e destaque",
      "Registro de revisão por responsável",
    ],
  },
  "adicionar-faq": {
    title: "Adicionar Pergunta Frequente",
    summary: "Expanda a base de conhecimento pública do Trust Center.",
    deliverables: [
      "Criação de nova entrada no FAQ",
      "Tagueamento por tema de segurança/compliance",
      "Definição de exibição pública",
    ],
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BuilderActionDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "modo-preview") {
    return <BuilderTrustPreviewPage />;
  }

  const detail = details[slug];

  if (!detail) {
    notFound();
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar entregáveis ou ações..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/builder-trust-center" className="flex items-center gap-2 hover:text-primary">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Builder do Trust Center
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-semibold text-on-surface">{detail.title}</span>
          </div>

          <section className="max-w-4xl rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
            <SecurePageHeader title={detail.title} subtitle={detail.summary} />

            <div className="mt-8">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">Entregáveis desta ação</h2>
              <ul className="space-y-3">
                {detail.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-100/50 bg-surface-container-low p-4 text-sm shadow-panel">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
