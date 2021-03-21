import { Resolver, Query, Args, Mutation, Arg, Ctx } from "type-graphql";
import { AdjustItemQuantity, CartResponse } from "../types/cart.types"; //AddTOCart
import { CartDocument, CartModel } from "../../database/model/cart.model";
import { ICartItem } from '../../database/types/cart'
import { UserDocument, UserModel } from "../../database/model/user.model";
import { ItemModel } from "../../database/model/item.model";
import { generateRendomString } from "../../utils/generateId";
import { verify } from "jsonwebtoken";
import { Context } from "../types/context";

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
            return cartResponse;
        }
        cartDetails.items.forEach(item => {
            cartResponse.items.push({ itemId: item.itemId, quantity: item.quantity, size: item.size });
        })
        cartResponse.count = cartResponse.items.length;;
        cartResponse.cartId = cartId;
        return cartResponse
    }

    // cart details by userId
    @Query(() => CartResponse)
    async getCartDetailsByUserId(
        @Arg('userId') userId: string
    ): Promise<CartResponse> {
        let cartResponse: CartResponse = { items: [], count: 0 };
        const userDetails: UserDocument = await UserModel.findOne({ userId }, { "cart": 1 }).populate('cart');
        if (!userDetails || !userDetails.cart || !userDetails.cart.items) {
            return cartResponse;
        }
        userDetails.cart.items.forEach((item: ICartItem) => {
            cartResponse.items.push({ itemId: item.itemId, quantity: item.quantity, size: item.size });
        })
        cartResponse.count = cartResponse.items.length;
        cartResponse.cartId = userDetails.cart.cartId;
        return cartResponse
    }

    // cart details by userId
    @Query(() => CartResponse)
    async getCartDetails(
        @Ctx() context: Context,
    ): Promise<CartResponse> {
        const authorization = context.req.headers['authorization'];
        if (!authorization) {
            throw new Error(`Unbale to add to cart!`);
        }
        try {
            const token = authorization.split(' ')[1];
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

            let cartResponse: CartResponse = { items: [], count: 0 };
            const userDetails: UserDocument = await UserModel.findOne({ userId: payload.userId }, { "cart": 1 }).populate('cart');
            if (!userDetails || !userDetails.cart || !userDetails.cart.items) {
                return cartResponse;
            }
            userDetails.cart.items.forEach((item: ICartItem) => {
                cartResponse.items.push({ itemId: item.itemId, quantity: item.quantity, size: item.size });
            })
            cartResponse.count = cartResponse.items.length;
            cartResponse.cartId = userDetails.cart.cartId;
            return cartResponse
        }
        catch (e) {
            console.log(e);
            throw new Error('Unable to cart details!');
        }
    }

    // @Mutation(() => Boolean)
    // async AddToCart(@Args() { itemId, quantity, userId, cartId }: AddTOCart): Promise<boolean> {

    //     const isItemExists = await ItemModel.findOne({ itemId }, { _id: 1 })
    //     if (!isItemExists) {
    //         throw new Error('unbale to get Item')
    //     }
    //     const cart = await CartModel.updateOne({ cartId }, { $addToSet: { "items": { quantity, itemId, item: isItemExists._id } } })
    //     if (!cart || cart.nModified === 0) {
    //         throw new Error('unbale to add item to cart!')
    //     }
    //     console.log(`item added for user ${userId}`);
    //     return true
    // }

    @Mutation(() => Boolean)
    async adjustItemQyantity(@Args() { itemId, quantity, cartId }: AdjustItemQuantity): Promise<boolean> {
        const cart = await CartModel.updateOne({ cartId, "items.itemId": itemId }, { $set: { "items.$.quantity": quantity } })
        if (!cart || cart.nModified === 0) {
            throw new Error('unbale to adjust item quantity!')
        }
        console.log(`successfully adjusted item quantity `);
        return true
    }

    @Mutation(() => Boolean)
    async createCartWithItem(@Arg('itemId') itemId: string, @Arg('quantity') quantity: string): Promise<boolean> {
        const isItemExists = await ItemModel.findOne({ itemId }, { _id: 1 })
        if (!isItemExists) {
            throw new Error('unbale to get Item')
        }
        const userCartId: string = generateRendomString();
        const newCart = await CartModel.create({ cartId: userCartId, items: [{ quantity, item: isItemExists._id, itemId, size: "M" }] })
        if (!newCart) {
            throw new Error('unbale to create cart!')
        }
        console.log(`successfully cart created!`);
        return true
    }

    @Mutation(() => Boolean)
    async addToCart(
        @Ctx() context: Context,
        @Arg('itemId') itemId: string,
        @Arg('size') size: string,
        @Arg('quantity', { defaultValue: 1 }) quantity: number,
    ): Promise<boolean> {
        const authorization = context.req.headers['authorization'];
        if (!authorization) {
            throw new Error(`Unbale to add to cart!`);
        }
        try {
            const token = authorization.split(' ')[1];
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
            const isItemExists = await ItemModel.findOne({ itemId }, { _id: 1 })
            if (!isItemExists) {
                throw new Error('unbale to get Item')
            }
            //TODO: find the solution(populate and update in one query) or use pipeline
            // const user = await UserModel.findOneAndUpdate({ userId: payload.userId }, { $addToSet: { "cart.items": { quantity, itemId, item: isItemExists._id } } }).populate(
            //     {
            //         path: 'cart',
            //         model: 'carts',
            //     })
            const user = await UserModel.findOne({ userId: payload.userId }, { cart: 1 }).populate(
                {
                    path: 'cart',
                    model: 'carts',
                });

            // let cart: CartDocument = user.cart;
            // cart.items.push({ quantity, itemId, item: isItemExists._id });
            // await cart.save();

            const isCartUpdated = await CartModel.updateOne({ cartId: user.cart.cartId }, { $addToSet: { "items": { quantity, itemId, size, item: isItemExists._id } } })
            if (!isCartUpdated && isCartUpdated.nModified === 0) {
                throw new Error(`Unbale to add to cart!`);
            }
            console.log(`item added for user ${payload.userId}`);
            return true
        } catch (err) {
            throw new Error(`Unbale to add to cart!`);
        }

    }

}


