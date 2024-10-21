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
    failureRedirect: '/auth/failure',
  }),  (req: any, res) => {
    res.cookie('token', req.user.sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.redirect(process.env.SUCCESS_LOGIN_REDIRECT_URL as string);
  }
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