# Plano de Migracao: Mocks para App Real na Vercel

Data: 21/04/2026

Este plano registra a transicao do AXION Trust para uma aplicacao viva em producao na Vercel, usando servicos do proprio ecossistema Vercel para simplificar o MVP.

## Decisoes principais

- Deploy/producao: Vercel.
- Storage de documentos: Vercel Blob.
- Banco em producao: Vercel Postgres ou Postgres provisionado via marketplace/integrado a Vercel.
- ORM: Prisma continua como fonte do schema e camada de acesso a dados.
- Escopo: Core completo, migrando Trust Center, Data Room, Due Diligence e Gestao de Acessos para APIs/Prisma.
- Desenvolvimento local: pode continuar usando SQLite enquanto a producao usa Postgres por `DATABASE_URL`.

## Estado atual

O projeto ja possui uma base parcial de aplicacao viva:

- Next.js App Router rodando localmente.
- Prisma Client configurado.
- SQLite local em `prisma/dev.db`.
- APIs internas para Data Room e Gestao de Acessos.
- API de CNPJ conectada a BrasilAPI com fallback local.
- Seed idempotente carregando baseline demonstrativo.

Dados ja persistidos no banco local:

- Organizacao demo.
- Configuracoes base do Trust Center e tema.
- Configuracoes do Data Room.
- Documentos do Data Room como metadados.
- Solicitacoes de acesso.
- Acessos aprovados.
- Eventos de download.
- Fornecedores seedados.
- Templates de questionario seedados.
- Integracoes seedadas.
- Atividades de auditoria iniciais.

Pontos ainda mockados ou parcialmente locais:

- Builder completo do Trust Center ainda usa `localStorage`.
- Tema customizavel do Trust Center ainda usa `localStorage`.
- Due Diligence ainda usa dados TypeScript e `localStorage` para fornecedores, templates e avaliacoes.
- Configuracoes e Integracoes ainda possuem bastante estado local em componente.
- Dashboard ainda usa dados estaticos.
- Detalhes de notificacoes ainda usam listas estaticas.
- Os documentos do Trust Center/Data Room ainda nao possuem arquivo real armazenado; o banco guarda apenas metadados como nome, status, tamanho textual e visibilidade.

## Arquitetura alvo na Vercel

### Next.js na Vercel

- App Router continua como base da aplicacao.
- API Routes permanecem em `app/api`.
- Variaveis de ambiente ficam no painel da Vercel.
- Ambientes separados: local, preview e production.
- `DATABASE_URL` e token do Vercel Blob devem variar por ambiente.

### Banco

- Desenvolvimento local pode continuar com SQLite.
- Producao deve usar Postgres compativel com Prisma.
- `prisma/schema.prisma` continua como fonte dos modelos.
- Migracoes devem ser versionadas e aplicadas por ambiente.
- Seed deve ser tratado como baseline inicial de demo, nao como fonte runtime da aplicacao.

### Documentos

- Arquivo real vai para Vercel Blob.
- O banco guarda apenas metadados do arquivo.
- Downloads devem passar por endpoint interno antes de entregar a URL do Blob, para registrar auditoria e evento de download.
- URLs sensiveis nao devem ser hardcoded em dados mockados.

Metadados previstos para arquivo:

- Documento relacionado.
- Nome original.
- MIME type.
- Tamanho em bytes.
- Hash SHA-256.
- URL/path do Blob.
- Versao.
- Data de upload.
- Usuario/ator do upload, enquanto nao houver auth real usar ator demo.
- Flag de arquivo atual.

### Dados vivos

- Builder do Trust Center deve ler/gravar por API.
- Data Room deve criar/editar documentos por API.
- Upload/download deve passar por API.
- Due Diligence deve persistir fornecedores, templates, execucoes, respostas, avaliacoes e evidencias no banco.
- Gestao de Acessos ja tem API, mas deve continuar sendo endurecida.
- `localStorage` deve ficar somente para preferencias visuais, como tema claro/escuro da interface interna.

## APIs necessarias

### Trust Center

- `GET /api/trust-center`: retorna configuracoes, secoes, certificacoes, FAQ, tema e metadados de publicacao.
- `PATCH /api/trust-center`: atualiza conteudo publico do builder.
- `PATCH /api/trust-center/theme`: atualiza tema visual publico.
- `POST /api/trust-center/publish`: registra publicacao.

### Data Room e documentos

- `GET /api/data-room`: ja existe e deve continuar retornando workspace real.
- `POST /api/data-room/documents`: cria documento com upload real para Vercel Blob.
- `PATCH /api/data-room/documents/[id]`: atualiza metadados, regras, visibilidade e flags.
- `PATCH /api/data-room/documents/[id]/status`: ja existe e deve continuar validando status.
- `POST /api/data-room/documents/[id]/file`: substitui arquivo atual e cria nova versao.
- `GET /api/data-room/documents/[id]/download`: registra evento e devolve URL/redirect de download.

### Due Diligence

- `GET /api/suppliers`: lista fornecedores reais.
- `POST /api/suppliers`: cria fornecedor real.
- `GET /api/suppliers/[slug]`: detalhe do fornecedor.
- `PATCH /api/suppliers/[slug]`: atualiza fornecedor.
- `GET /api/questionnaire-templates`: lista templates.
- `POST /api/questionnaire-templates`: cria template.
- `PATCH /api/questionnaire-templates/[id]`: atualiza template.
- `POST /api/suppliers/[slug]/questionnaires`: atribui questionario a fornecedor.
- `PATCH /api/suppliers/[slug]/questionnaires/[runId]`: salva progresso, respostas e avaliacao.

### Atividades e notificacoes

- `GET /api/activity`: consolida eventos reais de auditoria, Data Room, acessos, documentos e fornecedores.
- Notificacoes devem consumir `api/activity` em vez de listas estaticas.
- Dashboard deve consumir agregacoes reais do banco quando possivel.

## Modelos/tabelas previstos

Manter modelos atuais e adicionar/normalizar:

- `TrustDocumentFile`: arquivo/versionamento do documento no Vercel Blob.
- `SupplierCertification`: certificacoes do fornecedor.
- `SupplierAccessUser`: usuarios externos do fornecedor.
- `SupplierEvidence`: evidencias anexadas ao fornecedor ou questionario.
- `SupplierInternalNote`: notas internas.
- `QuestionnaireTemplateSection`: secoes do template.
- `QuestionnaireTemplateQuestion`: perguntas do template.
- `QuestionnaireTemplateRule`: regras condicionais.
- `QuestionnaireTemplateEvidenceRequirement`: requisitos de evidencia.
- `SupplierQuestionnaireRun`: execucao do questionario para fornecedor.
- `SupplierQuestionnaireAnswer`: resposta/avaliacao por pergunta.
- `AuditActivity`: ampliar gradualmente com mais contexto, mantendo compatibilidade inicial.

## Fases de implementacao

### Fase 1: Preparar producao Vercel

- Configurar projeto na Vercel.
- Configurar Postgres integrado a Vercel.
- Configurar Vercel Blob.
- Adicionar variaveis de ambiente ao `.env.example`.
- Ajustar Prisma para suportar SQLite local e Postgres em producao sem quebrar o desenvolvimento.
- Documentar comandos de migracao por ambiente.

### Fase 2: Documentos reais

- Adicionar modelo de arquivo/document versioning.
- Implementar upload para Vercel Blob.
- Implementar download via endpoint interno.
- Registrar download em `TrustDownloadEvent`.
- Atualizar Data Room para exibir arquivo real, tamanho real e status real.
- Remover textos de upload mockado.

### Fase 3: Trust Center vivo

- Criar APIs de leitura/escrita do builder.
- Migrar `builder-settings.ts` e `trust-theme.ts` para dados vindos do banco.
- Remover `localStorage` do builder e do tema publico.
- Manter `localStorage` apenas para tema interno claro/escuro.
- Preview deve refletir dados persistidos apos reload.

### Fase 4: Due Diligence viva

- Criar APIs de fornecedores.
- Persistir cadastro de fornecedor no banco.
- Migrar detalhes do fornecedor para banco.
- Criar APIs de templates e execucoes de questionarios.
- Persistir respostas, avaliacoes e evidencias.
- Remover `localStorage` de fornecedores, templates e reviews.

### Fase 5: Atividades, Dashboard e Configuracoes

- Criar `GET /api/activity`.
- Migrar Notificacoes para eventos reais.
- Migrar Dashboard para agregacoes reais.
- Persistir configuracoes principais da organizacao, dominio e integracoes.
- Manter paginas de detalhe estaticas apenas quando forem claramente conteudo explicativo.

### Fase 6: Hardening para piloto

- Adicionar autenticacao real.
- Adicionar RBAC server-side.
- Remover dependencia de `DEFAULT_ORGANIZATION_ID` em ambiente real.
- Adicionar rate limiting.
- Adicionar CSRF quando houver sessao por cookie.
- Melhorar auditoria com ator real, IP, user-agent, request id e before/after.

## Validacao esperada

Ao final da migracao core:

- Criar fornecedor e recarregar a pagina deve manter os dados.
- Criar template e recarregar a pagina deve manter os dados.
- Avaliar questionario e recarregar a pagina deve manter o estado.
- Criar documento deve enviar arquivo para Vercel Blob e metadados para Postgres.
- Baixar documento deve passar por API e registrar evento.
- Builder do Trust Center deve persistir alteracoes apos reload.
- Preview do Trust Center deve refletir dados persistidos.
- Notificacoes devem refletir eventos reais.
- `localStorage` nao deve armazenar dados de negocio.

Comandos de verificacao:

```bash
npm run db:migrate
npm run db:seed
npm run typecheck
npm run lint
npm run build
```

Verificacoes manuais:

- `/api/data-room` retorna documentos reais.
- `/api/access-management` retorna estado real.
- APIs novas retornam `400` para payload invalido.
- APIs novas retornam `404` para recurso inexistente.
- Upload retorna erro claro se Vercel Blob nao estiver configurado.

## Assumptions

- Usaremos Vercel Blob para documentos.
- Usaremos Postgres em producao, integrado a Vercel ou provisionado pelo marketplace da Vercel.
- SQLite local pode continuar durante desenvolvimento.
- Prisma continua como camada de acesso a dados.
- Nenhuma credencial de Vercel Blob ou Postgres deve ser versionada.
- Seed demo continua permitido apenas como carga inicial do banco.
- Autenticacao/RBAC ficam para etapa posterior, mas devem ser tratados como bloqueadores antes de piloto com cliente real.
