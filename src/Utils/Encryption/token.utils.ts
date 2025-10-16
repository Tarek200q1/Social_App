import jwt, {JwtPayload, Secret, SignOptions, VerifyOptions} from 'jsonwebtoken'
export const generateToken = (
    payload: string | Buffer | object,
    secretOrPrivateKey: Secret = process.env.JWT_ACCESS_SECRET as string,
    option?: SignOptions
): string => {
    return jwt.sign(payload , secretOrPrivateKey , option)
}

export const verifyToken = (
    token: string,
    secretOrPublicKey: Secret = process.env.JWT_ACCESS_SECRET as string,
    option?: VerifyOptions
): JwtPayload => {
    return jwt.verify(token , secretOrPublicKey , option) as JwtPayload
}