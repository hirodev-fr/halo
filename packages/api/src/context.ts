import type { Session } from "@halo/auth";
import type { Database } from "@halo/db";

export interface Context {
  session: Session | null;
  db: Database;
}
