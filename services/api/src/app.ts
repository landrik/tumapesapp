import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { error } from './utils/response';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// GET /health
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/v1', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  error(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND');
});

// Centralized error handler (catches thrown/next(err) errors, including
// Multer errors and Mongoose CastErrors from malformed ObjectId params)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err.name === 'CastError') {
    return error(res, 'Invalid id format', 400, 'INVALID_ID');
  }

  if (err.name === 'MulterError' || err.message?.includes('Only JPEG')) {
    return error(res, err.message, 400, 'UPLOAD_ERROR');
  }

  return error(res, 'Internal server error', 500, 'INTERNAL_ERROR');
});

export default app;
