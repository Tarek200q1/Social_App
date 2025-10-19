import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { SignOptions } from "jsonwebtoken";
import { compareSync } from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

import { IRequest, IUser, OtpTypesEnum, ProviderEnum, SignInBodyType, SignUpBodyType, UpdatePasswordBodyType } from "../../../Common";
import { BlackListedtokenRepository, UserRepository } from "../../../DB/Repositories";
import { BlackListedTokensModel, UserModel } from "../../../DB/Models";
import {  generateHash, localEmitter, SuccessResponse } from "../../../Utils";
import { generateToken } from "../../../Utils/Encryption/token.utils";
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "../../../Utils/Errors/excptions.utils";






class AuthService {

    private userRepo: UserRepository = new UserRepository(UserModel)
    private blackListedRepo: BlackListedtokenRepository = new BlackListedtokenRepository(BlackListedTokensModel)

    signUp = async (req: Request, res: Response, next: NextFunction) => {
        const {firstName , lastName , email , password , gender , DOB , phoneNumber}: SignUpBodyType = req.body

        const isEmailExists = await this.userRepo.findOneDocument({email} , 'email')
        if(isEmailExists) throw next(new ConflictException('Email already exists', {invalidEmail: email}))


        // Send OTP
        const otp = Math.floor(Math.random() * 100000).toString()
        localEmitter.emit('sendEmail' , {
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
        })

        const confirmationOtp = {
            value: generateHash(otp),
            expiresAt: Date.now() + 600000,
            otpType: OtpTypesEnum.CONFIRMATION
        }

        const newUser = await this.userRepo.createNewDocument({
            firstName , lastName , email , password , gender , DOB , phoneNumber , OTPS:[confirmationOtp]
        })

        return res.status(201).json(SuccessResponse<IUser>('User created successfully', 201, newUser))
    }

    confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    const user = await this.userRepo.findOneDocument({
        email,
        isVerified: false,
        'OTPS.otpType': OtpTypesEnum.CONFIRMATION
    })
    if (!user) return res.status(404).json({ message: "User Not Found" })

    const storedOtp = user.OTPS?.find(({ otpType }) => otpType === OtpTypesEnum.CONFIRMATION)
    if (!storedOtp) throw next(new NotFoundException('Otp Not found'))

    const isOtpValid = compareSync(otp, storedOtp.value)
    if (!isOtpValid) throw next(new NotFoundException('invalid otp'))

    if (storedOtp.expiresAt < Date.now()) throw next(new NotFoundException('Otp Expired'))

    user.isVerified = true
    user.OTPS = user.OTPS?.filter(({ otpType }) => otpType !== OtpTypesEnum.CONFIRMATION)

    await user.save()
    return res.status(200).json({ message: "Email Confirmed successfully", user })
    }

    signIn = async (req: Request, res: Response, next: NextFunction) => { 
        const {email, password}: SignInBodyType = req.body;

        const user: IUser|null = await this.userRepo.findOneDocument({email})
        if(!user) throw next(new NotFoundException('Invalid email or password'))
        
        const hashPassword = user.password;
        const isPasswordMatched = compareSync(password, hashPassword)
        if(!isPasswordMatched) throw next(new NotFoundException('Invalid email or password'))


          const device = req.headers["user-agent"];
          if (!device) {
                 throw next(new BadRequestException('Invalid email or password'))
            }
          if (!user.devices) user.devices = [];
          if (!user.devices.includes(device)) {
                if (user.devices.length >= 2) {
                    throw next(new ForbiddenException('You can login from 2 devices only'))
            }
            user.devices.push(device); 
            await user.save();
          }
        
        const accessToken = generateToken(
            {
                _id: user._id,
                email: user.email,
                provider: user.provider,
                role: user.role
            },
            process.env.JWT_ACCESS_SECRET as string,
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN  as SignOptions["expiresIn"],
                jwtid: uuidv4()
            }
        )
        const refreshToken = generateToken(
            {
                _id: user._id,
                email: user.email,
                provider: user.provider,
                role: user.role
            },
            process.env.JWT_ACCESS_SECRET as string,
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN  as SignOptions["expiresIn"],
                jwtid: uuidv4()
            }
        )
        
        return res.status(200).json(SuccessResponse('User signed in successfully', 200, { tokens: {accessToken, refreshToken}}))
    }

    logout = async (req: Request, res: Response) => {
        const { token: {jti, exp} } = (req as IRequest).loggedInUser
        const blackListedToken = await this.blackListedRepo.createNewDocument({tokenId: jti, expirationDate: new Date(exp || Date.now() + 600000)})
        res.status(200).json({ message: 'User logged out successfully', data: { blackListedToken }})
    }

    forgetPassword = async (req: Request, res: Response) => {
        const { email } = req.body
        const user: IUser|null = await this.userRepo.findOneDocument({email, provider: ProviderEnum.LOCAL})
        if(!user) throw new NotFoundException('User Not Foun')
        
        const otp = Math.floor(Math.random() * 100000).toString()
        const otpExpired = Date.now() + 60 * 60 * 1000;

        const saltRounds = Number(process.env.SALT_ROUNDS) || 10
        const hashedOtp = generateHash(otp, saltRounds);

        user.OTPS = user.OTPS || []
        user.OTPS.push({
            value: hashedOtp,
            expiresAt: otpExpired,
            otpType: OtpTypesEnum.RESET_PASSWORD,
        });
        await user.save();

        localEmitter.emit('sendEmail', {
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
        })

        res.status(200).json(SuccessResponse<unknown>("Reset Password OTP sent successfully to your email",200,{ email: user.email }
  )
);
    }
    
    resetPassword = async (req: Request, res: Response) => {
        const { email, otp, newPassword, confirmNewPassword } = req.body
        const user =  await this.userRepo.findOneDocument({ email, provider: ProviderEnum.LOCAL })

        if(!user) throw new NotFoundException('User Not Foun')
        if (newPassword !== confirmNewPassword) throw new BadRequestException("Passwords do not match")
        
        const resetOtp = user.OTPS?.find((otpObj) => otpObj.otpType === OtpTypesEnum.RESET_PASSWORD)
        if (!resetOtp) throw new NotFoundException("OTP Not Found");

        if (Date.now() > new Date(resetOtp.expiresAt).getTime()) throw new BadRequestException("OTP Expired");

        const isOtpMatched = compareSync(otp, resetOtp.value) 
        if (!isOtpMatched) throw new BadRequestException("Invalid OTP")

        const hashedPassword = generateHash(newPassword);
        user.password = hashedPassword;

        user.OTPS = (user.OTPS || []).filter((otpObj) => otpObj.otpType !== OtpTypesEnum.RESET_PASSWORD)
        await user.save();

        return res.status(200).json(SuccessResponse("Password updated successfully", 200, { email: user.email }))

    }

    updatePassword = async (req: Request, res: Response) => {
        const { _id: userId} = (req as IRequest).loggedInUser.user;
        const { oldPassword, newPassword, confirmNewPassword }: UpdatePasswordBodyType = req.body

        if (newPassword !== confirmNewPassword) throw new BadRequestException("Passwords do not match")
        
        if (oldPassword === newPassword)  throw new BadRequestException("New password must be different from the old password")
        
        const user: IUser | null = await this.userRepo.findDocumentById(userId as mongoose.Schema.Types.ObjectId)
        if (!user) throw new NotFoundException("User Not Found")
        
        const isPasswordMatched = compareSync(oldPassword, user.password);
        if (!isPasswordMatched) throw new BadRequestException("Invalid Old Password");

        const hashedPassword = generateHash(newPassword);
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json(SuccessResponse("Password updated successfully", 200, { email: user.email }));
    }
}

export default new AuthService()