# Database migrations

The schema lives in `ppt-ai/prisma/schema.prisma`, and every change ships as a
migration in `ppt-ai/prisma/migrations/`. Don't use `prisma db push` against
shared or production databases: it applies changes without a record and can
drop data without asking.

| Command (run in `ppt-ai/`) | When |
|---|---|
| `pnpm db:migrate --name <change>` | Local development: creates and applies a new migration after you edit the schema |
| `pnpm db:migrate:deploy` | Staging/production: applies pending migrations, never creates new ones |
| `pnpm db:migrate:status` | Shows which migrations have been applied |

## One-time baseline for an existing database

Databases created earlier with `prisma db push` already contain every table in
`0_init`. Mark that migration as applied once, then deploy the rest:

```bash
cd ppt-ai
pnpm prisma migrate resolve --applied 0_init
pnpm db:migrate:deploy
```

New, empty databases skip the `resolve` step and only need `pnpm db:migrate:deploy`.

## Deploys

Run `pnpm db:migrate:deploy` before the new app version starts serving traffic,
for example in the host's release or pre-deploy command, using the production
`DATABASE_URL`.

## Migrations

| Migration | Purpose |
|---|---|
| `0_init` | Baseline of the schema as it was when migrations were introduced |
| `20260924000000_add_query_indexes` | Indexes on hot foreign keys (`Account.userId`, `BaseDocument(userId, updatedAt)`, `BaseDocument(isPublic, updatedAt)`, `Presentation.customThemeId`, `FavoriteDocument.documentId`, `GeneratedImage.userId`) and a unique `(userId, documentId)` on `FavoriteDocument`. Duplicate favorites are removed first. |
