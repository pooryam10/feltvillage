const mongoose = require("mongoose");

const connectionDB = async () => {
    try {
        const conn = await mongoose.connect(`mongodb://localhost:27017/feltvillage_db`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectionDB;
