export enum Gender {
    male = 'male',
    female = 'female',
    undisclosed = 'undisclosed'
}

export interface IAddress {
    street: string;
    city: string;
    postCode: string;
}

export interface IUser {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    tokenNumber: number;
    // gender: Gender;
}