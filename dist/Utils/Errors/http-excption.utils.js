"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExcption = void 0;
class HttpExcption extends Error {
    message;
    statusCode;
    error;
    constructor(message, statusCode, error) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.error = error;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.HttpExcption = HttpExcption;
