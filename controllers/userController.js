
const passport = require('passport');
const fetch = require('node-fetch');

const User = require('../models/User');
const Basket = require('../models/Basket');

const { sendMail } = require('../helpers/mailer');

exports.getRegisterPage = (req, res) => {
    res.render("users/register", {
        path: "/register",
        pageTitle: "ثبت نام"
    });
}

exports.getLoginPage = (req, res) => {
    res.render("users/login", {
        path: "/login",
        pageTitle: "ورود",
        message: req.flash("success_msg"),
        error: req.flash("error")
    });
}

exports.handelLogin = async (req, res, next) => {
    try {
        if (!req.body["g-recaptcha-response"]) {
            req.flash("error", "فیلد من ربات نیستم را کامل کنید.")
            return res.redirect("/users/login");
        }

        const secretKey = process.env.CAPTCHA_SECRET;
        const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body["g-recaptcha-response"]}
        &remoteip=${req.connection.remoteAddress}`;

        const response = await fetch(verifyUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            },
        });

        const json = await response.json();

        if (json.success) {
            let redirectPath = "/"
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                if (user.isAdmin === true) {
                    redirectPath = "/dashboard"
                }
            }
            passport.authenticate("local", {
                failureRedirect: "/users/login",
                successRedirect: redirectPath,
                failureFlash: true,
                successFlash: true
            })(req, res, next);
        } else {
            req.flash("error", "مشکلی در اعتبار سنجی captcha وجود دارد.");
            res.redirect("/users/login");
        }

    } catch (err) {
        console.log(err);
    }

}

exports.handelRegister = async (req, res) => {
    const errors = [];
    let isAdmin = false;

    try {
        await User.userValidation(req.body);

        const user = await User.findOne({ email: req.body.email });
        if (user) {
            errors.push({ message: "ایمیل وارد شده مورد قبول نیست." });
            res.render("users/register", {
                path: "/register",
                pageTitle: "ثبت نام",
                errors
            });
        }

        const numberOfsers = await User.find().countDocuments();
        if (numberOfsers === 0) {
            isAdmin = true;
        }

        const createdUser = await User.create({ ...req.body, isAdmin });
        await Basket.create({ user: createdUser.id });

        sendMail(req.body.email, 'ثبت نام شما با موفقبت انجام شد.', 'ثبت نام شما با موفقیت انجام شد. به سایت felt village خوش آمدید');

        req.flash("success_msg", "ثبت نام شما با موفقیت انجام شد.");
        res.redirect("/users/login");
    } catch (err) {
        console.log(err);
        err.inner.forEach(e => {
            errors.push({ message: e.message });
        });
        res.render("users/register", {
            path: "/register",
            pageTitle: "ثبت نام",
            errors
        });
    }
}

exports.getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/404");
        }

        if (req.user.isAdmin === true) {
            res.redirect("/dashboard");
        }else {
            res.redirect("/")
        }

    } catch (err) {
        console.log(err);
    }
}