const LoginModel = require('../LoginModel');

module.exports = async function (context, req) {
    const userId = "6813d05ff67ef87dd1c25893";

    try {
        const User = await LoginModel.findById(userId);
        context.res = {
            status: 200,
            body: User
        };
    } catch(error) {
        context.res = {
            status: 400,
            body: {error: error.message}
        };
        context.log("Could Not Find User!");
    }
};