import mongoose from "mongoose";
import { IBlackListedToken } from "../../Common";

const blackListedTokensSchema = new mongoose.Schema<IBlackListedToken>({
    tokenId: {
        type: String,
        required: true,
    },
    expirationDate: {
        type: Date,
        required: true
    } 
})

const BlackListedTokensModel = mongoose.model<IBlackListedToken>('BlackListedTokens' , blackListedTokensSchema)
export { BlackListedTokensModel }