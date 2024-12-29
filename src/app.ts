import express, { Request, Response } from 'express';
import movieRouter from './routes/moviesRoutes';
import AppError from './utils/appError';
import errorMiddleware from './middlewares/errorMiddleware';

const app = express();

app.use(express.json());
app.use('/movies', movieRouter);

app.get('/', async (req: Request, res: Response) => {
  res.send("hello world");
});

// Handle unknown routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorMiddleware);

export default app;
