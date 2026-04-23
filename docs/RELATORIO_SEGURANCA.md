# Relatorio de Seguranca do Projeto AXION Trust

Data: 21/04/2026

Este relatorio registra a analise de seguranca atual da plataforma AXION Trust. O projeto ainda esta em modo desenvolvimento local, portanto nem todos os pontos precisam ser corrigidos imediatamente. A funcao deste documento e orientar prioridades, evitar que riscos de prototipo sejam esquecidos e definir o minimo necessario antes de piloto real, homologacao externa ou producao.

## Escopo analisado

- Aplicacao Next.js App Router.
- Rotas internas em `app/api`.
- Camada Prisma/SQLite criada para persistencia local.
- Fluxos de Data Room, Gestao de Acessos, Builder do Trust Center, Notificacoes, Due Diligence, Configuracoes e API de CNPJ.
- Uso remanescente de `localStorage`.
- Headers HTTP observados no servidor local.
- Dependencias via `npm audit`.

Referencias usadas como criterio:

- OWASP Top 10 para riscos comuns de aplicacoes web.
- OWASP ASVS como guia de verificacao de controles tecnicos.

## Resumo executivo

O AXION Trust esta funcional como MVP local, mas ainda nao esta pronto para operar com dados reais de clientes, documentos sensiveis, solicitacoes de acesso reais ou integracoes corporativas reais.

Pontuacao estimada para producao hoje: 2/10.

Motivo principal: agora existem banco local e APIs mutaveis, mas ainda nao existem autenticacao, autorizacao, isolamento por organizacao, validacao forte de payloads, protecao contra abuso, protecao CSRF, headers de seguranca e auditoria forense real.

Para desenvolvimento local, esse estado e aceitavel desde que dados reais nao sejam usados. Para piloto real, varios pontos abaixo se tornam bloqueadores.

## Pontos positivos atuais

- Uso de Prisma Client reduz risco de SQL injection em comparacao com SQL manual.
- `.env` e banco SQLite local nao devem ser versionados.
- Fluxos persistidos ja passam por APIs internas em vez de chamar Prisma diretamente em Client Components.
- TypeScript esta ativo com `strict: true`.
- Build, typecheck e lint foram verificados apos a criacao da persistencia local.
- API de CNPJ normaliza o CNPJ para 14 digitos antes de consultar a integracao externa.
- O banco local e recriavel por migracao e seed.

## Correcoes ja aplicadas sem atrapalhar desenvolvimento

As correcoes abaixo foram aplicadas porque reduzem risco sem exigir login real, provedor de identidade, novo modelo de usuarios ou mudanca profunda no fluxo de desenvolvimento local:

- Headers basicos de seguranca em `next.config.ts`: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e remocao de `X-Powered-By`.
- CSP permite recursos necessarios ao desenvolvimento local, incluindo HMR por WebSocket e estilos/fontes usados pelo app.
- Validacao manual de JSON, action e id em `/api/access-management/actions`.
- Validacao manual de JSON e status em `/api/data-room/documents/[id]/status`.
- Respostas `400` para payload invalido e `404` para recurso inexistente nas mutations persistidas.
- Mutations de Data Room e Gestao de Acessos passaram a escopar alteracoes por `organizationId`.
- Consulta de CNPJ passou a ter timeout de 5 segundos para evitar chamadas externas penduradas.
- Valores mockados de webhooks, endpoints, SMTP e segredos foram trocados por placeholders demonstrativos com dominio `example.invalid`.

## Achados criticos

### 1. Ausencia de autenticacao real

Status: critico antes de piloto ou producao.

As rotas internas podem ser acessadas sem login, sessao ou usuario autenticado. Isso inclui leitura de Data Room, leitura de acessos e mutations de aprovacao/revogacao.

Arquivos relevantes:

- `app/api/data-room/route.ts`
- `app/api/data-room/documents/[id]/status/route.ts`
- `app/api/access-management/route.ts`
- `app/api/access-management/actions/route.ts`

Risco:

- Qualquer cliente HTTP poderia listar dados sensiveis.
- Qualquer cliente HTTP poderia alterar status de documentos.
- Qualquer cliente HTTP poderia aprovar, negar, restaurar ou revogar acessos.

Recomendacao:

- Implementar autenticacao antes de usar dados reais.
- Usar sessao server-side com cookie `httpOnly`, `Secure` e `SameSite`.
- Avaliar Auth.js/NextAuth, Clerk, Supabase Auth ou OIDC corporativo.

### 2. Ausencia de RBAC e autorizacao por recurso

Status: critico antes de piloto ou producao.

Nao existem papeis, permissoes ou verificacoes por acao. A UI sugere operadores internos, mas o backend ainda nao valida quem pode executar cada operacao.

Risco:

- Usuario sem privilegio poderia executar acao administrativa.
- Um futuro usuario externo poderia acessar recursos internos.
- A seguranca dependeria apenas da interface, o que nao e suficiente.

Recomendacao:

- Criar modelo de usuarios, organizacoes, membros e papeis.
- Papeis iniciais sugeridos: `owner`, `admin`, `security_manager`, `reviewer`, `viewer`, `external_requester`.
- Implementar helpers server-side como `requireUser`, `requireOrg` e `requireRole`.

### 3. Isolamento multiempresa ainda nao e real

Status: critico antes de SaaS, piloto multiempresa ou producao.

O projeto usa uma organizacao demo fixa via `DEFAULT_ORGANIZATION_ID`. Esse padrao e adequado para desenvolvimento local, mas nao para producao.

Risco:

- Dados de uma organizacao podem ser lidos ou alterados fora do seu escopo se novas empresas forem adicionadas sem controles.
- Updates por `id` isolado podem afetar registros de outro tenant.

Recomendacao:

- Derivar `organizationId` da sessao autenticada.
- Toda query sensivel deve filtrar por `organizationId`.
- Updates e deletes devem usar escopo composto, por exemplo `id + organizationId`.
- Evitar qualquer fallback silencioso para organizacao demo em producao.

### 4. APIs mutaveis sem CSRF e sem rate limiting

Status: alto agora, critico quando houver login por cookie.

As mutations atuais aceitam requisicoes sem protecao adicional.

Risco:

- Quando houver autenticacao por cookie, uma pagina externa poderia tentar disparar acoes indevidas se nao houver protecao de origem/CSRF.
- Bots podem abusar endpoints como CNPJ, aprovacoes e publicacoes.

Recomendacao:

- Validar `Origin` e `Referer` para mutations.
- Usar token CSRF ou padrao seguro equivalente.
- Aplicar rate limit por IP, usuario e organizacao.
- Registrar tentativas bloqueadas.

## Achados de alto risco

### 5. Validacao runtime ainda parcial

Status: medio em desenvolvimento, alto antes de piloto.

As principais mutations persistidas ja possuem validacao manual de JSON, `action`, `status` e `id`. Ainda nao existe uma camada padronizada de schemas para todas as APIs e formularios.

Risco:

- Estados invalidos podem ser gravados.
- Erros 500 podem ocorrer em vez de respostas 400/404 controladas.
- A evolucao do produto pode introduzir bypasses de regra de negocio.

Recomendacao:

- Adotar Zod ou biblioteca equivalente nas APIs.
- Validar enums, ids, strings, tamanhos, formatos e campos obrigatorios.
- Padronizar erro `400` para payload invalido e `404` para recurso inexistente.

### 6. Auditoria ainda nao e forense

Status: alto antes de piloto.

Eventos de auditoria sao criados, mas usam ator hardcoded e nao guardam dados suficientes para investigacao.

Risco:

- Nao e possivel provar quem executou uma acao.
- Nao ha contexto de IP, user-agent, sessao, request id, antes/depois ou motivo.
- A trilha nao e append-only nem protegida contra alteracao.

Recomendacao:

- Registrar `actorUserId`, `organizationId`, `eventType`, `entityType`, `entityId`, `before`, `after`, `ip`, `userAgent`, `requestId` e `reason`.
- Evitar update/delete de logs de auditoria.
- Considerar armazenamento append-only ou export para SIEM no futuro.

### 7. Headers de seguranca ainda precisam endurecimento de producao

Status: medio em desenvolvimento, alto antes de homologacao externa.

Headers basicos foram configurados no `next.config.ts`. A CSP atual e intencionalmente mais permissiva em desenvolvimento para nao quebrar HMR, estilos inline usados pelo app e carregamento de fontes.

Risco:

- Maior exposicao a XSS, clickjacking, vazamento de referrer e abuso de APIs do navegador.

Recomendacao:

- Revisar CSP de producao quando o app tiver assets, imagens e integracoes finais.
- Remover gradualmente necessidade de `unsafe-inline`.
- Validar a politica em build de producao.

### 8. Dependencias com vulnerabilidade alta

Status: alto, mas nao bloqueia desenvolvimento local sem exposicao publica.

`npm audit` indicou 3 vulnerabilidades altas ligadas a cadeia `prisma -> @prisma/config -> effect`, com correcao disponivel.

Risco:

- Dependencia vulneravel no toolchain de desenvolvimento.
- Pode se tornar bloqueador em CI/CD ou ambiente exposto.

Recomendacao:

- Atualizar Prisma assim que o ambiente aceitar a versao corrigida.
- Manter `npm audit` no checklist de CI.
- Separar vulnerabilidades de dev dependencies e production dependencies na avaliacao de release.

### 9. Dados mockados devem continuar claramente falsos

Status: baixo apos correcao inicial, alto se segredos reais forem introduzidos.

Valores de webhook, SMTP, endpoints e segredos mockados foram trocados por placeholders demonstrativos. Esse cuidado deve continuar em todo seed e dado estatico.

Risco:

- Alguem pode reutilizar padroes inseguros.
- Pode haver confusao entre mock e segredo real.
- Em repositorios publicos, scanners podem sinalizar falso positivo ou risco reputacional.

Recomendacao:

- Trocar por placeholders explicitamente falsos, como `https://example.invalid/webhook`.
- Nunca seedar tokens reais.
- Para integracoes reais, usar secret manager ou variaveis de ambiente.

## Achados de medio risco

### 10. Uso remanescente de localStorage

Status: medio em desenvolvimento, alto se dados sensiveis forem salvos.

Ainda existem fluxos que usam `localStorage`, principalmente Builder, tema, Due Diligence e partes de configuracoes.

Risco:

- Dados ficam no navegador e podem ser lidos por scripts em caso de XSS.
- Nao ha trilha de auditoria, controle de permissao ou consistencia multiusuario.

Recomendacao:

- Nao salvar tokens, grants, documentos sensiveis ou dados reais em `localStorage`.
- Migrar dados de negocio para Prisma/API.
- Manter `localStorage` apenas para preferencias de UI, como tema.

### 11. SQLite local nao e banco de producao

Status: medio agora, critico antes de producao.

SQLite e adequado para desenvolvimento local, mas nao para produto SaaS com concorrencia, backup, observabilidade e alta disponibilidade.

Recomendacao:

- Migrar producao para Postgres.
- Definir backups, restore testado, migracoes controladas e criptografia em repouso.
- Avaliar Row Level Security se o Postgres for usado em ambiente multi-tenant.

### 12. API de CNPJ ainda sem rate limit

Status: medio.

A rota valida formato, usa fallback e agora possui timeout explicito de 5 segundos. Ainda nao ha rate limit, cache controlado ou observabilidade.

Recomendacao:

- Aplicar rate limit por IP/usuario.
- Definir cache curto quando fizer sentido.
- Logar falhas e volume por origem.

### 13. Uploads futuros precisam desenho seguro

Status: medio agora, critico quando upload real existir.

O Data Room naturalmente exigira upload, download e armazenamento de documentos.

Recomendacao:

- Usar storage privado.
- Gerar URLs assinadas com expiracao.
- Validar extensao, MIME real, tamanho e hash.
- Rodar antivirus ou scanner de malware.
- Bloquear executaveis e formatos perigosos.
- Registrar download, visualizacao e revogacao.

### 14. Tratamento de erro ainda pode melhorar

Status: medio.

Algumas operacoes podem gerar erro 500 quando o recurso nao existe ou quando a acao e invalida.

Recomendacao:

- Padronizar envelope de erro.
- Retornar `400`, `401`, `403`, `404` e `409` conforme o caso.
- Evitar expor stack trace em producao.

## Achados de baixo risco

### 15. Dependencia externa de Material Symbols

Status: baixo.

O layout carrega Material Symbols via stylesheet externo.

Recomendacao:

- Avaliar self-host em ambientes restritos.
- Incluir dominio na CSP se mantido externo.

### 16. Avisos de lint legados

Status: baixo.

Existem warnings conhecidos sobre `<img>`, hooks e fonte no `head`.

Recomendacao:

- Corrigir gradualmente.
- Priorizar seguranca funcional antes de refino visual.

## Checklist minimo antes de piloto real

- Autenticacao real implementada.
- Sessao segura via cookie `httpOnly`, `Secure` e `SameSite`.
- RBAC aplicado nas rotas server-side.
- `organizationId` derivado da sessao, nao de constante demo.
- Todas as queries sensiveis com escopo por organizacao.
- Validacao Zod em todas as APIs.
- Protecao CSRF para mutations.
- Rate limit em login, CNPJ e acoes sensiveis.
- Headers de seguranca configurados.
- CSP de producao revisada e sem permissoes desnecessarias.
- Auditoria com ator real, IP, user-agent e before/after.
- Seeds sem valores que parecam segredo real.
- Nenhum dado real em `localStorage`.
- Plano de backup/restore se houver dados reais.
- `npm audit` sem high/critical relevante para runtime.

## Roadmap recomendado

### Fase 1: Desenvolvimento local seguro

- Manter dados reais fora do ambiente.
- Documentar riscos conhecidos.
- Manter mocks com placeholders claramente falsos.
- Adicionar validacao Zod nas APIs novas.
- Revisar headers sempre que novos assets externos forem adicionados.

## TODOs mantidos para fases futuras

Estes itens continuam pendentes porque exigem decisao de arquitetura, provedor de identidade, modelo de usuarios/permissoes ou ambiente de producao:

- Autenticacao real.
- RBAC/ABAC server-side.
- Modelo de usuarios, membros e organizacoes.
- Remocao do fallback para `DEFAULT_ORGANIZATION_ID` em ambiente real.
- CSRF completo para sessoes por cookie.
- Rate limiting persistente por IP, usuario e organizacao.
- Auditoria forense com ator real, IP, user-agent, request id e before/after.
- Migracao de producao para Postgres.
- Upload/download seguro de documentos.
- Secret manager para integracoes reais.
- Testes automatizados de `401`, `403`, `404`, payload invalido e tentativa cross-tenant.

### Fase 2: Base de identidade

- Criar usuarios, membros, papeis e organizacoes.
- Implementar autenticacao.
- Implementar helpers `requireUser`, `requireOrg` e `requireRole`.
- Trocar ator hardcoded por usuario autenticado.

### Fase 3: Autorizacao e multi-tenant

- Escopar todas as queries por organizacao.
- Proteger updates/deletes por `id + organizationId`.
- Criar testes para `401`, `403`, payload invalido e tentativa cross-tenant.

### Fase 4: Dados reais e operacao

- Migrar producao para Postgres.
- Definir backup, restore, logs e monitoramento.
- Implementar upload/download seguro.
- Integrar SIEM ou exportacao de auditoria.
- Rodar checklist OWASP ASVS antes de homologacao.

## Orientacao para novas alteracoes

Toda nova funcionalidade que criar API, tabela, fluxo de acesso, documento, integracao ou dado sensivel deve responder estas perguntas antes da implementacao:

- Quem pode acessar?
- Quem pode alterar?
- A qual organizacao o dado pertence?
- O payload e validado em runtime?
- A acao e auditada com ator real?
- O dado fica no banco ou no navegador?
- Existe risco de expor segredo, documento ou informacao pessoal?
- Existe rate limit se a rota puder ser abusada?

Enquanto o projeto estiver em modo desenvolvimento local, podemos aceitar atalhos controlados. Antes de qualquer piloto com cliente, esses atalhos precisam ser removidos ou protegidos.
