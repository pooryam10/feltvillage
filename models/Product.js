
const mongoose = require('mongoose');

const { schema } = require('./secure/productValidator');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    realPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "public",
        enum: ["public", "private"]
    },
    explain: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: Number,
        default: 0
    },
    color: {
        type: String
    },
    kind: {
        type: String,
        default: "نمدی1",
        enum: ["نمدی1", "نمدی2", "نمدی3"]
    },
    discount: {
        type: Number,
        default: 0,
        max: 100
    },
    haveDiscount: {
        type: Boolean,
        default: false
    },
    popularity: {
        type: Boolean,
        default: false
    },
    picture: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

productSchema.statics.productValidation = function (body) {
    return schema.validate(body, { abortEarly: false });
}

const Product = mongoose.model("Product", productSchema);

module.exports = Product;