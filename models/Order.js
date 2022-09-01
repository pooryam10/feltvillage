
const mongoose = require('mongoose');

const { schema } = require('./secure/orderValidator');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    products: {
        type: Array,
        default: []
    },
    completed: {
        type: Boolean,
        default: false
    },
    confirm: {
        type: Boolean,
        default: false
    },
    confirmCode: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

orderSchema.statics.orderValidation = function (body) {
    return schema.validate(body, { abortEarly: false });
}

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;