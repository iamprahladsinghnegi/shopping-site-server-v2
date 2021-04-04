import { Response } from 'express';

export const sendRefreshToken = (res: Response, token: string) => {
    res.cookie('abcid',
        token,
        {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/refresh_token'
        }
    )
}