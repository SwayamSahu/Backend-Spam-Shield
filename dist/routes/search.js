"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// GET /search/name?query=...
router.get('/name', asyncHandler(searchController_1.searchByName));
// GET /search/phone?phone=...
router.get('/phone', asyncHandler(searchController_1.searchByPhone));
// GET /search/details/:id
router.get('/details/:id', asyncHandler(searchController_1.getUserDetails));
exports.default = router;
