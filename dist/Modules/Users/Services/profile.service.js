"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const Utils_1 = require("../../../Utils");
const Repositories_1 = require("../../../DB/Repositories");
const Models_1 = require("../../../DB/Models");
class ProfileService {
    s3Client = new Utils_1.S3ClientService();
    userRepo = new Repositories_1.UserRepository(Models_1.UserModel);
    uploadProfilePicture = async (req, res) => {
        const { file } = req;
        const { user } = req.loggedInUser;
        if (!file)
            throw new Utils_1.BadRequestException('Please upload a file');
        const { key, url } = await this.s3Client.uploadFileOnS3(file, `${user._id}/profile`);
        user.profilePicture = key;
        await user.save();
        res.json((0, Utils_1.SuccessResponse)('Profile picture uploaded successfully', 200, { key, url }));
    };
    reNewSignedUrl = async (req, res) => {
        const { user } = req.loggedInUser;
        const { key, keyType } = req.body;
        if (user[keyType] !== key)
            throw new Utils_1.BadRequestException('Inavalid key');
        const url = await this.s3Client.getFileWithSignedUrl(key);
        res.json((0, Utils_1.SuccessResponse)('Signed url renewed successfully', 200, { key, url }));
    };
    deleteAccount = async (req, res) => {
        const { user } = req.loggedInUser;
        const deletedDocument = await this.userRepo.deleteByIdDocument(user._id);
        if (!deletedDocument)
            throw new Utils_1.BadRequestException('User not found');
        // delete profile picture from S3 
        const deletedResponse = await this.s3Client.DeleteFileFromS3(deletedDocument?.profilePicture);
        res.json((0, Utils_1.SuccessResponse)('Account deleted successfully', 200, deletedResponse));
    };
}
exports.ProfileService = ProfileService;
exports.default = new ProfileService();
