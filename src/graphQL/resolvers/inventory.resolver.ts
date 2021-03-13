import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { InventoryDocument, InventoryModel } from "../../database/model/inventory.model";
import { Available } from "../types/inventory.types";

@Resolver()
export class InventoryResolver {

    @Query(() => [Available])
    async getInventoryLevelByInventoryId(
        @Arg('inventoryId') inventoryId: string
    ): Promise<Array<Available>> {
        const inventory: InventoryDocument = await InventoryModel.findOne({ inventoryId }, { available: 1 })
        if (!inventory) {
            throw new Error('Unable to get inventory by inventoryId!')
        }
        return inventory.available
    }


    @Mutation(() => Boolean)
    async updatedInventoryByInventoryId(
        @Arg('inventoryId') inventoryId: string,
        @Arg('name') type: string,
        @Arg('quantity') quantity: number
    ): Promise<boolean> {
        // const isInventoryUpdated = await InventoryModel.updateOne({ inventoryId, "available.name": type }, { $set: { "available.$.quantity": quantity } })
        const isInventoryUpdated = await InventoryModel.updateOne({ inventoryId }, { $set: { "available.$[ele].quantity": quantity } }, { arrayFilters: [{ "ele.name": type }] })
        if (!isInventoryUpdated) {
            throw new Error('Unable to updated Inventory!')
        }
        return true
    }

    @Mutation(() => Boolean)
    async incrementInventoryByInventoryId(
        @Arg('inventoryId') inventoryId: string,
        @Arg('name') type: string,
        @Arg('quantity') quantity: number
    ): Promise<boolean> {
        const isInventoryUpdated = await InventoryModel.updateOne({ inventoryId }, { $inc: { "available.$[ele].quantity": quantity } }, { arrayFilters: [{ "ele.name": type }] })
        if (!isInventoryUpdated) {
            throw new Error('Unable to updated Inventory!')
        }
        return true
    }

    @Mutation(() => Boolean)
    async decrementInventoryByInventoryId(
        @Arg('inventoryId') inventoryId: string,
        @Arg('name') type: string,
        @Arg('quantity') quantity: number
    ): Promise<boolean> {
        const isInventoryUpdated = await InventoryModel.updateOne({ inventoryId }, { $inc: { "available.$[ele].quantity": - quantity } }, { arrayFilters: [{ "ele.name": type }] })
        if (!isInventoryUpdated) {
            throw new Error('Unable to updated Inventory!')
        }
        return true
    }

}


