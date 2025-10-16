import { HttpExcption } from "./http-excption.utils";

export class BadRequestException extends HttpExcption {
    constructor (message: string, public error?:object){
        super(message, 400, error)
    }
}

export class ConflictException extends HttpExcption {
    constructor (message: string, public error?:object){
        super(message, 409, error)
    }
}

export class NotFoundException extends HttpExcption {
    constructor (message: string, public error?:object){
        super(message, 404, error)
    }
}

export class UnauthorizedException extends HttpExcption {
    constructor (message: string, public error?:object){
        super(message, 401, error)
    }
}

export class ForbiddenException extends HttpExcption {
    constructor (message: string, public error?:object){
        super(message, 403, error)
    }
}