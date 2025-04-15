"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const spamController_1 = require("../controllers/spamController");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// POST /spam to mark a number as spam
router.post('/', asyncHandler(spamController_1.markSpam));
exports.default = router;
