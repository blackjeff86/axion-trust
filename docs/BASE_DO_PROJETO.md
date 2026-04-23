# Base Tecnica do Projeto AXION Trust

Este documento e a base de orientacao para trabalhar localmente no projeto AXION Trust. Ele resume a estrutura atual do repositorio, os principais fluxos de produto, onde os dados vivem hoje e quais cuidados devemos ter antes de evoluir a aplicacao.

## Visao geral

AXION Trust e um app web em Next.js App Router voltado para gestao de confianca, seguranca e compliance. A experiencia atual cobre dashboard executivo, Trust Center, Data Room, due diligence de fornecedores, gestao de acessos, notificacoes e configuracoes organizacionais.

O estado atual do projeto e um MVP em transicao para produto funcional com persistencia real:

- Stack principal: Next.js, React, TypeScript e Tailwind CSS.
- Roteamento: App Router, com grupo de rotas seguro em `app/(secure)`.
- UI: componentes React e estilos Tailwind com tokens globais em CSS.
- Persistencia: Prisma Client com SQLite local em `prisma/dev.db`.
- Backend: rotas API internas para Data Room e Gestao de Acessos, alem da rota de consulta de CNPJ.
- Ainda existem modulos parcialmente mockados/localStorage, principalmente Builder completo, Due Diligence e Configuracoes.

## Stack e comandos

As dependencias e scripts principais estao em `package.json`.

- `next`: framework da aplicacao.
- `react` e `react-dom`: base da UI.
- `typescript`: tipagem estatica.
- `tailwindcss`, `postcss` e `autoprefixer`: camada de estilos.
- `eslint` e `eslint-config-next`: lint configurado pelo ecossistema Next.
- `prisma` e `@prisma/client`: ORM e client tipado para banco relacional.
- `tsx`: runner TypeScript usado no seed.

Scripts disponiveis:

- `npm run dev`: inicia o servidor local de desenvolvimento.
- `npm run build`: gera build de producao.
- `npm run start`: executa build de producao.
- `npm run lint`: roda lint.
- `npm run typecheck`: roda `tsc --noEmit`.
- `npm run db:generate`: gera o Prisma Client.
- `npm run db:migrate`: aplica as migracoes SQL locais no SQLite.
- `npm run db:seed`: recria os dados demonstrativos no banco.
- `npm run db:studio`: abre o Prisma Studio.

Configuracoes relevantes:

- `tsconfig.json`: usa `strict: true`, `moduleResolution: "bundler"` e alias `@/*` apontando para a raiz do projeto.
- `next.config.ts`: configuracao Next com headers basicos de seguranca e `poweredByHeader` desabilitado.
- `tailwind.config.ts`: registra tokens de cor baseados em variaveis CSS e familias de fonte.
- `postcss.config.js`: conecta Tailwind e Autoprefixer.
- `eslint.config.mjs`: configuracao flat do ESLint usada por `npm run lint`.
- `.env`: define `DATABASE_URL`. Nao deve ser versionado.
- `.env.example`: exemplo versionado com `DATABASE_URL="file:./dev.db"`.

## Banco de dados local

O projeto agora usa SQLite local com Prisma Client. O banco fisico fica em `prisma/dev.db` e e ignorado pelo Git.

Arquivos principais:

- `prisma/schema.prisma`: schema relacional usado pelo Prisma Client.
- `prisma/migrations/20260421183100_init/migration.sql`: migracao SQL inicial versionada.
- `prisma/seed.ts`: seed idempotente que carrega os dados demo a partir dos mocks existentes.
- `scripts/db-migrate.mjs`: aplica as migracoes SQL no SQLite local usando `node:sqlite`.
- `lib/db.ts`: singleton do Prisma Client.
- `lib/data/constants.ts`: constantes compartilhadas, incluindo a organizacao demo.
- `lib/data/data-room.ts`: camada server-side de dados do Data Room.
- `lib/data/access-management.ts`: camada server-side de dados da Gestao de Acessos.

Comandos para recriar o banco local do zero:

1. Garanta que `.env` exista com:

```env
DATABASE_URL="file:./dev.db"
```

2. Gere o Prisma Client:

```bash
npm run db:generate
```

3. Aplique a migracao local:

```bash
npm run db:migrate
```

4. Popule o banco com dados demo:

```bash
npm run db:seed
```

5. Inicie o app:

```bash
npm run dev
```

Observacao: o Prisma Client e usado normalmente pela aplicacao. A migracao local usa `scripts/db-migrate.mjs` porque o `prisma migrate dev/db push` apresentou erro vazio do schema engine neste ambiente Windows. A migracao SQL continua versionada em `prisma/migrations`.

## Mapa de pastas

### `app`

Contem a aplicacao Next.js usando App Router.

- `app/layout.tsx`: layout raiz, define idioma `pt-BR`, tema inicial `dark`, fontes Google (`Inter` e `Manrope`) e carrega `globals.css`.
- `app/globals.css`: tokens visuais, temas claro/escuro, ajustes globais de superficie, borda, foco, scrollbar e overrides de classes Tailwind.
- `app/(secure)/layout.tsx`: layout das telas internas, com `Sidebar` fixa e area principal deslocada.
- `app/(secure)/page.tsx`: dashboard principal.
- `app/(secure)/*`: modulos funcionais do produto.
- `app/api/data-room/route.ts`: leitura server-side do workspace do Data Room pelo banco.
- `app/api/data-room/documents/[id]/status/route.ts`: mutation de status/publicacao de documento.
- `app/api/access-management/route.ts`: leitura server-side de solicitacoes e acessos.
- `app/api/access-management/actions/route.ts`: mutations de aprovar, negar, restaurar, revogar e resetar acessos.
- `app/api/cnpj/[cnpj]/route.ts`: endpoint server-side para consulta de CNPJ.

### `components`

Componentes compartilhados da interface.

- `components/layout`: casca de layout, sidebar, topbar e headers de pagina.
- `components/theme`: alternancia de tema claro/escuro.
- `components/ui`: primitivas simples como card, metric card e avatar por iniciais.

### `docs`

Documentacao do projeto.

- `GO_TO_MARKET_BOARD_2026-04-30.md`: board de go-to-market e checklist de lancamento/MVP.
- `BASE_DO_PROJETO.md`: este documento-base para orientacao tecnica local.
- `RELATORIO_SEGURANCA.md`: analise de seguranca do estado atual, riscos aceitos em desenvolvimento e bloqueadores antes de piloto/producao.
- `PLANO_MIGRACAO_MOCKS_PARA_APP_REAL.md`: plano futuro para remover mocks runtime, migrar dados de negocio para APIs/Prisma e preparar producao na Vercel com Postgres e Vercel Blob.

### `lib`

Camada server-side compartilhada.

- `lib/db.ts`: instancia global do Prisma Client.
- `lib/data`: consultas e mutations server-side por dominio.

### `prisma`

Schema, migracoes e seed do banco local.

- `schema.prisma`: modelos relacionais.
- `seed.ts`: carga demo idempotente.
- `migrations`: SQL versionado.
- `dev.db`: banco local gerado, ignorado pelo Git.

### `scripts`

Scripts auxiliares do projeto.

- `db-migrate.mjs`: aplica as migracoes SQL locais no SQLite.

### `public`

Assets publicos servidos pelo Next.

- `Group 19.svg` e `Group 36.svg`: assets de marca usados na interface.
- `.gitkeep`: preserva a pasta mesmo sem outros arquivos.

### `src`

Hoje contem apenas `src/index.ts`, um arquivo TypeScript simples/residual que imprime uma mensagem no console. A aplicacao real esta em `app`.

## Rotas e modulos funcionais

### Dashboard

Rota: `/`

Arquivo principal: `app/(secure)/page.tsx`

Resumo:

- Exibe KPIs, atividades recentes, status de auditoria e bloco de revisoes criticas.
- Usa dados estaticos no proprio componente.
- Serve como visao executiva inicial do produto.

### Builder do Trust Center

Rotas principais:

- `/builder-trust-center`
- `/builder-trust-center/detalhes/[slug]`
- `/builder-trust-center/detalhes/modo-preview`

Arquivos relevantes:

- `app/(secure)/builder-trust-center/page.tsx`
- `app/(secure)/builder-trust-center/preview-client.tsx`
- `app/(secure)/builder-trust-center/builder-settings.ts`
- `app/(secure)/builder-trust-center/trust-theme.ts`
- `app/(secure)/builder-trust-center/detalhes/[slug]/page.tsx`

Resumo:

- Permite configurar conteudo publico do Trust Center: nome, descricao, hero, CTAs, secoes, certificacoes, documentos, FAQ e contato de seguranca.
- Possui preview publico renderizado a partir das configuracoes do builder e documentos do Data Room.
- Salva configuracoes e metadados de publicacao em `localStorage`.
- Salva tema publico customizavel em `localStorage`.

Modelos importantes:

- `BuilderSettings`
- `BuilderPublicationMeta`
- `TrustTheme`
- `BuilderSection`
- `BuilderCertification`
- `BuilderDocument`
- `BuilderFaqItem`

### Data Room Seguro

Rotas principais:

- `/data-room-seguro`
- `/data-room-seguro/detalhes/[slug]`

Arquivos relevantes:

- `app/(secure)/data-room-seguro/page.tsx`
- `app/(secure)/data-room-seguro/detalhes/[slug]/page.tsx`
- `app/(secure)/data-room-seguro/data-room-data.ts`

Resumo:

- Gerencia documentos do Trust Center/Data Room, categorias, visibilidade, status de publicacao, regras de aprovacao, NDA e eventos de download.
- Le a lista de documentos, solicitacoes e eventos pelo endpoint `/api/data-room`.
- Altera status/publicacao de documento pelo endpoint `/api/data-room/documents/[id]/status`.
- O Builder e o preview do Trust Center tambem consultam os documentos do Data Room pelo banco.

Modelos importantes:

- `DataRoomWorkspace`
- `TrustDocument`
- `TrustAccessRequest`
- `TrustDownloadEvent`
- `TrustDocumentCategory`
- `TrustDocumentVisibility`
- `TrustDocumentStatus`
- Modelos Prisma relacionados: `DataRoomSettings`, `TrustDocument`, `AccessRequest`, `TrustDownloadEvent`.

### Due Diligence de Terceiros

Rotas principais:

- `/due-diligence-terceiros`
- `/due-diligence-terceiros/detalhes/[slug]`
- `/due-diligence-terceiros/novo-fornecedor`
- `/due-diligence-terceiros/fornecedor/[slug]`
- `/due-diligence-terceiros/fornecedor/[slug]/questionario/[questionnaireId]`
- `/due-diligence-terceiros/novo-questionario`
- `/due-diligence-terceiros/novo-questionario/preview`

Arquivos relevantes:

- `app/(secure)/due-diligence-terceiros/page.tsx`
- `app/(secure)/due-diligence-terceiros/supplier-data.ts`
- `app/(secure)/due-diligence-terceiros/novo-fornecedor/page.tsx`
- `app/(secure)/due-diligence-terceiros/fornecedor/[slug]/page.tsx`
- `app/(secure)/due-diligence-terceiros/fornecedor/[slug]/questionario/[questionnaireId]/page.tsx`
- `app/(secure)/due-diligence-terceiros/novo-questionario/page.tsx`
- `app/(secure)/due-diligence-terceiros/novo-questionario/template-builder-data.ts`
- `app/(secure)/due-diligence-terceiros/novo-questionario/preview/page.tsx`

Resumo:

- Lista fornecedores, KPIs de risco e fluxos de criacao/edicao.
- Permite cadastrar fornecedor novo, incluindo lookup de CNPJ pela rota API.
- Gerencia questionarios atribuidos, envio, status e avaliacao.
- Possui builder de template de questionario com secoes, perguntas, regras e evidencias.
- Salva fornecedores, templates e avaliacoes de questionario em `localStorage`.
- A listagem principal de fornecedores usa tabela `w-full` com colunas previsiveis, paddings compactos e badges `whitespace-nowrap` para evitar quebra visual em riscos como `Baixo Risco`, `Medio Risco`, `Alto Risco` e `Risco Critico` sem depender de barra horizontal.

Modelos importantes:

- `SupplierProfile`
- `SupplierRow`
- `SupplierRisk`
- `SupplierLifecycleStatus`
- `SupplierQuestionnaireRun`
- `QuestionnaireOption`
- `TemplateConfig`
- `Section`
- `Question`
- `Rule`
- `EvidenceRequirement`
- `SavedTemplate`

### Gestao de Acessos

Rotas principais:

- `/gestao-acessos`
- `/gestao-acessos/detalhes/[slug]`

Arquivos relevantes:

- `app/(secure)/gestao-acessos/page.tsx`
- `app/(secure)/gestao-acessos/access-data.ts`
- `app/(secure)/gestao-acessos/detalhes/[slug]/page.tsx`

Resumo:

- Controla solicitacoes pendentes, acessos aprovados e acessos negados.
- Le o estado pelo endpoint `/api/access-management`.
- Acoes de aprovar, negar, restaurar, revogar e resetar sao persistidas no SQLite por `/api/access-management/actions`.
- Detalhes por slug descrevem escopos de acoes como filtros, aprovacao, revogacao e novo acesso.

Modelos importantes:

- `PendingRequest`
- `ApprovedAccess`
- `DeniedAccess`
- `AccessManagementState`
- Modelos Prisma relacionados: `AccessRequest`, `ApprovedAccess`, `AuditActivity`.

### Notificacoes e Central de Atividades

Rotas principais:

- `/notificacoes`
- `/notificacoes/detalhes/[slug]`

Arquivos relevantes:

- `app/(secure)/notificacoes/page.tsx`
- `app/(secure)/notificacoes/detalhes/[slug]/page.tsx`

Resumo:

- Consolida atividades a partir do Data Room e da Gestao de Acessos.
- Possui filtros por categoria e periodo.
- Inclui paginas de detalhe para exportacao, historico, filtros avancados, acessos, documentos, ignorar solicitacao e carregar anteriores.
- A pagina principal ja consome Data Room e Gestao de Acessos via APIs internas, refletindo dados do banco.
- Ainda mistura eventos estaticos de seguranca com dados reais derivados dos modulos persistidos.

Modelos importantes:

- `ActivityItem`
- `DataRoomWorkspace`
- `AccessManagementState`

### Configuracoes e Integracoes

Rotas principais:

- `/configuracoes`
- `/configuracoes?tab=integracoes`
- `/configuracoes/integracoes/[slug]`

Arquivos relevantes:

- `app/(secure)/configuracoes/page.tsx`
- `app/(secure)/configuracoes/integration-detail-data.ts`
- `app/(secure)/configuracoes/integracoes/[slug]/page.tsx`

Resumo:

- Centraliza abas de organizacao, usuarios, dominio, integracoes e politicas do sistema.
- Mantem estado de edicao em memoria do componente.
- Paginas de integracao detalham webhook, email, SIEM/log export e SSO corporativo.

Modelos importantes:

- `IntegrationDetail`
- `IntegrationDetailField`
- `IntegrationToolCard`
- `IntegrationEventCard`
- Tipos locais de membros, DNS, politicas e cards de integracao em `page.tsx`.

### API de CNPJ

Rota: `/api/cnpj/[cnpj]`

Arquivo: `app/api/cnpj/[cnpj]/route.ts`

Resumo:

- Endpoint `GET` que normaliza o CNPJ e exige 14 digitos.
- Consulta `https://brasilapi.com.br/api/cnpj/v1/[cnpj]` com `cache: "no-store"`.
- Mapeia a resposta para um seed de fornecedor usado pelo cadastro.
- Possui fallback local para CNPJ conhecido.
- Retorna `400` para CNPJ invalido e `404` quando nao encontra dados.

Contrato principal:

- Entrada: CNPJ na URL, com ou sem formatacao.
- Saida de sucesso: objeto com dados pre-preenchidos de fornecedor e `source` igual a `brasilapi` ou `fallback`.
- Saida de erro: objeto `{ error: string }`.

## Estado e persistencia

Ha banco relacional local no estado atual. O SQLite armazena os dominios ja migrados e o Prisma Client faz as leituras/mutations server-side.

Persistido hoje no SQLite:

- Organizacao demo.
- Configuracoes base do Trust Center e tema.
- Configuracoes do Data Room.
- Documentos do Data Room.
- Solicitacoes de acesso.
- Acessos aprovados.
- Eventos de download.
- Fornecedores seedados.
- Templates de questionario seedados.
- Integracoes seedadas.
- Atividades de auditoria iniciais.

Fluxos ja conectados ao banco:

- Data Room Seguro: leitura de documentos/solicitacoes/eventos e alteracao de status de documento.
- Builder/Preview do Trust Center: leitura de documentos do Data Room pelo banco.
- Gestao de Acessos: leitura e acoes de aprovar, negar, restaurar, revogar e resetar.
- Notificacoes: leitura dos dados reais de Data Room e Gestao de Acessos.

Ainda usa `localStorage` ou estado local:

- Tema claro/escuro da interface interna.
- Configuracoes editaveis completas do Builder do Trust Center.
- Tema customizavel completo do Trust Center.
- Fluxos de Due Diligence ainda nao migrados para mutations reais.
- Configuracoes/Integracoes ainda mantem varias edicoes em memoria do componente.

Chaves de `localStorage` importantes:

- `axion-theme-mode`: tema claro/escuro da interface interna.
- `axion-trust-builder-settings`: configuracoes do Builder do Trust Center.
- `axion-trust-builder-publication`: metadados de rascunho/publicacao do Builder.
- `axion-trust-builder-theme`: tema visual do Trust Center publico.
- `axion-trust-data-room`: workspace e documentos do Data Room.
- `axion-trust-dd-suppliers`: fornecedores cadastrados/editados.
- `axion-trust-dd-template-builder`: template salvo no builder de questionarios.
- `axion-trust-dd-questionnaire-review`: avaliacoes de respostas por fornecedor/questionario.
- `axion-trust-gestao-acessos`: solicitacoes e acessos aprovados/negados.

Padrao recorrente:

- Arquivos `*-data.ts` definem tipos, dados default, funcoes de leitura, normalizacao e persistencia.
- Paginas client-side carregam dados no `useEffect` para evitar divergencias de hidratacao.
- Alguns textos possuem funcoes de normalizacao para corrigir acentos em dados antigos salvos no navegador.

Padrao novo para persistencia real:

- Client Components chamam APIs internas.
- APIs internas chamam `lib/data/*`.
- `lib/data/*` usa `lib/db.ts` e Prisma Client.
- O seed continua reaproveitando mocks existentes como fonte para o baseline demo.

## Componentes compartilhados

Layout:

- `Sidebar`: menu lateral fixo com navegacao principal.
- `SecureTopbar`: busca, notificacoes, ajuda, toggle de tema e perfil. Deve manter layout elastico com `min-w-0`, controles com dimensoes estaveis e truncamento/ocultacao de textos longos para evitar vazamento visual no canto direito.
- `SecurePageHeader`: cabecalho padrao das telas internas.
- `PageHeader` e `AppShell`: componentes presentes, mas menos usados no fluxo atual.

Tema:

- `ThemeModeToggle`: alterna `data-theme` em `document.documentElement` e salva no navegador.
- `globals.css`: concentra tokens e overrides para temas dark/light.

UI:

- `BaseCard`: card generico.
- `MetricCard`: card de KPI.
- `UserInitialsAvatar`: avatar textual por iniciais.

## Pontos de atencao

- Nao existe autenticacao real, sessao, RBAC ou isolamento multiempresa.
- Ja existe banco local, ORM e camada server-side parcial, mas ainda sem autenticacao/RBAC.
- Parte dos fluxos ainda e simulada no client com `useState` e `localStorage`.
- A unica integracao externa real e a consulta BrasilAPI na rota de CNPJ.
- O app ainda depende de dados mockados embutidos em arquivos TypeScript para seed e para modulos nao migrados.
- Algumas telas grandes concentram muita responsabilidade em um unico arquivo, especialmente configuracoes, builder, detalhes de fornecedor, questionario e notificacoes.
- Existem rotas de detalhe que funcionam como placeholders de escopo ou redirecionam para fluxos principais.
- O projeto usa Material Symbols via stylesheet externo no `head`.
- O arquivo `src/index.ts` nao participa da aplicacao Next atual.

## Seguranca

O projeto ainda esta em modo desenvolvimento local. Nesse contexto, alguns atalhos sao aceitaveis temporariamente, desde que nao sejam usados dados reais de clientes, documentos sensiveis, credenciais reais ou integracoes reais.

O relatorio detalhado esta em `docs/RELATORIO_SEGURANCA.md`.

Resumo do estado atual:

- A aplicacao funciona como MVP local, mas ainda nao esta pronta para piloto real ou producao.
- As APIs internas de Data Room e Gestao de Acessos ainda nao possuem autenticacao, sessao, RBAC, CSRF ou rate limiting.
- O isolamento por organizacao ainda depende da constante demo `DEFAULT_ORGANIZATION_ID`.
- As mutations persistidas possuem validacao runtime manual inicial para acoes, ids, status e JSON invalido.
- A auditoria atual registra eventos, mas ainda nao usa ator autenticado nem dados forenses como IP, user-agent, request id e before/after.
- Headers basicos de seguranca foram configurados no `next.config.ts`, com CSP mais permissiva em desenvolvimento para nao quebrar HMR.
- `npm audit` apontou vulnerabilidades altas na cadeia de desenvolvimento do Prisma/effect, com correcao disponivel.
- Valores mockados de integracoes foram trocados para placeholders claramente falsos e nunca devem ser substituidos por segredos reais no codigo ou seed.

Correcoes seguras ja aplicadas em modo desenvolvimento:

- Headers basicos: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e remocao de `X-Powered-By`.
- Validacao manual de JSON, acoes e ids em `/api/access-management/actions`.
- Validacao manual de JSON e status em `/api/data-room/documents/[id]/status`.
- Escopo por `organizationId` nas mutations persistidas de Data Room e Gestao de Acessos.
- Timeout de 5 segundos na consulta externa da BrasilAPI.
- Placeholders demonstrativos para endpoints, webhooks e segredos mockados de integracoes.

Antes de qualquer piloto com cliente, tratar como bloqueadores:

- Autenticacao real.
- RBAC server-side.
- Escopo por organizacao em todas as queries sensiveis.
- Validacao Zod ou equivalente nas APIs.
- Protecao CSRF para mutations com sessao por cookie.
- Rate limiting em rotas sensiveis.
- CSP de producao mais restritiva e revisada contra todos os assets reais.
- Auditoria com ator real e contexto da requisicao.
- Remocao de dados reais do `localStorage`.
- Plano de banco de producao, backup e restore.

## Orientacao para evolucao

Ao implementar novas funcionalidades, priorize estes cuidados:

- Atualizar este arquivo sempre que uma mudanca alterar arquitetura, comandos, rotas, banco, persistencia, modelos ou fluxo relevante.
- Identificar primeiro se o modulo ja possui arquivo de dados e tipos proprio.
- Reutilizar componentes compartilhados de layout e UI antes de criar novos padroes.
- Preservar o padrao visual baseado em tokens de `globals.css` e `tailwind.config.ts`.
- Em tabelas e listas densas, preferir `w-full` com `table-fixed`, colunas proporcionais, paddings compactos, `min-w-0` em celulas flexiveis, `truncate` para textos longos e `whitespace-nowrap` em badges/status curtos. Evitar barra horizontal em telas internas de dashboard quando for possivel preservar legibilidade ajustando a composicao.
- Evitar misturar novas regras de negocio em componentes muito grandes quando houver chance de extrair para arquivo de dados/helper do modulo.
- Tratar dados remanescentes em `localStorage` como temporarios e priorizar migracao para Prisma/API.
- Usar `docs/PLANO_MIGRACAO_MOCKS_PARA_APP_REAL.md` como guia para a proxima etapa de migracao mock -> app real na Vercel.
- Criar novas tabelas no `schema.prisma`, gerar SQL em `prisma/migrations` e atualizar `prisma/seed.ts` quando o dado precisar existir no baseline demo.
- Expor mutations por APIs internas ou Server Actions; nao chamar Prisma diretamente em Client Components.
- Quando adicionar nova rota, registrar o link no `Sidebar` apenas se ela for uma area principal do produto.
- Para integracoes reais futuras, definir contrato server-side antes de conectar a UI.

## Status da ultima verificacao

Verificacao realizada apos a criacao do banco local:

- `npm run db:migrate`: passou e criou/aplicou a migracao local.
- `npm run db:seed`: passou e carregou o baseline demo.
- `/api/data-room`: respondeu `200` com 6 documentos e 3 solicitacoes.
- `/api/access-management`: respondeu `200` com 1 pendente, 3 aprovados e 1 negado no baseline.
- Mutation de publicar documento: respondeu `200` e atualizou `doc-fin` para `Publicado`.
- Mutation de aprovar acesso: respondeu `200` e alterou contadores para 0 pendentes, 4 aprovados e 1 negado.
- Mutation de reset de acessos: respondeu `200` e voltou para 1 pendente, 3 aprovados e 1 negado.
- Paginas `/data-room-seguro`, `/gestao-acessos` e `/notificacoes`: responderam `200`.
- `npm run typecheck`: passou.
- `npm run build`: passou.
- `npm run lint`: passou com 6 warnings legados, sem erros.

Warnings conhecidos do lint:

- Uso de `<img>` em telas existentes onde ainda nao foi trocado por `next/image`.
- Dependencias de hooks em `gestao-acessos` e `notificacoes`.
- Avisos de fonte no `app/layout.tsx` relacionados ao link manual de Material Symbols no `head`.
