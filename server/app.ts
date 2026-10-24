import express, { Express } from 'express';
import { authRouter } from './routes/auth.ts';
import { usersRouter } from './routes/users.ts';
import { tripsRouter } from './routes/trips.ts';
import { optimizeRouter } from './routes/optimize.ts';
import { companionsRouter } from './routes/companions.ts';

export function createExpressApp(): Express {
  const app = express();
  app.use(express.json());

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api', usersRouter);
  app.use('/api', tripsRouter);
  app.use('/api', optimizeRouter);
  app.use('/api', companionsRouter);

  return app;
}
