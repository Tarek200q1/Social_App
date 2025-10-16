"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const Utils_1 = require("../Utils");
const validationMiddleware = (schema) => {
    return (req, res, next) => {
        const reqKeys = ['body', 'params', 'query', 'headers'];
        const validationError = [];
        for (const key of reqKeys) {
            if (schema[key]) {
                const result = schema[key].safeParse(req[key]);
                if (!result?.success) {
                    const issues = result.error.issues.map(issue => ({
                        path: issue.path,
                        message: issue.message
                    }));
                    validationError.push({ key, issues });
                }
            }
        }
        if (validationError.length)
            throw new Utils_1.BadRequestException('Validation failed', { validationError });
        next();
    };
};
exports.validationMiddleware = validationMiddleware;
