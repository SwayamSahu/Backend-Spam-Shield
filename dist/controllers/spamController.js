"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markSpam = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const markSpam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required.' });
        }
        const userId = req.user.userId;
        yield prisma.spamMark.create({
            data: { phoneNumber, userId },
        });
        res.status(201).json({ message: 'Number marked as spam.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark spam' });
    }
});
exports.markSpam = markSpam;
