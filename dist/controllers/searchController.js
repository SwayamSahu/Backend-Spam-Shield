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
exports.getUserDetails = exports.searchByPhone = exports.searchByName = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Search by name: results sorted with names starting with query first
const searchByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required.' });
        }
        // First, users whose names start with the query
        const startsWith = yield prisma.user.findMany({
            where: {
                name: { startsWith: query, mode: 'insensitive' },
            },
            select: { id: true, name: true, phoneNumber: true },
        });
        // Then, users whose names contain the query but do not start with it
        const contains = yield prisma.user.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' },
            },
            select: { id: true, name: true, phoneNumber: true },
        });
        const filteredContains = contains.filter((user) => !user.name.toLowerCase().startsWith(query.toLowerCase()));
        const results = [...startsWith, ...contains];
        // For each result, calculate spam likelihood (e.g., count of spam marks)
        const resultsWithSpam = yield Promise.all(results.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            const spamCount = yield prisma.spamMark.count({
                where: { phoneNumber: user.phoneNumber },
            });
            return Object.assign(Object.assign({}, user), { spamCount });
        })));
        res.json(resultsWithSpam);
    }
    catch (error) {
        res.status(500).json({ error: 'Search by name failed' });
    }
});
exports.searchByName = searchByName;
// Search by phone number
const searchByPhone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const phone = req.query.phone;
        if (!phone) {
            return res.status(400).json({ error: 'Phone parameter is required.' });
        }
        // Check if there is a registered user with this phone number
        const registeredUser = yield prisma.user.findUnique({
            where: { phoneNumber: phone },
            select: { id: true, name: true, phoneNumber: true },
        });
        if (registeredUser) {
            const spamCount = yield prisma.spamMark.count({
                where: { phoneNumber: registeredUser.phoneNumber },
            });
            return res.json([Object.assign(Object.assign({}, registeredUser), { spamCount })]);
        }
        const contacts = yield prisma.contact.findMany({
            where: { phoneNumber: phone },
            select: { id: true, name: true, phoneNumber: true, userId: true },
        });
        const results = yield Promise.all(contacts.map((contact) => __awaiter(void 0, void 0, void 0, function* () {
            const spamCount = yield prisma.spamMark.count({
                where: { phoneNumber: contact.phoneNumber },
            });
            return Object.assign(Object.assign({}, contact), { spamCount });
        })));
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: 'Search by phone failed' });
    }
});
exports.searchByPhone = searchByPhone;
// Get full details for a person
const getUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = req.params.id;
        const requesterId = req.user.userId;
        // Fetch the user details
        const user = yield prisma.user.findUnique({
            where: { id: Number(id) },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Check if the requester is in the user's contact list
        const isInContactList = yield prisma.contact.findFirst({
            where: {
                userId: user.id,
                phoneNumber: (_a = (yield prisma.user.findUnique({ where: { id: requesterId } }))) === null || _a === void 0 ? void 0 : _a.phoneNumber,
            },
        });
        // Calculate spam likelihood
        const spamCount = yield prisma.spamMark.count({
            where: { phoneNumber: user.phoneNumber },
        });
        // Prepare the response
        const responseData = {
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            spamCount,
        };
        // Include email only if the requester is in the user's contact list
        if (isInContactList) {
            responseData.email = user.email;
        }
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve user details' });
    }
});
exports.getUserDetails = getUserDetails;
