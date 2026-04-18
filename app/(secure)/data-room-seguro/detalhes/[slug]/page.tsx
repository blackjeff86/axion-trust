import Link from "next/link";
import { notFound } from "next/navigation";
import { SecurePageHeader } from "@/components/layout/secure-page-header";
import { SecureTopbar } from "@/components/layout/secure-topbar";

type Detail = {
  title: string;
  summary: string;
  checklist: string[];
};

const details: Record<string, Detail> = {
  "visualizacao-grid": {
    title: "Visualização em Grade",
    summary: "Alterne para cards e navegue por pastas com foco visual.",
    checklist: ["Exibição por miniaturas", "Ordenação por data e tipo", "Filtro rápido por categoria"],
  },
  "visualizacao-lista": {
    title: "Visualização em Lista",
    summary: "Use tabela detalhada com metadados de acesso e tamanho.",
    checklist: ["Colunas configuráveis", "Ordenação por nome e data", "Ações por linha de arquivo"],
  },
  "upload-arquivos": {
    title: "Upload de Arquivos",
    summary: "Envie documentos para o Data Room com trilha de auditoria.",
    checklist: ["Upload com criptografia em repouso", "Associação por pasta e projeto", "Registro automático de envio"],
  },
  "acao-item": {
    title: "Ações de Item",
    summary: "Gerencie cada arquivo com ações administrativas e de segurança.",
    checklist: ["Abrir detalhes do item", "Atualizar permissões", "Ver histórico de acesso"],
  },
  "fechar-painel": {
    title: "Fechar Painel Lateral",
    summary: "Retorne para a lista principal de documentos sem perder contexto.",
    checklist: ["Fechar visualização de metadados", "Manter seleção atual", "Continuar navegação no diretório"],
  },
  "editar-expiracao": {
    title: "Editar Data de Expiração",
    summary: "Defina validade de acesso por documento sensível.",
    checklist: ["Escolha de nova data limite", "Notificação de expiração", "Registro da alteração em auditoria"],
  },
  "ver-relatorio-completo": {
    title: "Relatório Completo de Auditoria",
    summary: "Acesse eventos detalhados de visualização, download e tentativas bloqueadas.",
    checklist: ["Linha do tempo de eventos", "Filtro por usuário e ação", "Exportação para compliance"],
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DataRoomDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = details[slug];

  if (!detail) {
    notFound();
  }

  return (
    <>
      <SecureTopbar placeholder="Buscar escopos ou ações..." />

      <main className="min-h-screen bg-surface p-8">
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/data-room-seguro" className="flex items-center gap-2 hover:text-primary">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Data Room Seguro
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
