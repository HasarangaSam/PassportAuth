import passport from "passport";
import { localStrategy } from "../strategies/local.strategy.js";
import { accessTokenStrategy } from "../strategies/access-token.strategy.js";
passport.use("local", localStrategy);
passport.use("access-token", accessTokenStrategy);
export default passport;
//# sourceMappingURL=passport.js.map