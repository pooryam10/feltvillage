
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { schema } = require('./secure/userValidator');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 255
    },
    phoneNumber: {
        type: String,
        required: true,
        maxlength: 12
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    haveOrder: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.statics.userValidation = function (body) {
    return schema.validate(body, {abortEarly: false});
}

userSchema.pre("save", function (next) {
    let user = this;

    if (!user.isModified("password")) return next();

    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return next(err);

        user.password = hash;
        next();
    });
});

const User = mongoose.model("User", userSchema);

module.exports = User;