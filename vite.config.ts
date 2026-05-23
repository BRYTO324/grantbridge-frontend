import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { ClientRequest, IncomingMessage } from "http";

export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()];
  try {
    // @ts-expect-error
    const m = await import("./.vite-source-tags.js");
    plugins.push(m.sourceTags());
  } catch {
    // Optional local-only file is absent in normal production builds.
  }
  return {
    plugins,
    server: {
      proxy: {
        "/api/v1": {
          target: "https://grantbrigde.onrender.com",
          changeOrigin: true,
          secure: true,
          configure: (proxy: any) => {
            proxy.on(
              "proxyReq",
              (proxyReq: ClientRequest, req: IncomingMessage) => {
                if (req.method) proxyReq.method = req.method;
              },
            );
          },
        },
      },
    },
  };
});
