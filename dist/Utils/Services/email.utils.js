"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localEmitter = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
const sendEmail = async ({ to, cc = 'tarekmohamed@email.com', subject, content, attachments = [] }) => {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const info = await transporter.sendMail({
        from: `No-reply <${process.env.USER_EMAIL}>`,
        to,
        cc,
        subject,
        html: content,
        attachments
    });
    return info;
};
exports.sendEmail = sendEmail;
const node_events_1 = require("node:events");
exports.localEmitter = new node_events_1.EventEmitter();
exports.localEmitter.on('sendEmail', (args) => {
    (0, exports.sendEmail)(args);
});
