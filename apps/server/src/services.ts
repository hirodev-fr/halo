import { createAuth } from "@halo/auth";
import { createDb } from "@halo/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
