import session from 'express-session';

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET as string,
  cookie: {
    secure: process.env.NODE_ENV === "auto",
    sameSite: process.env.NODE_ENV === "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
   },
  resave: false,
  saveUninitialized: false,
});
