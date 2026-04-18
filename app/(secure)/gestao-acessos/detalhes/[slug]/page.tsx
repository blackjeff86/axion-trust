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
  "ver-solicitacoes": {
    title: "Fila Completa de Solicitações",
    summary: "Acompanhe todas as requisições pendentes de acesso externo.",
    checklist: ["Ordenação por criticidade", "Filtro por origem da solicitação", "Exportação de fila pendente"],
  },
  "negar-solicitacao": {
    title: "Negar Solicitação de Acesso",
    summary: "Recuse acessos com justificativa e trilha de auditoria.",
    checklist: ["Motivo da recusa", "Notificação ao solicitante", "Registro da decisão"],
  },
  "aprovar-solicitacao": {
    title: "Aprovar Solicitação de Acesso",
    summary: "Conceda acesso ao download do documento privado solicitado pelo terceiro.",
    checklist: ["Confirmação do solicitante", "Expiração padrão de 1 ano com ajuste manual", "Registro da aprovação"],
  },
  "filtro-todos": {
    title: "Filtro: Todos os Acessos",
    summary: "Exibe todos os acessos ativos sem restrição.",
    checklist: ["Lista completa", "Paginação", "Ações por usuário"],
  },
  "filtro-administradores": {
    title: "Filtro legado",
    summary: "Este filtro deve ser substituído por status de expiração ou documento liberado.",
    checklist: ["Revisar uso do filtro", "Adequar ao fluxo Trust", "Remover perfis legados"],
  },
  "filtro-expirando": {
    title: "Filtro: Expirando em Breve",
    summary: "Priorize acessos que vencem em curto prazo.",
    checklist: ["Vencimentos próximos", "Renovação sugerida", "Ações de ajuste"],
  },
  "editar-acesso": {
    title: "Editar Acesso Ativo",
    summary: "Atualize a validade de um acesso já concedido a um documento privado.",
    checklist: ["Revisar solicitante", "Ajustar data de vencimento sobre o padrão de 1 ano", "Salvar com auditoria"],
  },
  "remover-acesso": {
    title: "Remover Acesso",
    summary: "Revogue acessos ativos de forma imediata e rastreável.",
    checklist: ["Confirmação de revogação", "Bloqueio imediato", "Log de revogação"],
  },
  "paginacao-anterior": {
    title: "Paginação de Acessos",
    summary: "Navegue entre páginas da tabela de acessos ativos.",
    checklist: ["Página anterior", "Página atual", "Página seguinte"],
  },
  "paginacao-proxima": {
    title: "Paginação de Acessos",
    summary: "Navegue entre páginas da tabela de acessos ativos.",
    checklist: ["Página anterior", "Página atual", "Página seguinte"],
  },
  "novo-acesso": {
    title: "Novo Acesso Externo",
    summary: "Conceda manualmente acesso de download a um terceiro em caso excepcional.",
    checklist: ["Identificação do usuário", "Documento a ser liberado", "Validade padrão de 1 ano com override manual"],
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function GestaoAcessosDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "ver-solicitacoes" || slug === "remover-acesso" || slug === "aprovar-solicitacao") {
    redirect("/gestao-acessos");
  }

  const detail = details[slug];

  if (!detail) {
    notFound();
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar escopos ou acessos..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/gestao-acessos" className="flex items-center gap-2 hover:text-primary">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Gestão de Acessos
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
