const user = require("./models/User");
h = {};

h.checkForAdmin = (req, res, next) => {
    if (req.cookies["role"] !== "admin") {
        res.cookie(h.constants.errorMessage, "You dont have this permission !")
            .redirect("/web/dash");
    } else next()
};


h.checkforAuth = (req, res, next) => {
    let cookie = req.cookies["token"];
    if (cookie == null) res.redirect("/");
    else
        user.findOne({"token": cookie})
            .then((user, err) => {
                if (err) h.handleError(res, err);
                else if (user) {
                    res.cookie("id", user._id, true)
                        .cookie("role", user.role, true);
                    next();
                } else res.redirect("/");
            })
};

h.handleError = (res, err) => {
    res.status(406).json({success: false, message: err.message});
};

h.constants = {
    successMessage: "successMessage",
    errorMessage: "errorMessage",
    warningMessage: "warningMessage",
    org: "Org"
};


h.render = (res, page, vars = {}) => {
    let successMessage = res.req.cookies[h.constants.successMessage];
    let errorMessage = res.req.cookies[h.constants.errorMessage];
    let warningMessage = res.req.cookies[h.constants.warningMessage];
    if (errorMessage !== undefined)
        vars[h.constants.errorMessage] = errorMessage;
    if (successMessage !== undefined)
        vars[h.constants.successMessage] = successMessage;
    if (warningMessage !== undefined)
        vars[h.constants.warningMessage] = warningMessage;
    res.clearCookie(h.constants.successMessage);
    res.clearCookie(h.constants.warningMessage);
    res.clearCookie(h.constants.errorMessage);
    res.render(page, vars);
};


module.exports.data = h;