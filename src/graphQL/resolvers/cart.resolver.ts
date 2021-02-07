import { Resolver, Query, Args, Mutation, Arg } from "type-graphql";
import { AdjustItemQuantity, AddTOCart, CartResponse } from "../types/cart.types";
import { CartDocument, CartModel, ICart } from "../../database/model/cart.model";
import { UserDocument, UserModel } from "../../database/model/user.model";

@Resolver()
export class CartResolver {
    // cart details by cardId
    @Query(() => CartResponse)
    async getCartDetailsByCartId(
        @Arg('cartId') cartId: string
    ): Promise<CartResponse> {
        let cartResponse: CartResponse = { items: [], count: 0 };
        const cartDetails: CartDocument = await CartModel.findOne({ _id: cartId }, { "items.item": 1, "items.quantity": 1 })
        if (!cartDetails) {
            return cartResponse
        }
        cartDetails.items.forEach(item => {
            cartResponse.items.push({ item: item.item, quantity: item.quantity })
        })
        cartResponse.count = cartResponse.items.length
        return cartResponse
    }

    // cart details by userId
    @Query(() => CartResponse)
    async getCartDetailsByUserId(
        @Arg('userId') userId: string
    ): Promise<CartResponse> {
        let cartResponse: CartResponse = { items: [], count: 0 };
        const userDetails: UserDocument = await UserModel.findOne({ _id: userId }, { "cart": 1 }).populate('cart')
        if (!userDetails || !userDetails.cart || !userDetails.cart.items) {
            return cartResponse
        }
        userDetails.cart.items.forEach((item: ICart) => {
            cartResponse.items.push({ item: item.item, quantity: item.quantity })
        })
        cartResponse.count = cartResponse.items.length
        return cartResponse
    }

    @Mutation(() => Boolean)
    async AddToCart(@Args() { itemId, quantity, userId, cartId }: AddTOCart): Promise<boolean> {
        const cart = await CartModel.updateOne({ _id: cartId }, { $push: { "items": { quantity, item: itemId } } })
        if (!cart) {
            throw new Error('unbale to add item to cart!')
        }
        console.log(`item added for user ${userId}`);
        return true
    }

    @Mutation(() => Boolean)
    async adjustItemQyantity(@Args() { itemId, quantity, cartId }: AdjustItemQuantity): Promise<boolean> {
        const cart = await CartModel.updateOne({ _id: cartId, "items.item": itemId }, { $set: { "items.$.quantity": quantity } })
        if (!cart || cart.nModified === 0) {
            throw new Error('unbale to adjust item quantity!')
        }
        console.log(`successfully adjusted item quantity `);
        return true
    }

}


