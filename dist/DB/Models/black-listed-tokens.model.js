"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackListedTokensModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const blackListedTokensSchema = new mongoose_1.default.Schema({
    tokenId: {
        type: String,
        required: true,
    },
    expirationDate: {
        type: Date,
        required: true
    }
});
const BlackListedTokensModel = mongoose_1.default.model('BlackListedTokens', blackListedTokensSchema);
exports.BlackListedTokensModel = BlackListedTokensModel;
