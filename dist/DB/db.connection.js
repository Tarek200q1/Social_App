"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = dbConnection;
const mongoose_1 = __importDefault(require("mongoose"));
async function dbConnection() {
    try {
        await mongoose_1.default.connect(process.env.DB_URL_LOCAL);
        console.log('Database connection');
    }
    catch (error) {
        console.log(`Error conection to the database: ${error}`);
    }
}
