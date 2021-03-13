import crypto from 'crypto';

export const generateRendomString = (): string => {
    return `0x${crypto.randomBytes(32).toString('hex')}`
}