# Security review and deployment decisions

The auth server uses Better Auth's origin and CSRF checks, with exact configured trusted origins. Integration tests cover registration, sign-in, sign-out, session revocation, protected RPC access, validation, CORS, and origin rejection. Better Auth's origin and CSRF checks are explicitly enabled in test mode as well as production. Authentication cookies are HttpOnly, Secure, and SameSite=None to support cross-site deployments; browsers require HTTPS for Secure cookies (localhost behavior varies).

Before production, decide the web and API origins and verify cookie behavior on the actual domains and browsers. Prefer same-site origins and reassess SameSite=None if cross-site cookies are unnecessary. Use HTTPS, a unique high-entropy secret, and production-only trusted origins. Validate server-side authorization for every new protected operation; CORS is not authorization. Better Auth validates auth inputs, and new API procedures must validate their own input and avoid leaking internal error details.

Better Auth enables rate limiting in production by default, using in-memory storage unless configured otherwise. This is per process and is not sufficient as a shared limit for multiple replicas or serverless deployments. Choose a shared rate-limit store or trusted edge protection and configure trusted proxy/IP handling only after the hosting topology is known. Decide on email verification, password reset delivery, abuse monitoring, and session policies before allowing real users. There is no outbound email integration yet.

GitHub CodeQL can use the repository's default setup, or an advanced workflow, but not both concurrently. Confirm which setup is active and review the initial scan. Dependency review is enabled for pull requests when the repository and dependency graph support it.

## Running integration tests

Tests require an isolated PostgreSQL database with the current schema and non-production configuration. They create test accounts; never point them or `drizzle-kit push` at production or a database containing data you need. Set the environment variables required by `apps/server/.env.schema`, set `NODE_ENV=test` and `DATABASE_URL` to the isolated database, initialize it with `bun run --cwd packages/db db:push`, then run `bun run test`. CI provisions an ephemeral PostgreSQL service for this purpose.
