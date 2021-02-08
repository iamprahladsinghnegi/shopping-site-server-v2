import crypto from 'crypto';

export const generateRendomString = (): string => {
    return crypto.randomBytes(32).toString('hex')
}