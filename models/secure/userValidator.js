
const Yup = require('yup');

exports.schema = Yup.object().shape({
    fullname: Yup.string()
        .required("لطفا نام خود را وارد کنید.")
        .max(255, "نام وارد شده بزرگتر از حد مجاز است."),
    email: Yup.string()
        .email("ایمیل وارد شده صحیح نیست.")
        .required("وارد کردن ایمیل الزامی است."),
    phoneNumber: Yup.string()
        .required("وارد کردن شماره تماس الزامی است.")
        .max(12, "شماره تلفن اشتباه است."),
    password: Yup.string()
        .required("وارد کردن رمز عبور الزامی است.")
        .min(4, "رمز عبور باید بیش از 4 کاراکتر باشد.")
        .max(255, "رمز عبور بزرگ تر از حد مجاز است."),
    confirmPassword: Yup.string()
        .required("تکرار رمز عبور الزامی است.")
        .oneOf([Yup.ref("password"), null], "تکرار رمز عبور صحیج نیست."),
})