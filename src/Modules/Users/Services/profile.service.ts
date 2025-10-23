import { Request, Response } from "express";
import { BadRequestException, S3ClientService, SuccessResponse } from "../../../Utils";
import { FriendShipStatusEnum, IFriendShip, IRequest, IUser } from "../../../Common";
import { ConversationRepository, FriendShipRepository, UserRepository } from "../../../DB/Repositories";
import { UserModel } from "../../../DB/Models";
import mongoose, { Types } from "mongoose";
import { FilterQuery } from "mongoose";




export class ProfileService {

    private s3Client = new S3ClientService()
    private userRepo = new UserRepository(UserModel)
    private friendShipRepo = new FriendShipRepository()
    private conversationRepo = new ConversationRepository()

    // upload profile picture
    uploadProfilePicture = async (req: Request, res: Response) => {
        const {file} = req
        const {user} = (req as IRequest).loggedInUser
        if(!file) throw new BadRequestException('Please upload a file')

        const {key, url} = await this.s3Client.uploadFileOnS3(file, `${user._id}/profile`)

        user.profilePicture = key
        await user.save()
        
        res.json(SuccessResponse<unknown>('Profile picture uploaded successfully', 200, {key, url}))
    }

    reNewSignedUrl = async(req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser
        const { key, keyType }: { key: string, keyType: 'profilePicture' | 'coverPicture'} = req.body

        if(user[keyType] !== key) throw new BadRequestException('Inavalid key')
        const url = await this.s3Client.getFileWithSignedUrl(key)
        res.json(SuccessResponse<unknown>('Signed url renewed successfully', 200, { key, url }))
    }

    // delete account
    deleteAccount = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser
        const deletedDocument = await this.userRepo.deleteByIdDocument(user._id as mongoose.Schema.Types.ObjectId)
        if(!deletedDocument) throw new BadRequestException('User not found')

        // delete profile picture from S3 
        const deletedResponse = await this.s3Client.DeleteFileFromS3(deletedDocument?.profilePicture as string)

        res.json(SuccessResponse<unknown>('Account deleted successfully', 200, deletedResponse))
    }

    // update profile
    updateProfile = async(req: Request, res: Response) => {
        const {firstName, lastName, email, password, gender, phoneNumber, DOB}: IUser = req.body

        await this.userRepo.updateOneDocument(
            { _id: (req as IRequest).loggedInUser.user._id as mongoose.Schema.Types.ObjectId },
            { $set:{firstName, lastName, email, password, gender, phoneNumber, DOB}},
            {new:true}
        )

        res.json(SuccessResponse<IUser>('Profile updated successfully', 200))
    }

    getProfileData = async(req: Request, res: Response) => {
        const {user: { _id }} = (req as IRequest).loggedInUser
        const user = await this.userRepo.findDocumentById(_id as mongoose.Schema.Types.ObjectId)
        if (!user) throw new BadRequestException('User not found')
        res.json(SuccessResponse<IUser>('Profile data fetched successfully', 200, user))
    }

    // list all user
    listUsers = async(req: Request, res: Response) => {
        const users = await this.userRepo.findDocuments()
        res.json(SuccessResponse<IUser[]>('Users fetched successfully', 200, users))
    }

    // uploadCoverPicture

    // send friend ship
    sendFriendShipRequest = async(req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser
        const { requestToId } = req.body

        const user = await this.userRepo.findOneDocument({ _id: requestToId as mongoose.Types.ObjectId })
        if(!user) throw new BadRequestException('User not found')

        await this.friendShipRepo.createNewDocument({requestFromId: _id as Types.ObjectId, requestToId})

        res.json(SuccessResponse<unknown>('Friend ship request sent successfully'))
    }

    // list requests
    listRequests = async(req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser
        const { status } = req.query

        const filters: FilterQuery<IFriendShip> = { status: status ? status : FriendShipStatusEnum.PENDING }
        if(filters.status == FriendShipStatusEnum.ACCEPTED) filters.$or = [{requestToId: _id}, {requestFromId: _id}]
        else filters.requestToId = _id

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
        })

        const group = await this.conversationRepo.findDocuments({ type: 'group', members: { $in: _id } })

        res.json(SuccessResponse('Request fetched successfully', 200,{ requests, group }))
    }
    
    //respond to request 
    respondToFriendShipRequests = async(req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser
        const { friendRequestId, response } = req.body

        const friendRequest = await this.friendShipRepo.findOneDocument({_id: friendRequestId, requestToId: _id, status: FriendShipStatusEnum.PENDING})
        if(!friendRequest) throw new BadRequestException('Friend request not found')

        friendRequest.status = response
        await friendRequest.save()

        res.json(SuccessResponse('Requests fetched successfully', 200, friendRequest))
    }

    // create group
    createGroup = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser
        const { name, memberIds } = req.body

        const members = await this.userRepo.findDocuments({ _id: { $in: memberIds } })
        if(members.length !== memberIds.length) throw new BadRequestException('Members not found')

        const friendShip = await this.friendShipRepo.findDocuments({
            $or: [
                { requestFromId: _id, requestToId: { $in: memberIds } },
                { requestFromId: { $in:memberIds }, requestToId: _id}
            ],
            status: FriendShipStatusEnum.ACCEPTED
        })
        if(friendShip.length !== memberIds.length) throw new BadRequestException('Members not found')
        
        const group = await this.conversationRepo.createNewDocument({
            type: 'group',
            name,
            members: [ _id, ...memberIds ]
        })

        res.json(SuccessResponse('Group created successfully', 200, group))
    }
}



export default new ProfileService