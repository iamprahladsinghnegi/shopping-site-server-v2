import { ObjectType, Field, ArgsType, InputType } from "type-graphql";

@ObjectType()
export class User {
    @Field(() => String)
    email: string;

    @Field(() => String)
    password?: string;

    @Field()
    firstName: string;

    @Field(() => String, { nullable: true })
    lastName?: string;

    // @Field(() => Int, { defaultValue: 0 })
    tokenNumber: number;

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