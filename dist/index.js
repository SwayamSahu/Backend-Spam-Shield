"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const spam_1 = __importDefault(require("./routes/spam"));
const search_1 = __importDefault(require("./routes/search"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Public routes (e.g., registration and login)
app.use('/auth', auth_1.default);
// All other routes require authentication
app.use(authMiddleware_1.authenticateToken);
app.use('/spam', spam_1.default);
app.use('/search', search_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
