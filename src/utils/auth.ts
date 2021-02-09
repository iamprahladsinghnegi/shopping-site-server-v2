import { UserDocument } from '../database/model/user.model'
import { sign } from "jsonwebtoken";


export const createAccessToken = (user: UserDocument) => {
    return sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });
}

export const createRefreshToken = (user: UserDocument) => {
    return sign({ userId: user.userId, tokenNumber: user.tokenNumber }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
}