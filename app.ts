import express from 'express';
import CORS from 'cors';
import { limiter } from './config/rateLimit';
import { sessionMiddleware } from './middleware/session';
import passport from 'passport';
import './config/passport';

import authRoutes from './routes/auth';
import apiRoutes from './routes/api';
import userRoutes from './routes/user'

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(
  (origin) => origin,
);
const corsOptions = {
  origin: 'https://script-box.vercel.app',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(CORS(corsOptions));
app.get('/', (_, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(limiter);
app.use(express.json());
app.use(express.static("public"));

app.use(authRoutes);
app.use('/api/v1', apiRoutes);
app.use('/user', userRoutes)

export default app;
