import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { AccessTokenPayload } from "../types/token.types.js";

export const accessTokenStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_ACCESS_SECRET,
  },
  async (payload: AccessTokenPayload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  },
);
