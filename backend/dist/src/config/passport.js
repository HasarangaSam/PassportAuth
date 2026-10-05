import passport from "passport";
import { localStrategy } from "../strategies/local.strategy.js";
import { accessTokenStrategy } from "../strategies/access-token.strategy.js";
import { googleStrategy } from "../strategies/google.strategy.js";
passport.use("local", localStrategy);
passport.use("access-token", accessTokenStrategy);
passport.use("google", googleStrategy);
export default passport;
//# sourceMappingURL=passport.js.map