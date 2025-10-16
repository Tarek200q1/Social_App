"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const express_1 = require("express");
const auth_service_1 = __importDefault(require("../Services/auth.service"));
const Middleware_1 = require("../../../Middleware");
const Validators_1 = require("../../../Validators");
const authController = (0, express_1.Router)();
exports.authController = authController;
// SignUp
authController.post('/signup', (0, Middleware_1.validationMiddleware)(Validators_1.SignUpValidator), auth_service_1.default.signUp);
// Signin
authController.post('/signin', (0, Middleware_1.validationMiddleware)(Validators_1.SignInValidator), auth_service_1.default.signIn);
// Confirm email
authController.put('/confirm', auth_service_1.default.confirmEmail);
// Forget password
authController.post('/forget-password', (0, Middleware_1.validationMiddleware)(Validators_1.ForgetPasswordValidator), auth_service_1.default.forgetPassword);
// Reset password
authController.post('/reset-password', (0, Middleware_1.validationMiddleware)(Validators_1.ResetPasswordValidator), auth_service_1.default.resetPassword);
// Update password
authController.put('/update-password', Middleware_1.authentication, (0, Middleware_1.validationMiddleware)(Validators_1.UpdatePasswordValidator), auth_service_1.default.updatePassword);
// Authentication with Gmail
// Resend
// Logout
authController.post('/logout', Middleware_1.authentication, auth_service_1.default.logout);
