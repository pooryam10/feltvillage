
const Product = require('../models/Product');
const Basket = require('../models/Basket');

exports.handelAddToBasket = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/404");
        }

        const basket = await Basket.findOne({ user: req.user.id });
        if (!basket) {
            return res.redirect("/404");
        }

        const product = await Product.findOne({ _id: req.params.id });
        if (!product) {
            return res.redirect("/404")
        }

        for (let i = 0; i < basket.products.length; i++) {
            if (basket.products[i] === req.params.id) {
                req.flash("error", "این کالا در سبد خرید موجود است.")
                return res.redirect(`/products/single-product/${req.params.id}`);
            }
        }

        basket.products.push(req.params.id);
        basket.save();

        req.flash("success_msg", "با موفقیت اضافه شد.");
        res.redirect(`/products/single-product/${req.params.id}`);
    } catch (err) {
        console.log(err);
    }
}

exports.getBasket = async (req, res) => {
    let basketNumber = 0;
    let userName = "";
    const products = [];
    let totalPrice = 0;

    try {
        if (req.user) {
            const basket = await Basket.findOne({ user: req.user.id });
            basketNumber = basket.products.length;
            userName = req.user.fullname;
        }

        const basket = await Basket.findOne({ user: req.user.id });
        for (let i = 0; i < basket.products.length; i++) {
            let product = await Product.findOne({ _id: basket.products[i] });
            products.push(product);
            totalPrice = totalPrice + product.realPrice;
        }

        res.render("basket", {
            pageTitle: "سبد خرید",
            path: "/basket",
            basketNumber,
            userName,
            products,
            totalPrice,
            error: req.flash("error"),
            message: req.flash("success_msg")
        });
    } catch (err) {
        console.log(err);
    }
}


exports.handelRemoveProduct = async (req, res) => {
    try {
        const basket = await Basket.findOne({ user: req.user.id });

        const index = basket.products.indexOf(req.params.id);
        console.log(index);
        if (index > -1) {
            basket.products.splice(index, 1);
        }

        console.log(basket.products);

        basket.save();

        res.redirect("/basket");
    } catch (err) {
        console.log(err);
    }
}