import { Strategy as LocalStrategy } from "passport-local";
import { authenticateUser } from "../services/auth.service.js";
export const localStrategy = new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
}, async (email, password, done) => {
    try {
        const user = await authenticateUser(email, password);
        if (!user) {
            return done(null, false, {
                message: "Invalid email or password",
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
});
//# sourceMappingURL=local.strategy.js.map