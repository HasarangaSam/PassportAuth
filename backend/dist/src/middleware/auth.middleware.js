import passport from "../config/passport.js";
export const authenticateAccessToken = (req, res, next) => {
    passport.authenticate("access-token", {
        session: false,
    }, (error, user) => {
        if (error) {
            next(error);
            return;
        }
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        req.user = user;
        next();
    })(req, res, next);
};
//# sourceMappingURL=auth.middleware.js.map