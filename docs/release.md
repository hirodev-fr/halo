# Release and rollback

This is a preliminary source-control runbook, not a deployment procedure. Hosting, deployment ownership, domain, protected environments, staging and production resources, and credentials must be selected before deploying.

## Release

1. Verify the intended changes are merged into `dev`, checks pass, and outstanding security alerts have been reviewed.
2. Once staging exists, validate the release there, including migration behavior, a database restore, and rollback before accepting production traffic.
3. Open a release PR from `dev` to `main`. Review its changes and required checks, then merge with a merge commit to preserve branch history.
4. Record the release commit and previous known-good revision. The provider-specific deployment procedure and production verification must be defined before deployment is connected.

## Rollback and hotfixes

Stop or pause a faulty release and follow the eventual provider-specific rollback procedure to restore the last known-good artifact. Assess database compatibility before rollback; restore from a verified backup only using a tested recovery procedure, accounting for data written since the backup. Verify service health and critical sign-in and access paths after recovery. Record the incident and outcome.

For a production hotfix, branch from `main`, PR into `main`, and promptly PR the fix back into `dev`. Never assume a code rollback reverses a database migration.
