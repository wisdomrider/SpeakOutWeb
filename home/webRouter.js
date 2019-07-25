const app = require("express").Router(),
    user = require("./models/User"),
    md5 = require("md5"),
    issue = require("./models/Issue"),
    problem = require("./models/Problem"),
    utils = require("./Utils").data;


function notMatched(res, message = "Username/Password not matched !") {
    res.cookie(utils.constants.errorMessage, message)
        .redirect("/");
}

app.post("/login", (req, res, next) => {
    user.findOne({$or: [{email: req.body.username}, {phoneNumber: req.body.username}]})
        .then((user, err) => {
            if (err) utils.handleError(res, err);
            else if (user) {
                if (user.password === md5(user.email + req.body.password) && user.role === "admin" || user.role === "Org") {
                    res.cookie("token", user.token, true)
                        .cookie("role", user.role)
                        .cookie("id", user._id)
                        .redirect("/web/dash")
                } else if (user.role !== "admin" && user.role !== "Org") {
                    notMatched(res, "You must be admin to login !");
                } else notMatched(res)
            } else notMatched(res)
        });
});
app.get("/dash", utils.checkforAuth, (req, res, next) => {
    var data = {};
    if (req.cookies["role"] === "admin") {
        problem.find({}, (err, data1) => {
            if (err) handleError(err);
            else {
                data = data1;
                utils.render(res, "dash", {title: "Dashboard", active: "home", role: req.cookies["role"], data: data})
            }
        })
    } else {
        user.findOne({_id: req.cookies["id"]}, (err, user) => {
            const _tag = user.tags.split(",");
            const cond = [];
            for (let i = 0; i < _tag.length; i++) {
                cond.push({tag: _tag[i]});
            }
            problem.find({$or: cond})
                .then((data1, err) => {
                    data = data1;
                    utils.render(res, "dash", {
                        title: "Dashboard",
                        active: "home",
                        role: req.cookies["role"],
                        data: data
                    })

                })

        })
    }
});

function handleError(res, e) {
    console.log(e);
    res.cookie(utils.constants.errorMessage, "Something went wrong !")
        .redirect("/web/dash");
}

app.route("/org/add").get(utils.checkForAdmin, (req, res, next) => {
    req.body.tags = Array(req.body.tags).join(",");
    issue.find({}, (err, data) => {
        if (err) handleError(res, err);
        else {
            utils.render(res, "add_org", {
                title: "Add organization",
                active: "add_org",
                data: data,
                role: req.cookies["role"]
            })
        }
    });
}).post(utils.checkForAdmin, (req, res, next) => {
    req.body.role = utils.constants.org;
    req.body.password = md5(req.body.email + req.body.password);
    req.body.token = md5(Date());
    user.create(req.body)
        .then((user, err) => {
            if (err) handleError(res, err);
            else {
                res.cookie(utils.constants.successMessage, "Organization added successfully !")
                    .redirect("/web/org/list");
            }

        }).catch(e => handleError(res, e));
});
app.get("/org/list", utils.checkForAdmin, (req, res, next) => {
    user.find({role: "Org"}, (err, data) => {
        if (err) handleError(res, err);
        else {
            utils.render(res, "list_org", {data: data, active: "list_org", role: req.cookies["role"]})
        }
    });
});
app.route("/org/edit/:id").get(utils.checkForAdmin, (req, res, next) => {
    user.findOne({_id: req.params.id}, async (err, data) => {
        if (err) handleError(res, err);
        else {
            await issue.find({}, (err, data1) => {
                if (err) handleError(res, err);
                else {
                    utils.render(res, "edit_org", {
                        title: "Edit organization",
                        active: "list_org",
                        data: data,
                        list: data1,
                        role: req.cookies["role"]
                    })
                }
            });
        }
    });
}).post(utils.checkForAdmin, (req, res, next) => {
    req.body.tags = Array(req.body.tags).join(",");
    user.findOneAndUpdate({_id: req.params.id}, req.body, (err, data) => {
        if (err) handleError(res, err);
        else {
            res.cookie(utils.constants.successMessage, "Organization added successfully !")
                .redirect("/web/org/list");
        }
    })
});

app.route("/prob/edit/:id").get(utils.checkForAdmin, (req, res, next) => {
    issue.findOne({_id: req.params.id}, (err, data) => {
        if (err) handleError(res, err);
        else {
            utils.render(res, "edit_prob", {data: data, active: "add", role: req.cookies["role"]})
        }
    });
}).post(utils.checkForAdmin, (req, res, next) => {
    issue.findOneAndUpdate({_id: req.params.id}, req.body, (err, data) => {
        if (err) handleError(res, err);
        else {
            res.cookie(utils.constants.successMessage, "Problem edited successfully !")
                .redirect("/web/prob/list");
        }
    })
});

app.route("/prob/add").get(utils.checkForAdmin, (req, res, next) => {
    utils.render(res, "add_prob", {title: "Add Problem", active: "add", role: req.cookies["role"]})
}).post(utils.checkForAdmin, (req, res, next) => {
    req.body.createdBy = req.cookies["id"];
    issue.create(req.body)
        .then((data, err) => {
            if (err) handleError(res, err);
            else {
                res.cookie(utils.constants.successMessage, "Problem added successfully !")
                    .redirect("/web/prob/list");
            }
        })
});
app.get("/prob/list", utils.checkForAdmin, (req, res, next) => {
    issue.find({}, async (err, data) => {
        if (err) handleError(res, err);
        else {
            for (let i = 0; i < data.length; i++) {
                await user.findOne({_id: data[i].createdBy}, (err, data1) => {
                    let x = data[i];
                    x.createdBy = data1.name;
                });
            }

            utils.render(res, "list_prob", {data: data, active: "list", role: req.cookies["role"]})
        }
    })
});

app.get("/prob/delete/:id", utils.checkForAdmin, (req, res, next) => {
    issue.remove({_id: req.params.id}, (err) => {
        res.cookie(utils.constants.successMessage, "Problem deleted successfully !")
            .redirect("/web/prob/list");
    });
});
app.get("/org/delete/:id", utils.checkForAdmin, (req, res, next) => {
    user.remove({_id: req.params.id}, (err) => {
        res.cookie(utils.constants.successMessage, "Organization deleted successfully !")
            .redirect("/web/org/list");
    });
});

app.get("/logout", (req, res, next) => {
    res.clearCookie("token")
        .redirect("/");
});
app.post("/update", (req, res, next) => {
    user.findOneAndUpdate({_id: req.cookies["id"]}, req.body, (err, data) => {
        if (err) res.json({success: false});
        else {
            res.cookie("isUpdatedd", "yes").json({success: true})
        }
    });
});
app.get("/mark/:id", (req, res, next) => {
    problem.findOneAndUpdate({_id: req.params.id}, {isSeen: true}, (err, next) => {
        res.cookie(utils.constants.successMessage, "Problem mark as read !")
            .redirect("/web/dash");
    });
});
app.get("/approve/:id", (req, res, next) => {
    problem.findOneAndUpdate({_id: req.params.id}, {isApproved: true}, (err, next) => {
        res.cookie(utils.constants.successMessage, "Problem approved for user to read !")
            .redirect("/web/dash");
    });
});

module.exports = app;