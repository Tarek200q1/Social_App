"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const bcrypt_1 = require("bcrypt");
// Generate Hash
const generateHash = (plainText, saltRounds = parseInt(process.env.SALT_ROUNDS)) => {
    return (0, bcrypt_1.hashSync)(plainText, saltRounds);
};
exports.generateHash = generateHash;
// Comper Hash
const compareHash = (plainText, hash) => {
    return (0, bcrypt_1.compareSync)(plainText, hash);
};
exports.compareHash = compareHash;
