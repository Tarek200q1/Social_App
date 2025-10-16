"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3ClientService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const node_fs_1 = __importDefault(require("node:fs"));
class S3ClientService {
    s3Client = new client_s3_1.S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
    key_folder = process.env.AWS_KEY_FOLDER;
    async getFileWithSignedUrl(key, expiresIn = 60) {
        const getCommand = new client_s3_1.GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, getCommand, { expiresIn });
    }
    async uploadFileOnS3(file, key) {
        console.log(file);
        const keyName = `${this.key_folder}/${key}/${Date.now()}-${file.originalname}`;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: keyName,
            Body: node_fs_1.default.createReadStream(file.path),
            ContentType: file.mimetype,
        };
        const putCommand = new client_s3_1.PutObjectCommand(params);
        await this.s3Client.send(putCommand);
        const signedUrl = await this.getFileWithSignedUrl(keyName);
        return {
            key: keyName,
            url: signedUrl
        };
    }
    async DeleteFileFromS3(key) {
        const deleteCommand = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });
        return await this.s3Client.send(deleteCommand);
    }
}
exports.S3ClientService = S3ClientService;
