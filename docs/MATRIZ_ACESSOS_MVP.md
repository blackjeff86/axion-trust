# Matriz de Acessos do MVP

Este documento define as atribuicoes praticas dos perfis usados no MVP multi-tenant da AXION Trust.

## Principio central

Cada cliente e um tenant (`Organization`). Os papeis internos (`owner`, `admin`, `editor`, `viewer`) sempre existem dentro de um tenant especifico. O mesmo usuario pode ter papeis diferentes em tenants diferentes.

Usuarios externos (`guest`) nao entram no app interno. Eles possuem identidade global por email, mas so acessam documentos com grant ativo por `organizationId + documentId + userId`.

## Papeis internos

| Papel | Escopo | Uso no MVP |
| --- | --- | --- |
| `owner` | Tenant ativo | Dono maximo da conta cliente. Controla membros, publicacao, acessos externos e configuracoes sensiveis. |
| `admin` | Tenant ativo | Operador de seguranca/compliance. Aprova requests, revoga grants e gerencia operacao do tenant. |
| `editor` | Tenant ativo | Prepara documentos e conteudo. Pode mover documento para rascunho/revisao, mas nao publicar no MVP. |
| `viewer` | Tenant ativo | Consulta interna. Le dados do tenant, mas nao altera documentos, membros ou grants. |

## Guest externo

| Papel | Escopo | Uso no MVP |
| --- | --- | --- |
| `guest` | Documento com grant | Solicita acesso, aceita NDA e baixa/visualiza documento permitido. Nao acessa o app interno. |

## Matriz de permissoes

| Acao | Owner | Admin | Editor | Viewer | Guest |
| --- | --- | --- | --- | --- | --- |
| Ler dados internos do tenant | Sim | Sim | Sim | Sim | Nao |
| Ler Data Room do tenant | Sim | Sim | Sim | Sim | Nao |
| Ler Gestao de Acessos | Sim | Sim | Sim | Sim | Nao |
| Listar membros internos | Sim | Sim | Nao | Nao | Nao |
| Convidar admin/editor/viewer | Sim | Sim | Nao | Nao | Nao |
| Convidar/promover owner | Sim | Nao | Nao | Nao | Nao |
| Aprovar/negar request externo | Sim | Sim | Nao | Nao | Nao |
| Revogar grant externo | Sim | Sim | Nao | Nao | Nao |
| Mover documento para rascunho/revisao | Sim | Sim | Sim | Nao | Nao |
| Publicar documento | Sim | Sim | Nao | Nao | Nao |
| Acessar documento publico publicado | Sim | Sim | Sim | Sim | Sim, anonimo/externo |
| Acessar documento privado | Sim, se tenant | Sim, se tenant | Sim, se tenant | Sim, se tenant | Sim, com grant ativo |
| Baixar documento com NDA | Sim, se tenant | Sim, se tenant | Sim, se tenant | Sim, se tenant | Sim, com NDA aceito |

## Regras implementadas agora

- `GET /api/data-room`: exige membro interno do tenant ativo.
- `GET /api/access-management`: exige membro interno do tenant ativo.
- `GET /api/org-members`: exige `owner` ou `admin`.
- `POST /api/org-members`: exige `owner` ou `admin`; somente `owner` pode convidar outro `owner`.
- `POST /api/access-management/requests/[id]/review`: exige `owner` ou `admin`; request ja revisada retorna `409`.
- `POST /api/access-management/grants/[id]/revoke`: exige `owner` ou `admin`.
- `PATCH /api/data-room/documents/[id]/status`: exige `owner`, `admin` ou `editor`; `editor` nao pode definir `Publicado`.
- `POST /api/auth/active-organization`: troca o tenant ativo apenas para organizacoes nas quais o usuario e membro.
- `GET /api/auth/dev-access-profiles`: retorna apenas metadados de perfis de teste, sem email/senha.

## Seed de testes

O seed possui tres tenants:

- AXION Trust: base enterprise security.
- Orbit Cloud: SaaS/cloud enterprise.
- Helio Bank: fintech regulada com PCI, LGPD e grants curtos.

Perfil especial:

- `qa-multitenant`: `owner` na AXION, `admin` na Orbit e `viewer` na Helio.

Use `/teste-mvp` para alternar tenants e validar endpoints com esse perfil.

## Fora do MVP, mas necessario depois

- `platform_admin`: operador interno AXION para criar/suspender tenants e suporte tecnico.
- `platform_support`: acesso temporario, justificado e auditado, sem acesso irrestrito a documentos sensiveis.
- Permissoes customizadas por tenant.
- UI escondendo/desabilitando acoes de acordo com role, antes de chegar no erro `403`.
- SSO/MFA, SCIM e grupos corporativos.
