# Revisao Geral do MVP

Revisao realizada para validar se o MVP multi-tenant sobe de forma coerente para testes locais.

## O que foi validado

- Autenticacao por Auth.js com perfis rapidos de desenvolvimento via `profileId`.
- Isolamento por tenant ativo via cookie `axion-active-organization`.
- Tres tenants no seed: AXION Trust, Orbit Cloud e Helio Bank.
- Perfil QA multi-tenant com papeis diferentes por organizacao.
- Endpoints internos principais:
  - `/api/data-room`
  - `/api/access-management`
  - `/api/org-members`
  - `/api/auth/active-organization`
  - `/api/auth/dev-access-profiles`
- Regras de negocio de publicacao, convite de owner e revisao de request.

## Correcoes aplicadas

- Criada matriz central de permissoes em `lib/access-control.ts`.
- Criada rota `/api/auth/active-organization` para trocar tenant ativo com validacao de membership.
- Criada pagina `/teste-mvp` para validar tenant ativo, permissoes e endpoints reais.
- Adicionado terceiro tenant no seed: Helio Bank.
- Adicionado perfil `qa-multitenant` no seed e nos perfis rapidos.
- Bloqueado `editor` de publicar documento diretamente.
- Bloqueado `admin` de convidar/promover outro `owner`.
- Bloqueada re-revisao de request ja aprovada/negada com resposta `409`.

## Validacoes executadas

### Seed e build

- `npm run db:seed`: passou.
- `npm run typecheck`: passou.
- `npm run build`: passou.

### Perfis rapidos

`GET /api/auth/dev-access-profiles`:

- `enabled`: `true`.
- Total de perfis: 8.
- IDs: `axion-owner`, `axion-admin`, `axion-editor`, `axion-viewer`, `orbit-admin`, `helio-owner`, `qa-multitenant`, `guest-external`.
- Nao retorna email.
- Nao retorna senha.

### QA multi-tenant

Perfil usado: `qa-multitenant`.

| Tenant ativo | Papel | `/teste-mvp` | `/api/data-room` | `/api/access-management` | `/api/org-members` |
| --- | --- | ---: | ---: | ---: | ---: |
| AXION Trust | `owner` | 200 | 200 | 200 | 200 |
| Orbit Cloud | `admin` | 200 | 200 | 200 | 200 |
| Helio Bank | `viewer` | 200 | 200 | 200 | 403 |

### Regras criticas

| Regra | Resultado |
| --- | ---: |
| `editor` tentando publicar documento | 403 |
| `admin` tentando convidar `owner` | 403 |
| `admin` tentando revisar request ja aprovada | 409 |

## Pontos de atencao encontrados

- A UI ainda nao esconde todas as acoes proibidas por role; em alguns fluxos, o usuario pode clicar e receber `403`.
- O Builder do Trust Center ainda salva configuracoes completas em `localStorage`.
- Due Diligence ainda possui fluxos relevantes baseados em `localStorage`/estado client-side.
- Configuracoes e Integracoes ainda misturam estado local e dados demonstrativos.
- Dashboard ainda e majoritariamente estatico.
- Ainda nao existe `platform_admin`/`platform_support` para operacao AXION sobre multiplos clientes.
- Ainda nao ha Zod ou camada equivalente de validacao padronizada nas APIs.
- Ainda nao ha rate limiting, MFA/SSO, CSRF forte para mutations, nem auditoria com IP/user-agent/request-id.
- Storage binario real de documentos ainda nao foi ligado ao Vercel Blob.

## Veredito

O MVP multi-tenant esta coerente para testes locais de acesso interno, segregacao por tenant e grants externos por documento.

Para um piloto real com cliente, os bloqueadores principais continuam sendo:

- Remover dados de negocio remanescentes do `localStorage`.
- Implementar storage real de documentos.
- Completar RBAC visual na UI.
- Introduzir `platform_admin` com acesso auditado.
- Fortalecer validacao, auditoria e seguranca das mutations.
