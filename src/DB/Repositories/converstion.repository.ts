import { BaseRepository } from "./base.repository";
import { IConverstion } from "../../Common/Interfaces";
import { converstionModel } from "../Models";


export class ConversationRepository extends BaseRepository<IConverstion>{
    constructor() {
        super(converstionModel)
    }
}
