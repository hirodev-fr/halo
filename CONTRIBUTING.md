# Contributing

Use the Bun version in the root `packageManager` field and install with `bun install --frozen-lockfile`. Configure local environment files using the committed `.env.schema` files; never commit credentials. Run `bun run check`, `bun run check-types`, and `bun run build` before requesting review.

Create a feature branch from `dev` and open a pull request into `dev`. Address the checks and resolve conversations before merging. Promote `dev` to `main` through a release pull request and use a merge commit to preserve branch history. See [the release runbook](docs/release.md).

For an urgent production fix, branch from `main`, open a PR into `main`, and bring the resulting fix back into `dev` through a PR promptly. Resolve any conflicts and verify the fix on both branches; do not let the branches silently diverge.

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).
