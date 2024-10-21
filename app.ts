import express from 'express';
import CORS from 'cors';
import { limiter } from './config/rateLimit';
import { sessionMiddleware } from './middleware/session';
import passport from 'passport';
import './config/passport';

import authRoutes from './routes/auth';
import apiRoutes from './routes/api';

const app = express();

app.get('/', (_, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(limiter);
app.use(CORS());
app.use(express.json());

app.use(authRoutes);
app.use('/api/v1', apiRoutes);

export default app;
