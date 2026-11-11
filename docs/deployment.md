# Deployment preparation

No provider or deployment pipeline is configured. The checked-in Compose stack is for local development; its default PostgreSQL password, published database port, and local env files are not a production setup. CI builds both application images with disposable values and does not publish them. Base images are pinned by version and multi-platform digest, and `bun install --frozen-lockfile` enforces the lockfile. Review and update the pinned digests regularly for security fixes; promote verified immutable artifacts between environments where configuration permits.

## Environment separation

Create separate staging and production databases, credentials, secrets, domains, and access controls. Keep production credentials out of pull requests, build arguments, logs, and PR jobs. Provision secrets at runtime through the selected platform; rotate them independently per environment. Configure `BETTER_AUTH_URL` and `CORS_ORIGIN` to the exact HTTPS origins and generate a unique high-entropy `BETTER_AUTH_SECRET`. Review `docs/security-review.md` for cookie, proxy, rate-limit, and email decisions.

The web image uses `PUBLIC_SERVER_URL` and `ORIGIN` as **build-time public configuration**; do not put secrets in these arguments. `ORIGIN` is compiled into the SvelteKit build. `SERVER_URL` is the server-side internal API URL at runtime. The server needs its `.env.schema` and runtime environment variables. Verify environment-specific public build settings when deciding how artifacts will be promoted; a single image cannot serve different baked-in origins without changing this implementation.

The local Compose build supplies `apps/web/.env` and `apps/server/.env` as BuildKit secrets, so both files must exist even though runtime `env_file` entries are optional. BuildKit secret mounts keep the input files out of `COPY` layers, but build tools can still write values to outputs: never assume a secret is safe to embed in a client bundle or build artifact. Provide only values required for a build and inspect artifacts before release.

## Migrations and backups

Before a release, review generated Drizzle migrations in `packages/db/src/migrations`, commit them, and test them against a staging database restored from a representative backup. The repository currently has no committed migration baseline; establish and verify one against the actual database before using migration deployment. Do not use `db:push` against staging or production. `bun run db:migrate` runs the migration task, but its production invocation, connectivity, privileges, locking, and execution owner must be validated for the chosen platform. Run migrations once as a controlled release step, with a dedicated least-privilege database role, before starting code that depends on the new schema. Prefer backward-compatible, expand-and-contract changes.

Set up encrypted, access-controlled backups and retention separately for each environment, including point-in-time recovery where supported. Record the backup time, database version, and restore procedure; regularly restore to an isolated target and validate data and application access. Confirm a usable backup and recovery point before migrations. Restoring may discard writes after the recovery point; assess and communicate that impact before doing so.

## Monitoring and verification

Choose owners and configure service availability, error rates, latency, database capacity, backup failures, and security alerts before accepting traffic. Send logs to a protected destination without session cookies, credentials, or sensitive request bodies. The existing `/` endpoint reports process health only; it does not establish database readiness. Define provider-specific readiness checks and alert thresholds.

In staging, verify image identity, configuration, migration status, web and API health, signup/sign-in, protected access, sign-out, and error monitoring. Validate a database restore and a rollback. For production, repeat release smoke checks and monitor errors and latency after rollout; record the deployed artifact and prior known-good artifact.

## Rollback

Pause rollout and route traffic to the previously verified artifact using the provider's documented procedure. Check schema compatibility first: reverting code does not reverse a migration. If recovery requires a restore, follow the tested database recovery procedure and explicitly assess lost writes. Recheck authentication, protected access, service health, and monitoring; record the outcome and follow up with a fix on `dev`. Provider-specific commands, approval rules, OIDC access, and artifact promotion remain to be designed after hosting is selected.
