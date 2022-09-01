
const path = require('path');

const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const fileupload = require('express-fileupload');

const connectionDB = require('./config/db');

// connect to database
connectionDB();

// passport config
require('./config/passport');

// dotenv
dotenv.config({ path: "./config/config.env" });

//* -------------------------------------------------------
const app = express();

// setup helmet
// app.use(helmet());

// limiter config
const limiter = rateLimit({
    windowMs: 15*60*1000,
    max: 200
});

app.use(limiter);

// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
}));

// flash
app.use(flash());

// Statics
app.use(express.static(path.join(__dirname, "public")));

// passport
app.use(passport.initialize());
app.use(passport.session());

// fileupload
app.use(fileupload());

// ejs
app.set("view engine", "ejs");
app.set("views", "views");

// routes
app.use("/", require('./routes/main'));
app.use("/users", require('./routes/users'));
app.use("/dashboard", require('./routes/dashboard'));
app.use("/products", require('./routes/product'));
app.use("/basket", require('./routes/basket'));
app.use("/order", require('./routes/order'));

// 404 page
app.use((req, res) => {
    res.render("404", { pageTitle: "404 | not found", path: "/404" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Project is runing on port ${port}.`);
})