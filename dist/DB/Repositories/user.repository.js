"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
class UserRepository extends base_repository_1.BaseRepository {
    _usermodel;
    constructor(_usermodel) {
        super(_usermodel);
        this._usermodel = _usermodel;
    }
}
exports.UserRepository = UserRepository;
