import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.COZE_PROJECT_ENV !== 'PROD';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '5000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

void (async () => {
  try {
    if (process.env.COZE_SKIP_DB_PUSH !== '1') {
      const { ensureDatabaseSchema } = await import('./storage/database/ensure-schema');
      await ensureDatabaseSchema();
    }

    await app.prepare();

    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url!, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal server error');
      }
    });
    server.once('error', err => {
      console.error(err);
      process.exit(1);
    });
    server.listen(port, () => {
      console.log(
        `> Server listening at http://${hostname}:${port} as ${
          dev ? 'development' : process.env.COZE_PROJECT_ENV
        }`,
      );
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
})();
