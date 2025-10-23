import mongoose, { Types } from "mongoose";
import { ConversationTypeEnum } from "../../Common";
import { IConverstion } from "../../Common/Interfaces";



const converstionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: Object.values(ConversationTypeEnum),
        default: ConversationTypeEnum.DIRECT 
    },
    name: String,
    members: [{ type: Types.ObjectId, ref: 'User' }]
})

export const converstionModel = mongoose.model<IConverstion>('Converstions', converstionSchema)