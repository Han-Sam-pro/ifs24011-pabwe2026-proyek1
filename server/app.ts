import express from 'express';
import { apiRouter } from './routes/api';
import { proxyRouter } from './routes/proxy';

export function createExpressApp() {
  const app = express();

  app.use(express.json());

  // Mount backend API routes
  app.use('/api', apiRouter);

  // Mount proxy gateway to Delcom Open API
  app.use('/api-proxy', proxyRouter);

  return app;
}
