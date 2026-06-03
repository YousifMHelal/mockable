# Contracts — Phase 0

Phase 0 exposes **no external interface**: no public API endpoints, no CLI, and no UI
contract beyond a placeholder page. There is therefore nothing to specify here.

The only contract this phase establishes is the **database schema**, which is the data
contract for every later phase. It is documented in full in [../data-model.md](../data-model.md)
and materialized by the first Prisma migration under `prisma/migrations/`.

API/route contracts begin in Phase 2 (authentication) and Phase 3 (create-interview flow).
