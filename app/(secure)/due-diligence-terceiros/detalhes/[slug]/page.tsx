import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";

type Detail = {
  title: string;
  summary: string;
  checklist: string[];
};

const details: Record<string, Detail> = {
  "novo-questionario": {
    title: "Novo Questionário de Due Diligence",
    summary: "Inicie uma nova rodada de avaliação para fornecedor ou parceiro estratégico.",
    checklist: [
      "Selecionar modelo de questionário",
      "Definir prazo e responsáveis",
      "Configurar critérios de risco e score",
    ],
  },
  "filtrar-fornecedores": {
    title: "Filtros de Fornecedores",
    summary: "Refine a lista por risco, status, domínio, score e vencimento.",
    checklist: ["Filtro por classificação de risco", "Filtro por status de questionário", "Filtro por prazo e score"],
  },
  "exportar-relatorio": {
    title: "Exportação de Relatório",
    summary: "Gere relatório consolidado para auditoria, comitê e compliance.",
    checklist: ["Exportar em PDF e CSV", "Incluir score por fornecedor", "Incluir histórico de status"],
  },
  "paginacao-anterior": {
    title: "Paginação da Lista",
    summary: "Navegue entre páginas de fornecedores cadastrados.",
    checklist: ["Anterior", "Página atual", "Próxima"],
  },
  "pagina-1": {
    title: "Página 1 da Lista",
    summary: "Visualização da primeira janela de fornecedores.",
    checklist: ["Resultados recentes", "Score e risco visíveis", "Ações rápidas por linha"],
  },
  "pagina-2": {
    title: "Página 2 da Lista",
    summary: "Visualização da segunda janela de fornecedores.",
    checklist: ["Resultados intermediários", "Status atualizados", "Ações por fornecedor"],
  },
  "pagina-3": {
    title: "Página 3 da Lista",
    summary: "Visualização da terceira janela de fornecedores.",
    checklist: ["Resultados adicionais", "Classificação de risco", "Ações rápidas"],
  },
  "paginacao-proxima": {
    title: "Paginação da Lista",
    summary: "Navegue entre páginas de fornecedores cadastrados.",
    checklist: ["Anterior", "Página atual", "Próxima"],
  },
  "ver-insights": {
    title: "Insights de Risco AXION",
    summary: "Consulte recomendações automáticas para mitigação por categoria de fornecedor.",
    checklist: ["Resumo de tendências", "Pontos críticos detectados", "Recomendações acionáveis"],
  },
  "ignorar-recomendacao": {
    title: "Ignorar Recomendação",
    summary: "Registre justificativa e decisão de negócio para não aplicar recomendação.",
    checklist: ["Motivo da exceção", "Aprovação responsável", "Log de auditoria da decisão"],
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DueDiligenceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "novo-questionario") {
    redirect("/due-diligence-terceiros/novo-questionario");
  }

  if (slug === "menu-fornecedor") {
    redirect("/due-diligence-terceiros/fornecedor/stellar-cloud-solutions");
  }

  const detail = details[slug];

  if (!detail) {
    notFound();
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar escopos ou relatórios..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/due-diligence-terceiros" className="flex items-center gap-2 hover:text-primary">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Due Diligence de Terceiros
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-semibold text-on-surface">{detail.title}</span>
          </div>

          <section className="max-w-4xl rounded-2xl border border-slate-100/50 bg-surface-container-lowest p-8 shadow-panel">
            <SecurePageHeader title={detail.title} subtitle={detail.summary} />

            <div className="mt-8">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">Escopo da ação</h2>
              <ul className="space-y-3">
                {detail.checklist.map((item) => (
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
