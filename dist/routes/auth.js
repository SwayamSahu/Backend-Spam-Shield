"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// POST /auth/register
router.post('/register', asyncHandler(authController_1.register));
// POST /auth/login
router.post('/login', asyncHandler(authController_1.login));
exports.default = router;
