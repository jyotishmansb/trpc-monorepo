import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    url: (env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001") + "/trpc",
    headers() {
      // Attach auth token from localStorage if available
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("chaiToken");
        if (token) return { Authorization: `Bearer ${token}` };
      }
      return {};
    },
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
