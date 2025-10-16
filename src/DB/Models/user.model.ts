import mongoose from "mongoose";
import { GenderEnum, IUser, OtpTypesEnum, ProviderEnum, RoleEnum } from "../../Common";


const userSchema = new mongoose.Schema<IUser>({
    firstName: {
        type: String,
        required: true,
        minLength: [3 , 'First name must be at least characters long']
    },
    lastName: {
        type: String,
        required: true,
        minLength: [3 , 'Last name must be at least characters long']
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true,
            name: "idx_email_unique"
        }
    },
    isVerified: {
        type: Boolean,
        default: false      
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: RoleEnum,
        default: RoleEnum.USER
    },
    gender: {
        type: String,
        enum: GenderEnum,
        default: GenderEnum.OTHER
    },
    DOB: Date,
    profilePicture: String,
    coverPicture: String,
    provider: {
        type: String,
        enum: ProviderEnum,
        default: ProviderEnum.LOCAL
    },
    googleId: String,
    phoneNumber: String,
    OTPS: [{
        value: {type: String , required: true},
        expiresAt: {type: Date , default: Date.now() + 600000},
        otpType: {type: String , enum:OtpTypesEnum , required: true}
    }],
    devices: {
        type: [String],
        default: []
    }

})

const UserModel = mongoose.model('User' , userSchema)
export {UserModel}