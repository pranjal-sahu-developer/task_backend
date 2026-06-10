"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const loginService_1 = require("../services/loginService");
const login = async (req, res) => {
    const payload = (0, loginService_1.validateLoginPayload)(req.body);
    const { token } = await (0, loginService_1.loginUser)(payload);
    res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
    });
};
exports.login = login;
