import passport, { type Profile } from 'passport';
import { findUserById, upsertUser } from '../utils/db';
import {
  Strategy as GoogleStrategy,
  type VerifyCallback,
} from 'passport-google-oauth20';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.callbackURL,
      passReqToCallback: true,
    },
    async function (
      request,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email associated with Google account'));
        }

        const newUser = {
          googleId: profile.id,
          name: profile.displayName,
          email: email,
        };

        const user = await upsertUser(newUser);
        done(null, user.data);
      } catch (error) {
        console.error('Error upserting user:', error);
        done(error);
      }
    },
  ),
);

passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await findUserById(parseInt(id));
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
