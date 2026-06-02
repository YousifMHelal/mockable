# Phase 0 Data Model

This is the **data contract** for Phase 0 (there are no API/UI contracts yet). The first
Prisma migration creates exactly the entities, enums, and relations below. Auth.js runtime
behavior is Phase 2; Phase 0 only lands the schema.

## Entity overview

| Entity | Purpose | Owns / Owned by |
|--------|---------|-----------------|
| User | A person using the product; root of all user-scoped data | owns Account, Session, Interview |
| Account | OAuth/provider linkage (Auth.js adapter) | belongs to User |
| Session | DB session record (Auth.js adapter; unused under JWT) | belongs to User |
| VerificationToken | Adapter token table (unused under JWT credentials) | standalone |
| Interview | A configured mock-interview instance | belongs to User; has one Result |
| Result | Scored evaluation of a completed interview | belongs to Interview |

## Enumerations

- `InterviewStatus` — `CREATED`, `IN_PROGRESS`, `COMPLETED`, `FAILED` *(clarified Q3)*
- `InterviewType` — `BEHAVIORAL`, `TECHNICAL`
- `InterviewLanguage` — `ENGLISH`, `ARABIC` *(fixed by constitution VI)*
- `Difficulty` — `JUNIOR`, `MID`, `SENIOR`

## Validation & ownership rules (from spec + constitution)

- `User.email` is unique (identity).
- `User.passwordHash` holds a bcrypt/argon2 hash only — never plaintext (Principle X). Set in
  Phase 2; nullable at the schema level so adapter/OAuth users remain valid.
- Every `Interview` and `Result` is reachable from a `userId` for query scoping (Principle
  XI). `Result` scopes to the user through its `Interview`.
- `Interview.field` is required *only* when `type = TECHNICAL`; enforced in app logic
  (Phase 3), nullable in the schema.
- `Interview.status` defaults to `CREATED`.
- `Result` ↔ `Interview` is one-to-one (`interviewId` unique).
- Deleting a `User` cascades to their `Account`, `Session`, `Interview` (and `Result` via
  interview).

## State transitions — Interview.status

```text
CREATED ──enter room──▶ IN_PROGRESS ──call ends + scored──▶ COMPLETED
                              │
                              └── call dropped / scoring error ──▶ FAILED
```

(Transition *logic* is implemented in Phases 4–5; Phase 0 only defines the enum + default.)

## Reference Prisma schema (target of the first migration)

> Indicative shape for implementation; exact attribute tuning happens in
> `/speckit-implement`. Datasource reflects the dual-URL decision (clarified Q1).

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooled — runtime
  directUrl = env("DIRECT_URL")     // direct — migrations
}

generator client {
  provider = "prisma-client-js"
}

enum InterviewStatus { CREATED IN_PROGRESS COMPLETED FAILED }
enum InterviewType { BEHAVIORAL TECHNICAL }
enum InterviewLanguage { ENGLISH ARABIC }
enum Difficulty { JUNIOR MID SENIOR }

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?   // bcrypt/argon2 only (Principle X); set in Phase 2
  accounts      Account[]
  sessions      Session[]
  interviews    Interview[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}

model Interview {
  id         String            @id @default(cuid())
  userId     String
  type       InterviewType
  field      String?           // required only when type = TECHNICAL (app-enforced)
  language   InterviewLanguage
  difficulty Difficulty
  status     InterviewStatus   @default(CREATED)
  transcript Json?             // captured on call end (Phase 4)
  vapiCallId String?
  result     Result?
  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt

  @@index([userId])
}

model Result {
  id              String    @id @default(cuid())
  interviewId     String    @unique
  overallScore    Int       // 0–100
  dimensionScores Json      // per-dimension scores
  summary         String
  improvements    Json      // 2–3 improvement points
  interview       Interview @relation(fields: [interviewId], references: [id], onDelete: Cascade)
  createdAt       DateTime  @default(now())
}
```
