import { redirect } from "@sveltejs/kit";
import type { BetterFetchOption } from "better-auth/client";

import { authClient } from "#lib/auth-client.ts";

import type { PageServerLoad } from "./$types";

export const load = (async ({ fetch, request }) => {
  const fetchOptions = {
    customFetchImpl: fetch,
    headers: { cookie: request.headers.get("cookie") ?? "" },
    signal: request.signal,
    throw: true,
  } satisfies BetterFetchOption;
  const session = await authClient.getSession({ fetchOptions });
  if (!session) {
    redirect(307, "/login");
  }
  return { user: session.user };
}) satisfies PageServerLoad;
