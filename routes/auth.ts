import { Router } from 'express';
import passport from 'passport';
import '../config/passport';

const router = Router();

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.SUCCESS_LOGIN_REDIRECT_URL,
    failureRedirect: '/auth/failure',
  }),
);

router.get('/auth/failure', (_, res) => {
  res.status(401).send('Something went wrong');
});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

export default router;