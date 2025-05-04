const LoginModel = require('../LoginModel');
const jwt = require('jsonwebtoken');

module.exports = async function (context, req) {
    const { token, projects } = req.body;
    
    try {
        const allUsers = await LoginModel.find({});
        const decoded = jwt.decode(token);

        if (!decoded) {
            context.res = {
                status: 400,
                body: { error: "Invalid token" }
            };
            return;
        }

        const existingUser = allUsers.find(user => {
            const decodedUser = jwt.decode(user.token);
            return decodedUser.email === decoded.email;
        });
        
        if (existingUser) {
            context.log("User already exists, go to Homepage!");
            context.res = {
                status: 200,
                body: existingUser
            };
        } else {
            const login_model = await LoginModel.create({token, projects});
            context.res = {
                status: 200,
                body: login_model
            };
            context.log("User does not exist, creating user");
        }

    } catch (error) {
        context.log.error("Error in submit_user:", error);
        context.res = {
            status: 400,
            body: {error: error.message}
        };
        context.log("POST Request FAILED");
    }
};