import { ObjectType, Field, ArgsType, InputType, createUnionType, InterfaceType } from "type-graphql";
import { CartResponse } from "./cart.types";

@InterfaceType()
export class IError {
    @Field(() => String)
    message: string

    @Field(() => String)
    errorCode: number
}

@ObjectType({ implements: IError })
export class AllreadyExistsError implements IError {

    message: string;

    errorCode: number;

    // extra fields here
    @Field(() => Boolean)
    isUserExists: boolean
}

@ObjectType({ implements: IError })
export class HashedPassowdError implements IError {

    message: string;

    errorCode: number;
    // extra fields here
    @Field(() => Boolean)
    uanbleToHash: boolean;
}

@ObjectType({ implements: IError })
export class SomethingWentWrongError implements IError {
    message: string;

    errorCode: number;

    // extra fields here
    @Field(() => Boolean)
    isSomethingWorng: boolean
}

@ObjectType()
export class RegisterSuccess {
    @Field(() => String)
    userId: string;
}

// response for register 
export const RegisterUserResponse = createUnionType({
    name: "RegisterUserResponse", // the name of the GraphQL union
    types: () => [AllreadyExistsError, HashedPassowdError, SomethingWentWrongError, RegisterSuccess] as const, // function that returns tuple of object types classes
    // our implementation of detecting returned object type
    resolveType: value => {
        if ("isUserExists" in value) {
            return AllreadyExistsError; // we can return object type class (the one with `@ObjectType()`)
        }
        // if ("uanbleToHash" in value) {
        //     return "Actor"; // or the schema name of the type as a string
        // }
        if ("uanbleToHash" in value) {
            return HashedPassowdError;
        }
        if ("isSomethingWorng" in value) {
            return SomethingWentWrongError;
        }
        if ("userId" in value) {
            return RegisterSuccess;
        }
        return undefined;
    },
});


@ObjectType({ implements: IError })
export class EamilNotExistsError implements IError {

    message: string;

    errorCode: number;

    // extra fields here
    @Field(() => Boolean)
    isEmailExists: boolean
}


@ObjectType({ implements: IError })
export class PasswordNotMatchError implements IError {

    message: string;

    errorCode: number;

    // extra fields here
    @Field(() => Boolean)
    isPasswordMatched: boolean
}


@ObjectType()
export class User {
    @Field(() => String)
    userId: string;

    @Field(() => String)
    email: string;

    // @Field(() => String)
    password?: string;

    @Field(() => String)
    firstName: string;

    @Field(() => String, { nullable: true })
    lastName?: string;

    // @Field(() => Int, { defaultValue: 0 })
    tokenNumber: number;

    @Field(() => CartResponse)
    cart: CartResponse;

}


@ObjectType()
export class LoginSuccess {
    @Field()
    accessToken: string;

    @Field(() => User)
    user: User;
}

// response for register 
export const LoginResponse = createUnionType({
    name: "LoginResponse",
    types: () => [EamilNotExistsError, PasswordNotMatchError, LoginSuccess] as const,
    resolveType: value => {
        if ("isPasswordMatched" in value) {
            return PasswordNotMatchError;
        }
        if ("isEmailExists" in value) {
            return EamilNotExistsError;
        }
        if ("user" in value) {
            return LoginSuccess;
        }
        return undefined;
    },
});


@InputType({ description: "dteails for register a user" })
@ArgsType()
export class RegisterUser implements Partial<User> {
    @Field(() => String)
    email: string;

    @Field(() => String)
    password: string;

    @Field()
    firstName: string;

    @Field(() => String, { nullable: true })
    lastName?: string;
}



// mutation LoginUser($email: String!, $password: String!){
//     loginUser(email: $email, password: $password){
//         __typename
//      ...on EamilNotExistsError{
//             message
//             errorCode
//             isEmailExists
//         }
//   	...on PasswordNotMatchError{
//             message
//             errorCode
//             isPasswordMatched
//         }
//     ...on LoginSuccess{
//             accessToken
//             user{
//                 userId
//                 email
//                 firstName
//                 lastName
//                 cart{
//                     cartId
//                     count
//                 }
//             }
//         }
//     }