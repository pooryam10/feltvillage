
const mongoose = require('mongoose');

const basketSchma = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    products: {
        type: Array,
        default: []
    }
});

const Basket = mongoose.model("Basket", basketSchma);

module.exports = Basket;