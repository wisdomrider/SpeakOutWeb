var express = require("express"),
    path = require("path"),
    ejs = require("ejs"),
    createError = require('http-errors'),
    config = require("./Config"),
    mongoose = require("mongoose"),
    utils = require("./home/Utils").data,
    cookie = require("cookie-parser"),
    app = express();

//middlewares

app.use(cookie());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(express.json());


//Mongo Options
mongoose.set('useCreateIndex', true);

// home routing

app.get("/", (req, res, next) => {
    utils.render(res, "index", {title: ""});
});


//Routing starts

app.use("/api", require("./home/ApiRouter"));
app.use("/web", require("./home/webRouter"));


//Error Handling

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error', {
        error: err
    });

});


// Mongo DB connection
var conn = mongoose.connect("mongodb://localhost:27017/SpeakOut", {useNewUrlParser: true});

conn.then((db) => {
    console.log("DB Connected...")
}, (err) => console.log(err));

//node starts to listern on 3000 or default port

app.listen(process.env.port || 3000, () => {
    console.log("Port is working fine !");
});



