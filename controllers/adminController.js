
const fs = require('fs');

const shortId = require('shortid');
const appRoot = require('app-root-path');
const sharp = require('sharp');

const { formatDate } = require('../helpers/jalali');
const { sendMail } = require('../helpers/mailer');

const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Basket = require('../models/Basket');

exports.getDashboard = async (req, res) => {
    try {
        const numberOfUsers = await User.find().countDocuments();
        const numberOfProducts = await Product.find().countDocuments();
        const numberOfDiscountedProducts = await Product.find({ haveDiscount: true }).countDocuments();
        const numberOfOrders = await Order.find().countDocuments();
        const numberOfUnCompleteOrders = await Order.find({ completed: false }).countDocuments();

        res.render("dashboard", {
            pageTitle: "داشبورد ادمین",
            path: "/dashboard",
            fullname: req.user.fullname,
            numberOfProducts,
            numberOfUsers,
            numberOfDiscountedProducts,
            numberOfOrders,
            numberOfUnCompleteOrders
        });
    } catch (err) {
        console.log(err);
    }
}

exports.getAddProduct = (req, res) => {
    res.render("dashboard", {
        pageTitle: "داشبورد ادمین",
        path: "/add-product",
        fullname: req.user.fullname,
        message: req.flash("success_msg")
    });
}

exports.handelCreateProduct = async (req, res) => {
    const errors = [];
    let popularity = false;
    let haveDiscount = false;

    const picture = req.files ? req.files.picture : {};
    const uploadName = `${shortId.generate()}_${picture.name}`;
    const uploadPath = `${appRoot}/public/uploads/pictures/${uploadName}`;
    try {
        req.body = { ...req.body, picture };
        await Product.productValidation(req.body);

        await sharp(picture.data)
            .jpeg({ quality: 60 })
            .toFile(uploadPath)
            .catch(err => console.log(err));

        if (req.body.popularity === "true") {
            popularity = true;
        }

        let realPrice = req.body.price - (req.body.price * (req.body.discount / 100));

        if (req.body.price !== realPrice.toString()) {
            haveDiscount = true;
        } else {
            haveDiscount = false;
        }

        await Product.create({
            ...req.body,
            picture: uploadName,
            popularity: popularity,
            user: req.user.id,
            realPrice: realPrice,
            haveDiscount: haveDiscount
        });

        req.flash("success_msg", "کالا با مفقیت ذخیره شد.");
        res.redirect("/dashboard/add-product");
    } catch (err) {
        err.inner.forEach(e => {
            errors.push({ message: e.message });
        });
        res.render("dashboard", {
            pageTitle: "داشبورد ادمین",
            path: "/add-product",
            fullname: req.user.fullname,
            message: req.flash("success_msg"),
            errors
        });
    }
}

exports.getShowProducts = async (req, res) => {
    const page = +req.query.page || 1;
    const productPerPage = 3;

    try {
        const kind = req.params.kind || 'نمدی1';

        const numberOfProducts = await Product.find({ kind: kind }).countDocuments();
        const products = await Product.find({ kind: kind })
            .sort({ createdAt: "desc" })
            .skip((page - 1) * productPerPage)
            .limit(productPerPage);

        res.render("admin/dashProducts", {
            pageTitle: "Products",
            path: "/show-products",
            products,
            kind,
            formatDate,
            message: req.flash("success_msg"),
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: productPerPage * page < numberOfProducts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfProducts / productPerPage),
        });
    } catch (err) {
        console.log(err);
    }

}

exports.handelDeleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id });
        if (req.user.id !== product.user.toString()) {
            return res.redirect("/404");
        }

        fs.unlink(`${appRoot}/public/uploads/pictures/${product.picture}`, async (err) => {
            if (err) {
                console.log(err);
            }
        });

        const resault = await Product.findOneAndRemove({ _id: req.params.id });
        req.flash("success_msg", "کالا با موفقبت حذف شد.");
        res.redirect(`/dashboard/show-products/${product.kind}`);
    } catch (err) {
        console.log(err);
    }
}

exports.getEditProducts = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id });
        if (!product) {
            return res.redirect("/404");
        }
        if (req.user.id !== product.user.toString()) {
            return res.redirect("/404");
        }

        res.render("dashboard", {
            pageTitle: "داشبورد ادمین",
            path: "/edit-product",
            fullname: req.user.fullname,
            message: req.flash("success_msg"),
            product
        });
    } catch (err) {
        console.log(err);
    }
}

exports.handelEditProduct = async (req, res) => {
    const errors = [];
    let haveDiscount = false;

    const picture = req.files ? req.files.picture : {};
    const uploadName = `${shortId.generate()}_${picture.name}`;
    const uploadPath = `${appRoot}/public/uploads/pictures/${uploadName}`;

    const product = await Product.findOne({ _id: req.params.id });
    try {
        if (picture.name) {
            await Product.productValidation({ ...req.body, picture });
        } else {
            await Product.productValidation({
                ...req.body, picture: {
                    name: "palceholder",
                    size: 0,
                    mimeType: "image/jpeg"
                }
            });
        }

        console.log(picture);

        if (!product) {
            return res.redirect("/404");
        }

        if (product.user.toString() !== req.user.id) {
            return res.redirect("/404")
        } else {
            if (picture.name) {
                fs.unlink(`${appRoot}/public/uploads/pictures/${product.picture}`,
                    async (err) => {
                        if (err) console.log(err);
                        else {
                            await sharp(picture.data)
                                .jpeg({ quality: 60 })
                                .toFile(uploadPath)
                                .catch((err) => console.log(err));
                        }
                    }
                );
            }

            let realPrice = req.body.price - (req.body.price * (req.body.discount / 100));

            if (req.body.price !== realPrice.toString()) {
                haveDiscount = true;
            } else {
                haveDiscount = false;
            }

            product.name = req.body.name;
            product.price = req.body.price;
            product.size = req.body.size;
            product.color = req.body.color;
            product.explain = req.body.explain;
            product.popularity = req.body.popularity;
            product.status = req.body.status;
            product.kind = req.body.kind;
            product.discount = req.body.discount;
            product.realPrice = realPrice;
            product.haveDiscount = haveDiscount;
            product.picture = picture.name ? uploadName : product.picture;
            product.save();

            req.flash("success_msg", "تغییرات با موفقیت انجام شد.");
            res.redirect(`/dashboard/show-products/${product.kind}`)
        }
    } catch (err) {
        console.log(err);
        err.inner.forEach(e => {
            errors.push({ message: e.message });
        });
        res.render("dashboard", {
            pageTitle: "داشبورد ادمین",
            path: "/edit-product",
            fullname: req.user.fullname,
            message: req.flash("success_msg"),
            errors,
            product
        });
    }
}

exports.getDiscountedProducts = async (req, res) => {
    const page = +req.query.page || 1;
    const productPerPage = 3;
    try {
        const numberOfProducts = await Product.find({ haveDiscount: true }).countDocuments();
        const products = await Product.find({ haveDiscount: true })
            .sort({ createdAt: "desc" })
            .skip((page - 1) * productPerPage)
            .limit(productPerPage);
        res.render("admin/dashDiscountedProducts", {
            pageTitle: "کالا های تخفیف دار",
            path: "/discounted-products",
            products,
            formatDate,
            message: req.flash("success_msg"),
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: productPerPage * page < numberOfProducts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfProducts / productPerPage),
        });
    } catch (err) {
        console.log(err);
    }
}

exports.getUnCompletOrdersPage = async (req, res) => {
    try {
        const orders = await Order.find({ completed: false }).populate("user");

        res.render("admin/dashOrders", {
            pageTitle: "سفارشات",
            path: "/uncomplet-orders",
            orders,
            formatDate,
            message: req.flash("success_msg")
        });
    } catch (err) {
        console.log(err);
    }
}

exports.getSingleOrderPage = async (req, res) => {
    const products = [];
    let totalPrice = 0;
    try {
        const order = await Order.findOne({ _id: req.params.id }).populate("user");

        if (!order) {
            return res.render("/404");
        }

        for (let i = 0; i < order.products.length; i++) {
            const product = await Product.findOne({ _id: order.products[i] });
            products.push(product);
            totalPrice = totalPrice + product.realPrice;
        }

        console.log(products);

        res.render("admin/dashSingleOrder", {
            pageTitle: "سفارشات",
            path: "/single-path",
            order,
            products,
            formatDate,
            totalPrice
        });
    } catch (err) {
        console.log(err);
    }
}

exports.getCompletOrdersPage = async (req, res) => {
    try {
        const orders = await Order.find({ completed: true }).populate("user");

        res.render("admin/dashOrders", {
            pageTitle: "سفارشات",
            path: "/complet-orders",
            orders,
            formatDate,
            message: req.flash("success_msg")
        });
    } catch (err) {
        console.log(err);
    }
}

exports.handelCompleteOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id }).populate("user");
        const user = await User.findOne({ _id: order.user.id });

        if (!order) {
            return res.redirect("/404");
        }

        order.completed = true;
        order.save();

        user.haveOrder = false;
        user.save();

        sendMail(order.user.email, 'تکمیل سفارش', 'سفارش شما تکمیل شد و به پیک تحویل داده شد.');

        req.flash("success_msg", "سفارش تکمیل شد.");
        res.redirect("/dashboard/completed-orders")
    } catch (err) {
        console.log(err);
    }
}

exports.handelDeleteOrder = async (req, res) => {
    try {
        const order = await Order.findOneAndRemove(req.params.id);
        req.flash("success_msg", "سفارش با موفقیت حذف شد.");
        res.redirect("/dashboard/completed-orders");
    } catch (err) {
        console.log(err);
    }
}

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.render("admin/dashAllUsers", {
            path: "/all-users",
            pageTitle: "کاربران",
            users,
            formatDate,
            error: req.flash("error"),
            message: req.flash("success_msg")
        });
    } catch (err) {
        console.log(err);
    }
}

exports.handelDeleteUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            req.flash("error", "کاربر ادمین نباید حذف شود.");
            return res.redirect("/dashboard/all-users");
        }

        await User.findByIdAndRemove(req.params.id);
        await Basket.findOneAndRemove({ user: req.params.id });
        await Order.findOneAndRemove({ user: req.params.id });

        req.flash("success_msg", "کاربر با موفقبت حذف شد.");
        res.redirect("/dashboard/all-users");
    } catch (err) {
        console.log(err);
    }
}