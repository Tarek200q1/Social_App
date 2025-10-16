import { Model } from "mongoose";
import { IBlackListedToken } from "../../Common";
import { BaseRepository } from "./base.repository";



export class BlackListedtokenRepository extends BaseRepository<IBlackListedToken> {
    constructor(protected _blackListedtoken: Model<IBlackListedToken>) {
        super(_blackListedtoken)
    }
}