
const Yup = require('yup');

exports.schema = Yup.object().shape({
    name: Yup.string()
        .required("نام کالا الزامی است."),
    status: Yup.mixed()
        .oneOf(["public", "private"], "وضعیت فقط باید public یا private باشد"),
    price: Yup.string()
        .required("قیمت کالا الزامی است."),
    discount: Yup.string()
        .required("تخفیف الزامی است.")
        .min(0, "تخفیف نباید کمتر از 0 باشد.")
        .max(100, "تخفیف نباید بیشتر از 100 باشد."),
    explain: Yup.string()
        .required("توضیحات کالا الزامی است."),
    picture: Yup.object().shape({
        name: Yup.string()
            .required("تصویر برای کالا الزامی است."),
        size: Yup.number("قیمت فقط میتواند عدد باشد.")
            .max(3000000, "سایز تصویر نمیتواند بیش از 3 مگابایت باشد."),
        mimetype: Yup.mixed()
            .oneOf(["image/jpeg", "image/png"], "فرمت تصویر مورد قبول نیست.")
    })
});