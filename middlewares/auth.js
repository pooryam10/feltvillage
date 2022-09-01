
exports.adminAuthentication = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin === true) {
        return next();
    }

    res.redirect("/404");
}

exports.authentication = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/404");
}