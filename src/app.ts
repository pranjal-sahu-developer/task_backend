import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const normalizeOrigin = (url: string): string => url.replace(/\/+$/, '');

const allowedOrigin = normalizeOrigin(
  process.env.CLIENT_URL || 'http://localhost:5173',
);

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(errorHandler);

export default app;
