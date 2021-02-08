import { Resolver, Query, Args, Mutation, Arg } from "type-graphql";
import { AdjustItemQuantity, AddTOCart, CartResponse } from "../types/cart.types";
import { CartDocument, CartModel } from "../../database/model/cart.model";
import { ICart } from '../../database/types/cart'
import { UserDocument, UserModel } from "../../database/model/user.model";
import { ItemModel } from "../../database/model/item.model";

@Resolver()
export class CartResolver {
    // cart details by cardId
    @Query(() => CartResponse)
    async getCartDetailsByCartId(
        @Arg('cartId') cartId: string
    ): Promise<CartResponse> {
        let cartResponse: CartResponse = { items: [], count: 0 };
        const cartDetails: CartDocument = await CartModel.findOne({ cartId }, { "items.itemId": 1, "items.quantity": 1 })
        if (!cartDetails) {
            return cartResponse
        }
        cartDetails.items.forEach(item => {
            cartResponse.items.push({ itemId: item.itemId, quantity: item.quantity })
        })
        cartResponse.count = cartResponse.items.length
        cartResponse.cartId = cartId
        return cartResponse
    }

    // cart details by userId
    @Query(() => CartResponse)
    async getCartDetailsByUserId(
        @Arg('userId') userId: string
    ): Promise<CartResponse> {
        let cartResponse: CartResponse = { items: [], count: 0 };
        const userDetails: UserDocument = await UserModel.findOne({ userId }, { "cart": 1 }).populate('cart')
        if (!userDetails || !userDetails.cart || !userDetails.cart.items) {
            return cartResponse
        }
        userDetails.cart.items.forEach((item: ICart) => {
            cartResponse.items.push({ itemId: item.itemId, quantity: item.quantity })
        })
        cartResponse.count = cartResponse.items.length
        cartResponse.cartId = userDetails.cart.cartId
        return cartResponse
    }

    @Mutation(() => Boolean)
    async AddToCart(@Args() { itemId, quantity, userId, cartId }: AddTOCart): Promise<boolean> {

        const isItemExists = await ItemModel.findOne({ itemId }, { _id: 1 })
        if (!isItemExists) {
            throw new Error('unbale to get Item')
        }
        const cart = await CartModel.updateOne({ cartId }, { $push: { "items": { quantity, itemId, item: isItemExists._id } } })
        if (!cart) {
            throw new Error('unbale to add item to cart!')
        }
        console.log(`item added for user ${userId}`);
        return true
    }

    @Mutation(() => Boolean)
    async adjustItemQyantity(@Args() { itemId, quantity, cartId }: AdjustItemQuantity): Promise<boolean> {
        const cart = await CartModel.updateOne({ cartId, "items.itemId": itemId }, { $set: { "items.$.quantity": quantity } })
        if (!cart || cart.nModified === 0) {
            throw new Error('unbale to adjust item quantity!')
        }
        console.log(`successfully adjusted item quantity `);
        return true
    }

}


