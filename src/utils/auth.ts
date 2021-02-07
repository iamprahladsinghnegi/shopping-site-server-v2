import { UserDocument } from '../database/model/user.model'
import { sign } from "jsonwebtoken";


export const createAccessToken = (user: UserDocument) => {
    return sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });
}

export const createRefreshToken = (user: UserDocument) => {
    console.log('users current refreshtoken ', user.tokenNumber)
    return sign({ userId: user._id, tokenVersion: user.tokenNumber }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
}