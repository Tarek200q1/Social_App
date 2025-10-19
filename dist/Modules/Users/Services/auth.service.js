"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = require("bcrypt");
const uuid_1 = require("uuid");
const Common_1 = require("../../../Common");
const Repositories_1 = require("../../../DB/Repositories");
const Models_1 = require("../../../DB/Models");
const Utils_1 = require("../../../Utils");
const token_utils_1 = require("../../../Utils/Encryption/token.utils");
const excptions_utils_1 = require("../../../Utils/Errors/excptions.utils");
class AuthService {
    userRepo = new Repositories_1.UserRepository(Models_1.UserModel);
    blackListedRepo = new Repositories_1.BlackListedtokenRepository(Models_1.BlackListedTokensModel);
    signUp = async (req, res, next) => {
        const { firstName, lastName, email, password, gender, DOB, phoneNumber } = req.body;
        const isEmailExists = await this.userRepo.findOneDocument({ email }, 'email');
        if (isEmailExists)
            throw next(new excptions_utils_1.ConflictException('Email already exists', { invalidEmail: email }));
        // Send OTP
        const otp = Math.floor(Math.random() * 100000).toString();
        Utils_1.localEmitter.emit('sendEmail', {
            to: email,
            subject: `OTP for signuUp`,
            content: `
                      <div style="
                        font-family: 'Segoe UI', Arial, sans-serif;
                        background-color: #f4f6f8;
                        padding: 30px;
                        text-align: center;
                      ">
                        <div style="
                          background-color: #ffffff;
                          border-radius: 12px;
                          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                          padding: 40px;
                          display: inline-block;
                          max-width: 500px;
                        ">
                          <h1 style="color: #2c3e50; margin-bottom: 10px;">👋 Welcome, ${firstName}!</h1>
                          <p style="color: #555; font-size: 15px; margin-top: 0;">
                            We're thrilled to have you join us.  
                            To complete your registration, please use the OTP below to verify your email address.
                          </p>

                          <div style="
                            margin: 25px 0;
                            display: inline-block;
                            background: linear-gradient(135deg, #007bff, #00b4d8);
                            color: white;
                            padding: 14px 35px;
                            border-radius: 10px;
                            font-size: 22px;
                            letter-spacing: 3px;
                            font-weight: bold;
                          ">
                            ${otp}
                          </div>

                          <p style="color: #777; font-size: 13px;">
                            This code will expire in <b>10 minutes</b>.  
                            If you didn’t sign up for an account, you can safely ignore this email.
                          </p>

                          <hr style="border: none; height: 1px; background-color: #eee; margin: 25px 0;">

                          <p style="color: #999; font-size: 12px; margin-top: 10px;">
                            Need help? <a href="#" style="color: #007bff; text-decoration: none;">Contact Support</a>
                          </p>
                        </div>

                        <p style="color: #aaa; font-size: 11px; margin-top: 25px;">
                          &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
                        </p>
                      </div>
                     `
        });
        const confirmationOtp = {
            value: (0, Utils_1.generateHash)(otp),
            expiresAt: Date.now() + 600000,
            otpType: Common_1.OtpTypesEnum.CONFIRMATION
        };
        const newUser = await this.userRepo.createNewDocument({
            firstName, lastName, email, password, gender, DOB, phoneNumber, OTPS: [confirmationOtp]
        });
        return res.status(201).json((0, Utils_1.SuccessResponse)('User created successfully', 201, newUser));
    };
    confirmEmail = async (req, res, next) => {
        const { email, otp } = req.body;
        const user = await this.userRepo.findOneDocument({
            email,
            isVerified: false,
            'OTPS.otpType': Common_1.OtpTypesEnum.CONFIRMATION
        });
        if (!user)
            return res.status(404).json({ message: "User Not Found" });
        const storedOtp = user.OTPS?.find(({ otpType }) => otpType === Common_1.OtpTypesEnum.CONFIRMATION);
        if (!storedOtp)
            throw next(new excptions_utils_1.NotFoundException('Otp Not found'));
        const isOtpValid = (0, bcrypt_1.compareSync)(otp, storedOtp.value);
        if (!isOtpValid)
            throw next(new excptions_utils_1.NotFoundException('invalid otp'));
        if (storedOtp.expiresAt < Date.now())
            throw next(new excptions_utils_1.NotFoundException('Otp Expired'));
        user.isVerified = true;
        user.OTPS = user.OTPS?.filter(({ otpType }) => otpType !== Common_1.OtpTypesEnum.CONFIRMATION);
        await user.save();
        return res.status(200).json({ message: "Email Confirmed successfully", user });
    };
    signIn = async (req, res, next) => {
        const { email, password } = req.body;
        const user = await this.userRepo.findOneDocument({ email });
        if (!user)
            throw next(new excptions_utils_1.NotFoundException('Invalid email or password'));
        const hashPassword = user.password;
        const isPasswordMatched = (0, bcrypt_1.compareSync)(password, hashPassword);
        if (!isPasswordMatched)
            throw next(new excptions_utils_1.NotFoundException('Invalid email or password'));
        const device = req.headers["user-agent"];
        if (!device) {
            throw next(new excptions_utils_1.BadRequestException('Invalid email or password'));
        }
        if (!user.devices)
            user.devices = [];
        if (!user.devices.includes(device)) {
            if (user.devices.length >= 2) {
                throw next(new excptions_utils_1.ForbiddenException('You can login from 2 devices only'));
            }
            user.devices.push(device);
            await user.save();
        }
        const accessToken = (0, token_utils_1.generateToken)({
            _id: user._id,
            email: user.email,
            provider: user.provider,
            role: user.role
        }, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid: (0, uuid_1.v4)()
        });
        const refreshToken = (0, token_utils_1.generateToken)({
            _id: user._id,
            email: user.email,
            provider: user.provider,
            role: user.role
        }, process.env.JWT_ACCESS_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid: (0, uuid_1.v4)()
        });
        return res.status(200).json((0, Utils_1.SuccessResponse)('User signed in successfully', 200, { tokens: { accessToken, refreshToken } }));
    };
    logout = async (req, res) => {
        const { token: { jti, exp } } = req.loggedInUser;
        const blackListedToken = await this.blackListedRepo.createNewDocument({ tokenId: jti, expirationDate: new Date(exp || Date.now() + 600000) });
        res.status(200).json({ message: 'User logged out successfully', data: { blackListedToken } });
    };
    forgetPassword = async (req, res) => {
        const { email } = req.body;
        const user = await this.userRepo.findOneDocument({ email, provider: Common_1.ProviderEnum.LOCAL });
        if (!user)
            throw new excptions_utils_1.NotFoundException('User Not Foun');
        const otp = Math.floor(Math.random() * 100000).toString();
        const otpExpired = Date.now() + 60 * 60 * 1000;
        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
        const hashedOtp = (0, Utils_1.generateHash)(otp, saltRounds);
        user.OTPS = user.OTPS || [];
        user.OTPS.push({
            value: hashedOtp,
            expiresAt: otpExpired,
            otpType: Common_1.OtpTypesEnum.RESET_PASSWORD,
        });
        await user.save();
        Utils_1.localEmitter.emit('sendEmail', {
            to: user.email,
            subject: 'Reset Your Password',
            content: `
                        <div style="
                        font-family: 'Segoe UI', sans-serif;
                        background-color: #f7f8fa;
                        padding: 30px;
                        text-align: center;
                        ">
                        <div style="
                            background-color: #ffffff;
                            border-radius: 10px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            padding: 40px;
                            display: inline-block;
                        ">
                            <h2 style="color: #333;">🔐 Reset Your Password</h2>
                            <p style="color: #555; font-size: 15px;">
                            Use the code below to reset your password. This code is valid for <b>1 hour</b> only.
                            </p>

                            <div style="
                            margin: 25px 0;
                            display: inline-block;
                            background-color: #007bff;
                            color: white;
                            padding: 12px 25px;
                            border-radius: 8px;
                            font-size: 22px;
                            letter-spacing: 3px;
                            font-weight: bold;
                            ">
                            ${otp}
                            </div>

                            <p style="color: #777; font-size: 13px;">
                            If you didn’t request this, please ignore this email.
                            </p>
                        </div>

                        <p style="color: #aaa; font-size: 12px; margin-top: 25px;">
                            &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
                        </p>
                        </div>
                    `
        });
        res.status(200).json((0, Utils_1.SuccessResponse)("Reset Password OTP sent successfully to your email", 200, { email: user.email }));
    };
    resetPassword = async (req, res) => {
        const { email, otp, newPassword, confirmNewPassword } = req.body;
        const user = await this.userRepo.findOneDocument({ email, provider: Common_1.ProviderEnum.LOCAL });
        if (!user)
            throw new excptions_utils_1.NotFoundException('User Not Foun');
        if (newPassword !== confirmNewPassword)
            throw new excptions_utils_1.BadRequestException("Passwords do not match");
        const resetOtp = user.OTPS?.find((otpObj) => otpObj.otpType === Common_1.OtpTypesEnum.RESET_PASSWORD);
        if (!resetOtp)
            throw new excptions_utils_1.NotFoundException("OTP Not Found");
        if (Date.now() > new Date(resetOtp.expiresAt).getTime())
            throw new excptions_utils_1.BadRequestException("OTP Expired");
        const isOtpMatched = (0, bcrypt_1.compareSync)(otp, resetOtp.value);
        if (!isOtpMatched)
            throw new excptions_utils_1.BadRequestException("Invalid OTP");
        const hashedPassword = (0, Utils_1.generateHash)(newPassword);
        user.password = hashedPassword;
        user.OTPS = (user.OTPS || []).filter((otpObj) => otpObj.otpType !== Common_1.OtpTypesEnum.RESET_PASSWORD);
        await user.save();
        return res.status(200).json((0, Utils_1.SuccessResponse)("Password updated successfully", 200, { email: user.email }));
    };
    updatePassword = async (req, res) => {
        const { _id: userId } = req.loggedInUser.user;
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        if (newPassword !== confirmNewPassword)
            throw new excptions_utils_1.BadRequestException("Passwords do not match");
        if (oldPassword === newPassword)
            throw new excptions_utils_1.BadRequestException("New password must be different from the old password");
        const user = await this.userRepo.findDocumentById(userId);
        if (!user)
            throw new excptions_utils_1.NotFoundException("User Not Found");
        const isPasswordMatched = (0, bcrypt_1.compareSync)(oldPassword, user.password);
        if (!isPasswordMatched)
            throw new excptions_utils_1.BadRequestException("Invalid Old Password");
        const hashedPassword = (0, Utils_1.generateHash)(newPassword);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json((0, Utils_1.SuccessResponse)("Password updated successfully", 200, { email: user.email }));
    };
}
exports.default = new AuthService();
