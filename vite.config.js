import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);
const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.dirname(currentFile);
const apiDir = path.resolve(rootDir, 'api');

function addResponseHelpers(res) {
  if (!res.status) {
    res.status = (statusCode) => {
      res.statusCode = statusCode;
      return res;
    };
  }

  if (!res.json) {
    res.json = (payload) => {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json');
      }

      res.end(JSON.stringify(payload));
      return res;
    };
  }

  return res;
}

function findApiHandler(pathname) {
  const relativePath = pathname.replace(/^\/api\/?/, '');
  const segments = relativePath.split('/').filter(Boolean);

  const exactFile = path.join(apiDir, ...segments) + '.js';
  if (fs.existsSync(exactFile)) {
    return { filePath: exactFile, params: {} };
  }

  const indexFile = path.join(apiDir, ...segments, 'index.js');
  if (fs.existsSync(indexFile)) {
    return { filePath: indexFile, params: {} };
  }

  if (segments.length) {
    const dynamicFile = path.join(apiDir, ...segments.slice(0, -1), '[id].js');
    if (fs.existsSync(dynamicFile)) {
      return {
        filePath: dynamicFile,
        params: { id: segments[segments.length - 1] },
      };
    }
  }

  return null;
}

async function readRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return '';
  }

  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function devApiPlugin() {
  return {
    name: 'cloudtask-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          next();
          return;
        }

        const url = new URL(req.url, 'http://localhost');
        const match = findApiHandler(url.pathname);

        if (!match) {
          next();
          return;
        }

        try {
          req.query = {
            ...Object.fromEntries(url.searchParams.entries()),
            ...match.params,
          };
          req.body = await readRequestBody(req);

          addResponseHelpers(res);

          delete require.cache[require.resolve(match.filePath)];
          const handlerModule = require(match.filePath);
          const handler = handlerModule.default || handlerModule;

          await handler(req, res);

          if (!res.writableEnded) {
            res.end();
          }
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: false,
              error: {
                code: 'dev_api_error',
                message: error.message || 'Local API execution failed.',
              },
            }),
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
});
