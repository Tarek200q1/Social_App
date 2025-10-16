"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackListedtokenRepository = void 0;
const base_repository_1 = require("./base.repository");
class BlackListedtokenRepository extends base_repository_1.BaseRepository {
    _blackListedtoken;
    constructor(_blackListedtoken) {
        super(_blackListedtoken);
        this._blackListedtoken = _blackListedtoken;
    }
}
exports.BlackListedtokenRepository = BlackListedtokenRepository;
