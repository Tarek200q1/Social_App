import { IFriendShip } from "../../Common";
import { FriendShipModel } from "../Models";
import { BaseRepository } from "./base.repository";



export  class FriendShipRepository extends BaseRepository<IFriendShip> {
    constructor() {
        super(FriendShipModel)
    }
}