const app = require("express").Router(),
    user = require("./models/User"),
    issue = require("./models/Issue"),
    md5 = require("md5"),
    problem = require("./models/Problem"),
    utils = require("./Utils").data;


app.post("/register", (req, res, next) => {
    if (req.body.password !== undefined && req.body.email !== undefined)
        req.body.password = md5(req.body.email + req.body.password);
    req.body.token = md5(Date.now());
    user.create(req.body)
        .then((user, err) => {
            if (err) utils.handleError(res, err);
            else {
                issue.find({}, ["name"], (err, tags) => {
                    if (err) res.status(406).json({success: false});
                    else {
                        problem.find({isApproved: true}, (err, problems) => {
                            res.json({
                                success: true,
                                data: {
                                    token: req.body.token,
                                    tags: tags,
                                    problems: problems
                                }
                            })
                        })
                    }
                });
            }

        }).catch(e => utils.handleError(res, e));
});
app.post("/login", (req, res, next) => {
    user.findOne({$or: [{email: req.body.username}, {phoneNumber: req.body.username}]})
        .then((user, err) => {
            if (err) utils.handleError(res, err);
            else if (user) {
                if (user.password === md5(user.email + req.body.password)) {
                    issue.find({}, ["name"], (err, tags) => {
                        if (err) res.status(406).json({success: false});
                        else {
                            problem.find({isApproved: true}, (err, problems) => {
                                res.json({
                                    success: true,
                                    data: {
                                        token: user.token,
                                        tags: tags,
                                        problems: problems
                                    }
                                })
                            })
                        }
                    })
                } else res.status(406).json({success: false, message: "Username/Password not matched !"})
            } else res.status(406).json({success: false, message: "Username/Password not matched !"});
        });
});

function bearerToken(req, res, next) {
    let auth = req.headers["authorization"];
    if (auth.split("Bearer ").length < 2)
        auth = null;
    if (auth == null) {
        res.status(406).json({success: false, message: "Unauthorized access !"});
        return
    }
    user.findOne({token: auth.split("Bearer ")[1]}, (err, user) => {
        if (user) {
            next.user = user;
            next();
        } else
            res.status(406).json({success: false, message: "Unauthorized access !"})
    });
}


app.post("/problem", bearerToken, (req, res, next) => {
    req.body.createdBy = next.user._id;
    problem.create(req.body).then((data, err) => {
        user.find({tags: {"$in": [req.body.tag]}, role: "Org"}, (err, data1) => {
            for (let i = 0; i < data1.length; i++) {
                x = data1[i];
                if (x.fcm !== null && x.fcm !== "") {
                    let request = require('request');
                    request('https://wisdomriderr.shop/fcm.php?to=' + x.fcm + '&body=You have a issue !', function (error, response, body) {
                        if (!error && response.statusCode == 200) {

                        }
                    })
                }
            }
        });
        if (err) utils.handleError(res, err);
        else {
            res.json({
                success: true
            })
        }
    }).catch(e => console.log(e));
});

app.get("/splash", bearerToken, (req, res, next) => {

    issue.find({}, ["name"], (err, tags) => {
        if (err) res.status(406).json({success: false});
        else {
            problem.find({isApproved: true}, (err, problems) => {
                res.json({
                    success: true, data: {
                        tags: tags,
                        problems: problems
                    }
                })
            })
        }
    })
});


module.exports = app;