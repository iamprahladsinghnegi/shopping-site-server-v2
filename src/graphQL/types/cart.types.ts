import { Min } from "class-validator";
import { ArgsType, Field, InputType, Int, ObjectType } from "type-graphql";

@InputType({ description: "For update item qunatity in cart" })
@ArgsType()
export class AdjustItemQuantity {
    // @Field(() => Int, { nullable: true })
    // take?: number;

    @Field(() => String)
    cartId: string;

    @Field()
    itemId: string;

    @Field(() => Int, { defaultValue: 1 })
    @Min(1)
    quantity: number;

}

@InputType({ description: "details for adding item to cart" })
@ArgsType()
export class AddTOCart extends AdjustItemQuantity {
    @Field(() => String, { nullable: true })
    userId?: string;

}

@ObjectType()
export class CartItem {
    @Field(() => String)
    itemId: string;

    @Field(() => Int)
    quantity: number;
}

@ObjectType()
export class CartResponse {
    @Field(() => String)
    cartId?: string

    @Field(() => [CartItem])
    items: CartItem[];

    @Field(() => Int, { defaultValue: 0 })
    count: number;
}
