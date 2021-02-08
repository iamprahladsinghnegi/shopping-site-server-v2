import { ObjectType, Field, ArgsType, InputType } from "type-graphql";
import { CartResponse } from "./cart.types";

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