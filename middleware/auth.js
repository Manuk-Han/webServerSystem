const { User } = require('../models/User');

let auth = (req, res, next) => {
    let token = req.cookies.x_auth;

    User.findByToken(token)
        .then((user) => {
            if (!user) return res.status(401).json({ isAuth: false, error: "Unauthorized" });

            req.token = token;
            req.user = user;
            next();
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
        });
};

module.exports = { auth };
