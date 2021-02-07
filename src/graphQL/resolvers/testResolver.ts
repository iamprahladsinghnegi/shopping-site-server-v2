import { ItemModel } from '../../database/model/item.model';
import { Resolver, Query, ObjectType, Arg, Mutation } from 'type-graphql';
import { UserModel } from '../../database/model/user.model';
import { InventoryModel } from '../../database/model/inventory.model';
import { CartModel } from '../../database/model/cart.model';
// import { ItemObject } from 'src/database/types/items';
// import { hash } from 'bcryptjs';

@ObjectType()
@Resolver()
export class TestResolver {
    @Query(() => String)
    hello() {
        return 'hi!';
    }

    @Query(() => Number)
    async totalUser() {
        return await UserModel.count()
    }

    @Query(() => Number)
    async getAllItems() {
        const items = await ItemModel.count();
        return items
    }

    @Mutation(() => Boolean)
    addItem(
        @Arg('abc') abc: string,
        @Arg('num') num: number,
    ) {
        console.log(abc)

        let inventory = {
            available: num * 5,
            price: num * 2,
            discount: num
        }

        let inventories = new InventoryModel(inventory)

        return inventories.save().then(_res => {
            let item = {
                url: abc,
                name: abc,
                category: "Fruits",
                subCategory: "A1",
                inventory: inventories._id
            }
            let items = new ItemModel(item)
            if (items) {
                return items.save().then(res => {
                    console.log('added', res)
                    return true
                }).catch(err => {
                    console.log('unable to add', err)
                    return false
                })
            }
            return false

        }).catch(err => {
            console.log('sadsa', err)
            return false
        })


    }


    @Mutation(() => Boolean)
    async addToCart(
        @Arg('itemId') itemId: string,
        @Arg('quantity') quantity: number

    ) {
        console.log(itemId, quantity)

        // let item = await ItemModel.findOne({ _id: itemId })
        // if (!item) {
        //     return false
        // }
        let cart = new CartModel({
            items: [
                // {
                //     quantity: quantity,
                //     item: item._id
                // }
            ]
        })
        return cart.save().then(res => {
            console.log(res)
            return true
        }).catch(err => {
            console.log(err)
            return false
        })


    }

}

