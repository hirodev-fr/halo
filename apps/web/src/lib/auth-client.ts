import { createAuthClient } from "better-auth/svelte";

import { ENV } from "../env.generated";

const getServerUrl = (url: string) => {
  const processEnv = typeof process === "undefined" ? undefined : process.env;
  if (typeof window === "undefined" && processEnv?.SERVER_URL) {
    return processEnv.SERVER_URL.endsWith("/")
      ? processEnv.SERVER_URL.slice(0, -1)
      : processEnv.SERVER_URL;
  }

  return url.endsWith("/") ? url.slice(0, -1) : url;
};

export const authClient = createAuthClient({
  baseURL: new URL("/api/auth", getServerUrl(ENV.PUBLIC_SERVER_URL)).toString(),
});
