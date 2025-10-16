"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = exports.UnauthorizedException = exports.NotFoundException = exports.ConflictException = exports.BadRequestException = void 0;
const http_excption_utils_1 = require("./http-excption.utils");
class BadRequestException extends http_excption_utils_1.HttpExcption {
    error;
    constructor(message, error) {
        super(message, 400, error);
        this.error = error;
    }
}
exports.BadRequestException = BadRequestException;
class ConflictException extends http_excption_utils_1.HttpExcption {
    error;
    constructor(message, error) {
        super(message, 409, error);
        this.error = error;
    }
}
exports.ConflictException = ConflictException;
class NotFoundException extends http_excption_utils_1.HttpExcption {
    error;
    constructor(message, error) {
        super(message, 404, error);
        this.error = error;
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends http_excption_utils_1.HttpExcption {
    error;
    constructor(message, error) {
        super(message, 401, error);
        this.error = error;
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends http_excption_utils_1.HttpExcption {
    error;
    constructor(message, error) {
        super(message, 403, error);
        this.error = error;
    }
}
exports.ForbiddenException = ForbiddenException;
