import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * 🧪 Local "mini-Vercel"
 * ---------------------------------------------------------------
 * On Vercel, every file in /api is deployed as a Serverless Function
 * that exports Web-standard handlers:  export async function POST(req: Request)
 *
 * This tiny plugin lets `npm run dev` run those SAME files locally,
 * so you don't need `vercel dev` (or Python / FastAPI!) to hack.
 *   /api/video/start   -> api/video/start.ts
 *   /api/video/status  -> api/video/status.ts
 */
function vercelApiDev(): Plugin {
  return {
    name: 'halloween-vercel-api-dev',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        const url = new URL(req.url, 'http://localhost');
        const modulePath = `/api${url.pathname.replace(/^\/api/, '')}.ts`;
        try {
          const mod = await server.ssrLoadModule(modulePath);
          const handler = mod[req.method ?? 'GET'];
          if (typeof handler !== 'function') {
            res.statusCode = 405;
            return res.end(`Method ${req.method} not allowed`);
          }
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const body = chunks.length ? Buffer.concat(chunks) : undefined;
          const request = new Request(url, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
          });
          const response: Response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          server.ssrFixStacktrace(err as Error);
          console.error('[api]', err);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: (err as Error).message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Make server-only secrets (GEMINI_API_KEY, FIREBASE_SERVICE_ACCOUNT_BASE64, …)
  // from .env.local available to the /api handlers during local dev.
  const env = loadEnv(mode, process.cwd(), '');
  for (const [k, v] of Object.entries(env)) if (!(k in process.env)) process.env[k] = v;

  return {
    plugins: [react(), vercelApiDev()],
    server: { port: 5173 },
  };
});
