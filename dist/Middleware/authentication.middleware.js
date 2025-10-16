"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const token_utils_1 = require("../Utils/Encryption/token.utils");
const Repositories_1 = require("../DB/Repositories");
const Models_1 = require("../DB/Models");
const excptions_utils_1 = require("../Utils/Errors/excptions.utils");
const userRepo = new Repositories_1.UserRepository(Models_1.UserModel);
const blackListedRepo = new Repositories_1.BlackListedtokenRepository(Models_1.BlackListedTokensModel);
const authentication = async (req, res, next) => {
    const { authorization: accessToken } = req.headers;
    if (!accessToken)
        throw next(new excptions_utils_1.BadRequestException('Please login first'));
    const [prefix, token] = accessToken.split(' ');
    if (prefix !== process.env.JWT_PREFIX)
        throw next(new excptions_utils_1.UnauthorizedException('invalid token'));
    const dacodedData = (0, token_utils_1.verifyToken)(token, process.env.JWT_REFRESH_SECRET);
    if (!dacodedData._id)
        throw next(new excptions_utils_1.UnauthorizedException('invalid payload'));
    const blackListedToken = await blackListedRepo.findOneDocument({ tokenId: dacodedData.jti });
    if (blackListedToken)
        throw next(new excptions_utils_1.UnauthorizedException('Your session is expired please to login again'));
    const user = await userRepo.findDocumentById(dacodedData._id, '-password');
    if (!user)
        throw next(new excptions_utils_1.NotFoundException('Please register first'));
    req.loggedInUser = { user, token: dacodedData };
    return next();
};
exports.authentication = authentication;
