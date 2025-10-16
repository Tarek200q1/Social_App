import { Router } from "express";
import AuthService from '../Services/auth.service'
import { authentication, validationMiddleware } from "../../../Middleware";
import { ForgetPasswordValidator, ResetPasswordValidator, SignInValidator, SignUpValidator, UpdatePasswordValidator } from "../../../Validators";
const authController = Router()

// SignUp
authController.post('/signup', validationMiddleware(SignUpValidator), AuthService.signUp)

// Signin
authController.post('/signin', validationMiddleware(SignInValidator), AuthService.signIn)

// Confirm email
authController.put('/confirm', AuthService.confirmEmail)

// Forget password
authController.post('/forget-password', validationMiddleware(ForgetPasswordValidator), AuthService.forgetPassword)

// Reset password
authController.post('/reset-password', validationMiddleware(ResetPasswordValidator), AuthService.resetPassword)

// Update password
authController.put('/update-password', authentication, validationMiddleware(UpdatePasswordValidator), AuthService.updatePassword)

// Authentication with Gmail


// Resend


// Logout
authController.post('/logout', authentication, AuthService.logout)
export {authController}