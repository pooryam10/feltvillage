
const { formatDate } = require('../helpers/jalali');

const Product = require('../models/Product');
const Basket = require('../models/Basket');

exports.getProducts = async (req, res) => {
    const page = +req.query.page || 1;
    const productPerPage = 12;

    let basketNumber = 0;
    let userName = "";
    try {
        const kind = req.params.kind || 'نمدی1';

        const numberOfProducts = await Product.find({ kind: kind }).countDocuments();

        const products = await Product.find({ kind, status: "public" })
            .sort({ createdAt: "desc" })
            .skip((page - 1) * productPerPage)
            .limit(productPerPage);

        if (req.user) {
            const basket = await Basket.findOne({ user: req.user.id });
            basketNumber = basket.products.length;
            userName = req.user.fullname;
        }

        res.render("products", {
            pageTitle: kind,
            path: "/products",
            products,
            formatDate,
            basketNumber,
            userName,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: productPerPage * page < numberOfProducts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfProducts / productPerPage),
        })
    } catch (err) {
        console.log(err);
    }
}

exports.getSingleProduct = async (req, res) => {
    let basketNumber = 0;
    let userName = "";
    try {
        const product = await Product.findOne({ _id: req.params.id });

        if (!product) {
            return res.redirect("/404");
        }

        if (req.user) {
            const basket = await Basket.findOne({ user: req.user.id });
            basketNumber = basket.products.length;
            userName = req.user.fullname;
        }

        res.render("singleProducts.ejs", {
            pageTitle: product.name,
            path: "/single-product",
            product,
            basketNumber,
            userName,
            message: req.flash("success_msg"),
            error: req.flash("error")
        });
    } catch (err) {
        console.log(err);
    }
}

