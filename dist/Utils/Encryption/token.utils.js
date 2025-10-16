"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload, secretOrPrivateKey = process.env.JWT_ACCESS_SECRET, option) => {
    return jsonwebtoken_1.default.sign(payload, secretOrPrivateKey, option);
};
exports.generateToken = generateToken;
const verifyToken = (token, secretOrPublicKey = process.env.JWT_ACCESS_SECRET, option) => {
    return jsonwebtoken_1.default.verify(token, secretOrPublicKey, option);
};
exports.verifyToken = verifyToken;
