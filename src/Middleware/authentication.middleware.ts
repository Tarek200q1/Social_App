import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../Utils/Encryption/token.utils";
import { BlackListedtokenRepository, UserRepository } from "../DB/Repositories";
import { BlackListedTokensModel, UserModel } from "../DB/Models";
import { IRequest, IUser } from "../Common";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../Utils/Errors/excptions.utils";

const userRepo = new UserRepository(UserModel)
const blackListedRepo = new BlackListedtokenRepository(BlackListedTokensModel)


export const authentication = async (req: Request, res: Response, next: NextFunction) => {
    const {authorization: accessToken} = req.headers;
    if(!accessToken) throw next(new BadRequestException('Please login first'));

    const [prefix, token] = accessToken.split(' ')
    if(prefix !== process.env.JWT_PREFIX) throw next(new UnauthorizedException('invalid token'))

    const dacodedData = verifyToken(token, process.env.JWT_REFRESH_SECRET as string)
    if(!dacodedData._id) throw next(new UnauthorizedException('invalid payload'));

     const blackListedToken = await blackListedRepo.findOneDocument({ tokenId: dacodedData.jti })   
     if(blackListedToken) throw next(new UnauthorizedException('Your session is expired please to login again'))
    
    const user: IUser | null = await userRepo.findDocumentById(dacodedData._id, '-password')
    if(!user) throw next(new NotFoundException('Please register first'));
    
    (req as IRequest).loggedInUser = {user, token: dacodedData as JwtPayload}
    return next()
}