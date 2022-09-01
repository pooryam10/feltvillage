
const Product = require('../models/Product');
const Basket = require('../models/Basket');

exports.getMainPage = async (req, res) => {
    let basketNumber = 0;
    let userName = "";
    try {
        const recentProducts = await Product.find({ status: "public" })
            .sort({ createdAt: "desc" })
            .limit(6);

        const popularProducts = await Product.find({ status: "public", discount: 0, popularity: true })
            .sort({ createdAt: "desc" })
            .limit(6);

        const discountProducts = await Product.find({ status: "public", haveDiscount: true })
            .sort({ createdAt: "desc" })
            .limit(8);

        if (req.user) {
            const basket = await Basket.findOne({ user: req.user.id });
            basketNumber = basket.products.length;
            userName = req.user.fullname;
        }

        res.render("index", {
            path: "/",
            pageTitle: "نمدیجات مهسا",
            message: req.flash("success_msg"),
            recentProducts,
            popularProducts,
            discountProducts,
            basketNumber,
            userName
        });
    } catch (err) {
        console.log(err);
    }
}