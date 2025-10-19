"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Common_1 = require("../../Common");
const Utils_1 = require("../../Utils");
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: [3, 'First name must be at least characters long']
    },
    lastName: {
        type: String,
        required: true,
        minLength: [3, 'Last name must be at least characters long']
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
        enum: Common_1.RoleEnum,
        default: Common_1.RoleEnum.USER
    },
    gender: {
        type: String,
        enum: Common_1.GenderEnum,
        default: Common_1.GenderEnum.OTHER
    },
    DOB: Date,
    profilePicture: String,
    coverPicture: String,
    provider: {
        type: String,
        enum: Common_1.ProviderEnum,
        default: Common_1.ProviderEnum.LOCAL
    },
    googleId: String,
    phoneNumber: String,
    OTPS: [{
            value: { type: String, required: true },
            expiresAt: { type: Date, default: Date.now() + 600000 },
            otpType: { type: String, enum: Common_1.OtpTypesEnum, required: true }
        }],
    devices: {
        type: [String],
        default: []
    }
});
userSchema.pre('save', function () {
    if (this.isModified('password')) {
        // hsh password
        this.password = (0, Utils_1.generateHash)(this.password);
    }
    if (this.isModified('phoneNumber')) {
        // Encrypt phone number
        this.phoneNumber = (0, Utils_1.encrypt)(this.phoneNumber);
    }
});
const UserModel = mongoose_1.default.model('User', userSchema);
exports.UserModel = UserModel;
