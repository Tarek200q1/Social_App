import { Document } from "mongoose";
import { GenderEnum, OtpTypesEnum, ProviderEnum, RoleEnum } from "..";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

interface IOTP {
    value: string;
    expiresAt: number;
    otpType: OtpTypesEnum
}

interface IUser extends Document{
    firstName: string;
    lastName: string;
    email: string;
    password: string
    role: RoleEnum;
    gender: GenderEnum;
    DOB?: Date;
    profilePicture?: string;
    coverPicture?: string;
    provider: ProviderEnum;
    googleId?: string;
    phoneNumber?: string;
    isVerified?: Boolean;
    OTPS?: IOTP[],
    devices: string[],
}


interface IBlackListedToken extends Document {
    tokenId: string;
    expirationDate: Date;
}



interface IEmailArgument {
    to: string;
    cc?: string;
    subject: string;
    content: string;
    attachments?: [];
}


interface IRequest extends Request {
    loggedInUser: {user: IUser, token: JwtPayload}
}
export {IUser, IEmailArgument, IRequest, IBlackListedToken}


