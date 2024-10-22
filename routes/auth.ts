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
  passport.authenticate('google', { session: true }),
  (req, res: any) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  },
);

router.get('/auth/failure', (_, res) => {
  res.status(401).send('Something went wrong');
});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(`${process.env.CLIENT_URL}`);
  });
});

export default router;
