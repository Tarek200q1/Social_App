"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const controllers = __importStar(require("./Modules/controllers.index"));
const db_connection_1 = require("./DB/db.connection");
const Utils_1 = require("./Utils");
const cors_1 = __importDefault(require("cors"));
const socketIo_gateway_1 = require("./Gateways/socketIo.gateway");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, db_connection_1.dbConnection)();
app.use('/api/auth', controllers.authController);
app.use('/api/users', controllers.profilecontroller);
app.use('/api/posts', controllers.postController);
app.use('/api/comments', controllers.commentController);
app.use('/api/reacts', controllers.reactController);
// Error handilng middleware
app.use((err, req, res, next) => {
    if (err) {
        if (err instanceof Utils_1.HttpExcption) {
            res.status(err.statusCode).json((0, Utils_1.FailedResponse)(err.message, err.statusCode, err.error));
        }
        else {
            res.status(500).json((0, Utils_1.FailedResponse)('Something went wrong', 500, err));
        }
    }
});
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log("Server is running on port " + process.env.PORT);
});
(0, socketIo_gateway_1.ioIntializer)(server);
