
const fetch = require('node-fetch');

const Order = require('../models/Order');
const Basket = require('../models/Basket');
const User = require('../models/User');

const { sendMail } = require('../helpers/mailer');

exports.getAddressPage = (req, res) => {
    res.render("order/getAddress", {
        pageTitle: "نمدیجات مهسا",
        path: "/get-address",
        error: req.flash("error")
    });
}

exports.handelGetAddress = async (req, res) => {
    const errors = [];
    try {
        if (!req.body["g-recaptcha-response"]) {
            req.flash("error", "فیلد من ربات نیستم را کامل کنید.")
            return res.redirect("/order/get-address");
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
            await Order.orderValidation(req.body);

            const user = await User.findOne({ _id: req.user.id });
            if (user.haveOrder === true) {
                req.flash("error", "شما دارای سفارش فعال هستید.");
                return res.redirect("/basket");
            }

            const basket = await Basket.findOne({ user: req.user.id });
            if (!basket) {
                return res.redirect("/404");
            }
            if (basket.products.length === 0) {
                req.flash("error", "سبد خرید خالی است.");
                return res.redirect("/basket");
            }

            const products = [...basket.products];
            const confirmCode = Math.floor(Math.random() * 10000);    

            await Order.create({
                address: req.body.address,
                products: products,
                user: req.user.id,
                confirmCode: confirmCode
            });

            basket.products = [];
            basket.save();

            user.haveOrder = true;
            user.save();

            sendMail(user.email, 'کد تایید', `کد تایید سفارش شما: ${confirmCode}`);

            res.redirect("/order/confirm-order");

        } else {
            req.flash("error", "مشکلی در اعتبار سنجی captcha وجود دارد.");
            res.redirect("/order/get-address");
        }
    } catch (err) {
        console.log(err);
        err.inner.forEach(e => {
            errors.push({ message: e.message });
        });
        res.render("order/getAddress", {
            pageTitle: "نمدیجات مهسا",
            path: "/get-address",
            error: req.flash("error"),
            errors
        });
    }
}

exports.getConfirmOrder = (req, res) => {
    res.render("order/confirmOrder", {
        pageTitle: "تایید سفارش",
        path: "/confirm-order"
    });
}

exports.handeConfirmOrder = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id })

        const order = await Order.findOne({ user: req.user.id });
        if (!order) {
            return res.redirect("/404")
        }

        if (order.confirmCode.toString() === req.body.confirm) {
            order.confirm = true;
            order.save();
            req.flash("success_msg", "سفارش با موفقبت تایید شد در اسرع وقت با شما تماس گرفته خواهد شد.");
        } else {
            const result = await Order.findOneAndRemove({ user: req.user.id });
            user.haveOrder = false;
            user.save();
            req.flash("error", "کد تایید اشتباه وارد شد.");
        }

        res.redirect("/basket");
    } catch (err) {
        console.log(err);
    }
}