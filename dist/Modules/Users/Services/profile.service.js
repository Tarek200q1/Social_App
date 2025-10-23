"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const Utils_1 = require("../../../Utils");
const Common_1 = require("../../../Common");
const Repositories_1 = require("../../../DB/Repositories");
const Models_1 = require("../../../DB/Models");
class ProfileService {
    s3Client = new Utils_1.S3ClientService();
    userRepo = new Repositories_1.UserRepository(Models_1.UserModel);
    friendShipRepo = new Repositories_1.FriendShipRepository();
    conversationRepo = new Repositories_1.ConversationRepository();
    // upload profile picture
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
    // delete account
    deleteAccount = async (req, res) => {
        const { user } = req.loggedInUser;
        const deletedDocument = await this.userRepo.deleteByIdDocument(user._id);
        if (!deletedDocument)
            throw new Utils_1.BadRequestException('User not found');
        // delete profile picture from S3 
        const deletedResponse = await this.s3Client.DeleteFileFromS3(deletedDocument?.profilePicture);
        res.json((0, Utils_1.SuccessResponse)('Account deleted successfully', 200, deletedResponse));
    };
    // update profile
    updateProfile = async (req, res) => {
        const { firstName, lastName, email, password, gender, phoneNumber, DOB } = req.body;
        await this.userRepo.updateOneDocument({ _id: req.loggedInUser.user._id }, { $set: { firstName, lastName, email, password, gender, phoneNumber, DOB } }, { new: true });
        res.json((0, Utils_1.SuccessResponse)('Profile updated successfully', 200));
    };
    getProfileData = async (req, res) => {
        const { user: { _id } } = req.loggedInUser;
        const user = await this.userRepo.findDocumentById(_id);
        if (!user)
            throw new Utils_1.BadRequestException('User not found');
        res.json((0, Utils_1.SuccessResponse)('Profile data fetched successfully', 200, user));
    };
    // list all user
    listUsers = async (req, res) => {
        const users = await this.userRepo.findDocuments();
        res.json((0, Utils_1.SuccessResponse)('Users fetched successfully', 200, users));
    };
    // uploadCoverPicture
    // send friend ship
    sendFriendShipRequest = async (req, res) => {
        const { user: { _id } } = req.loggedInUser;
        const { requestToId } = req.body;
        const user = await this.userRepo.findOneDocument({ _id: requestToId });
        if (!user)
            throw new Utils_1.BadRequestException('User not found');
        await this.friendShipRepo.createNewDocument({ requestFromId: _id, requestToId });
        res.json((0, Utils_1.SuccessResponse)('Friend ship request sent successfully'));
    };
    // list requests
    listRequests = async (req, res) => {
        const { user: { _id } } = req.loggedInUser;
        const { status } = req.query;
        const filters = { status: status ? status : Common_1.FriendShipStatusEnum.PENDING };
        if (filters.status == Common_1.FriendShipStatusEnum.ACCEPTED)
            filters.$or = [{ requestToId: _id }, { requestFromId: _id }];
        else
            filters.requestToId = _id;
        const requests = await this.friendShipRepo.findDocuments(filters, undefined, {
            populate: [
                {
                    path: 'requestFromId',
                    select: 'firstName lastName profilePicture'
                },
                {
                    path: 'requestToId',
                    select: 'firstName lastName profilePicture'
                },
            ]
        });
        const group = await this.conversationRepo.findDocuments({ type: 'group', members: { $in: _id } });
        res.json((0, Utils_1.SuccessResponse)('Request fetched successfully', 200, { requests, group }));
    };
    //respond to request 
    respondToFriendShipRequests = async (req, res) => {
        const { user: { _id } } = req.loggedInUser;
        const { friendRequestId, response } = req.body;
        const friendRequest = await this.friendShipRepo.findOneDocument({ _id: friendRequestId, requestToId: _id, status: Common_1.FriendShipStatusEnum.PENDING });
        if (!friendRequest)
            throw new Utils_1.BadRequestException('Friend request not found');
        friendRequest.status = response;
        await friendRequest.save();
        res.json((0, Utils_1.SuccessResponse)('Requests fetched successfully', 200, friendRequest));
    };
    // create group
    createGroup = async (req, res) => {
        const { user: { _id } } = req.loggedInUser;
        const { name, memberIds } = req.body;
        const members = await this.userRepo.findDocuments({ _id: { $in: memberIds } });
        if (members.length !== memberIds.length)
            throw new Utils_1.BadRequestException('Members not found');
        const friendShip = await this.friendShipRepo.findDocuments({
            $or: [
                { requestFromId: _id, requestToId: { $in: memberIds } },
                { requestFromId: { $in: memberIds }, requestToId: _id }
            ],
            status: Common_1.FriendShipStatusEnum.ACCEPTED
        });
        if (friendShip.length !== memberIds.length)
            throw new Utils_1.BadRequestException('Members not found');
        const group = await this.conversationRepo.createNewDocument({
            type: 'group',
            name,
            members: [_id, ...memberIds]
        });
        res.json((0, Utils_1.SuccessResponse)('Group created successfully', 200, group));
    };
}
exports.ProfileService = ProfileService;
exports.default = new ProfileService;
