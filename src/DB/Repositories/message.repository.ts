import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { IMessage } from "../../Common/Interfaces";

export class MessagesRepository extends BaseRepository<IMessage>{
    constructor(protected _messagemodel: Model<IMessage>){
        super(_messagemodel)
    }
}