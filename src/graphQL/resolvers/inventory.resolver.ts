import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { InventoryDocument, InventoryModel } from "../../database/model/inventory.model";

@Resolver()
export class InventoryResolver {

    @Query(() => Number)
    async getInventoryLevelByInventoryId(
        @Arg('inventoryId') inventoryId: string
    ): Promise<number> {
        const inventory: InventoryDocument = await InventoryModel.findOne({ _id: inventoryId }, { projection: { available: 1 } })
        if (!inventory) {
            throw new Error('Unable to get inventory by inventoryId!')
        }
        return inventory.available
    }


    @Mutation(() => Boolean)
    async updatedInventoryByInventoryId(
        @Arg('inventoryId') inventoryId: string,
        @Arg('quantity') quantity: number
    ): Promise<boolean> {
        const isInventoryUpdated = await InventoryModel.updateOne({ _id: inventoryId }, { $set: { available: quantity } })
        if (!isInventoryUpdated) {
            throw new Error('Unable to updated Inventory!')
        }
        return true
    }

    @Mutation(() => Boolean)
    async incrementInventoryByInventoryId(
        @Arg('inventoryId') inventoryId: string,
        @Arg('quantity') quantity: number
    ): Promise<boolean> {
        const isInventoryUpdated = await InventoryModel.updateOne({ _id: inventoryId }, { $inc: { available: quantity } })
        if (!isInventoryUpdated) {
            throw new Error('Unable to updated Inventory!')
        }
        return true
    }

    @Mutation(() => Boolean)
    async decrementInventoryByInventoryId(
        @Arg('inventoryId') inventoryId: string,
        @Arg('quantity') quantity: number
    ): Promise<boolean> {
        const isInventoryUpdated = await InventoryModel.updateOne({ _id: inventoryId }, { $inc: { available: - quantity } })
        if (!isInventoryUpdated) {
            throw new Error('Unable to updated Inventory!')
        }
        return true
    }

}


