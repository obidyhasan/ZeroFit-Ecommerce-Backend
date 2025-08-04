/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { User } from "../modules/user/user.model";
import { Role, UserStatus } from "../modules/user/user.interface";
import { envVars } from "./env";
import bcryptjs from "bcryptjs";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExits = await User.findOne({ email });
        if (!isUserExits) return done("User dose not exits!");

        if (isUserExits.isDeleted) return done("User is deleted!");

        if (!isUserExits.isVerified) return done("User is not verified!");

        if (
          isUserExits.status === UserStatus.INACTIVE ||
          isUserExits.status === UserStatus.BLOCKED
        ) {
          return done(`User is ${isUserExits.status}`);
        }

        const isGoogleAuthenticated = isUserExits.auths.some(
          (providerObject) => providerObject.provider === "google"
        );

        if (isGoogleAuthenticated && !isUserExits.password) {
          return done(null, false, {
            message:
              "You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your gmail and then you can login with email and password",
          });
        }

        const isPasswordMatched = await bcryptjs.compare(
          password as string,
          isUserExits.password as string
        );

        if (!isPasswordMatched)
          return done(null, false, { message: "Password does not match" });

        return done(null, isUserExits);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(null, false, { message: "No email found!" });

        let isUserExist = await User.findOne({ email });

        if (isUserExist && isUserExist.isDeleted) {
          return done("User is deleted!");
        }

        if (isUserExist && !isUserExist.isVerified) {
          return done("User is not verified!");
        }

        if (
          isUserExist &&
          (isUserExist.status === UserStatus.INACTIVE ||
            isUserExist.status === UserStatus.BLOCKED)
        ) {
          return done(`User is ${isUserExist.status}`);
        }

        if (!isUserExist) {
          isUserExist = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: Role.USER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }

        return done(null, isUserExist);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

// frontend localhost:5173/login?redirect=/booking -> localhost:5000/api/v1/auth/google?redirect=/booking -> passport -> Google OAuth Consent -> gmail login -> successful -> callback url localhost:5000/api/v1/auth/google/callback -> db store -> token

// Bridge == Google -> user db store -> token
//Custom -> email , password, role : USER, name... -> registration -> DB -> 1 User create
//Google -> req -> google -> successful : Jwt Token : Role , email -> DB - Store -> token - api access

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.log(err);
    done(err);
  }
});
