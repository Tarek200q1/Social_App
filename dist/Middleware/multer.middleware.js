"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Multer = void 0;
const multer_1 = __importDefault(require("multer"));
const Multer = () => {
    return (0, multer_1.default)({ storage: multer_1.default.diskStorage({}) });
};
exports.Multer = Multer;
