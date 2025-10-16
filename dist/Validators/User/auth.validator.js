"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePasswordValidator = exports.ResetPasswordValidator = exports.ForgetPasswordValidator = exports.SignInValidator = exports.SignUpValidator = void 0;
const zod_1 = __importDefault(require("zod"));
const Common_1 = require("../../Common");
exports.SignUpValidator = {
    body: zod_1.default.strictObject({
        firstName: zod_1.default.string().min(3, { error: 'First name must be at least 3 characters long' }).max(10),
        lastName: zod_1.default.string().min(3).max(10),
        email: zod_1.default.email(),
        password: zod_1.default.string().min(6).max(59),
        passwordConfirmation: zod_1.default.string(),
        gender: zod_1.default.enum(Common_1.GenderEnum),
        age: zod_1.default.number().min(16).max(80),
        role: zod_1.default.enum(Common_1.RoleEnum),
        DOB: zod_1.default.coerce.date(),
        phoneNumber: zod_1.default.string().min(11).max(11)
    })
        .refine((data) => {
        if (data.password !== data.passwordConfirmation)
            return false;
        return true;
    }, { path: ['passwordConfirmation'], message: 'Passwords do not match' })
};
exports.SignInValidator = {
    body: zod_1.default.strictObject({
        email: zod_1.default.email(),
        password: zod_1.default.string()
    })
};
exports.ForgetPasswordValidator = {
    body: zod_1.default.strictObject({
        email: zod_1.default.email()
    })
};
exports.ResetPasswordValidator = {
    body: zod_1.default.strictObject({
        email: zod_1.default.email(),
        otp: zod_1.default.string().min(5).max(5),
        newPassword: zod_1.default.string().min(6).max(59),
        confirmNewPassword: zod_1.default.string(),
    })
        .refine((data) => {
        if (data.newPassword !== data.confirmNewPassword)
            return false;
        return true;
    }, { path: ['confirmNewPassword'], message: 'Passwords do not match' })
};
exports.UpdatePasswordValidator = {
    body: zod_1.default.strictObject({
        oldPassword: zod_1.default.string(),
        newPassword: zod_1.default.string().min(6).max(59),
        confirmNewPassword: zod_1.default.string()
    })
        .refine((data) => {
        if (data.newPassword !== data.confirmNewPassword)
            return false;
        return true;
    }, { path: ['confirmNewPassword'], message: 'Passwords do not match' })
};
