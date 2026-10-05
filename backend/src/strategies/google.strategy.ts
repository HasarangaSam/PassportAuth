import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export const googleStrategy = new GoogleStrategy(
  {
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK_URL,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return done(new Error("Google account does not have an email address"));
      }

      const providerAccountId = profile.id;

      const existingOAuthAccount = await prisma.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId,
          },
        },
        include: {
          user: true,
        },
      });

      if (existingOAuthAccount) {
        return done(null, existingOAuthAccount.user);
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (existingUser) {
        return done(
          new Error(
            "An account with this email already exists. Please sign in with your existing account.",
          ),
        );
      }

      const firstName = profile.name?.givenName?.trim() || "Google";

      const lastName = profile.name?.familyName?.trim() || "User";

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstName,
          lastName,
          emailVerified: true,
        },
      });

      const oauthAccount = await prisma.oAuthAccount.create({
        data: {
          provider: "google",
          providerAccountId,
          userId: user.id,
        },
        include: {
          user: true,
        },
      });

      return done(null, oauthAccount.user);
    } catch (error) {
      return done(error, false);
    }
  },
);
