"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loginController_1 = require("./controllers/loginController");
const studentController_1 = require("./controllers/studentController");
const asyncHandler_1 = require("./middleware/asyncHandler");
const authMiddleware_1 = require("./middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});
router.post('/login', (0, asyncHandler_1.asyncHandler)(loginController_1.login));
router.post('/register', (0, asyncHandler_1.asyncHandler)(studentController_1.register));
router.get('/students', authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(studentController_1.getAllStudents));
router.put('/student/:id', authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(studentController_1.update));
router.delete('/student/:id', authMiddleware_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(studentController_1.remove));
exports.default = router;
