import { Min } from "class-validator";
import { ArgsType, Field, InputType, Int, ObjectType } from "type-graphql";

@InputType({ description: "For update item qunatity in cart" })
@ArgsType()
export class AdjustCartItem {
    @Field(() => String)
    cartId: string;

    @Field()
    itemId: string;
}
@ArgsType()
export class AdjustCardItemQuantity extends AdjustCartItem {
    @Field(() => Int, { defaultValue: 1 })
    @Min(1)
    quantity: number;
}

@ArgsType()
export class AdjustCardItemSize extends AdjustCartItem {
    @Field(() => String)
    size: string;
}

@InputType({ description: "details for adding item to cart" })
@ArgsType()
export class AddTOCart extends AdjustCardItemQuantity {
    @Field(() => String, { nullable: true })
    userId?: string;

}

@ObjectType()
export class CartItem {
    @Field(() => String)
    itemId: string;

    @Field(() => String)
    size: string;

    @Field(() => Int)
    quantity: number;

    @Field(() => Int)
    price: number;

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    discount: number;
}

@ObjectType()
export class CartResponse {
    @Field(() => String, { nullable: true })
    cartId: string

    @Field(() => [CartItem])
    items: CartItem[];

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    count: number;
}
