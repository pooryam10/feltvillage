
const Yup = require('yup');

exports.schema = Yup.object().shape({
    address: Yup.string()
        .required("آدرس الزامی است.")
        .min(4, "آدرس دارد شده مورد تایید نیست.")
});