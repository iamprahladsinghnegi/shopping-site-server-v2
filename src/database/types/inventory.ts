
export interface Iavailable {
    name: string;
    quantity: number;
}
export interface IInvetory {
    inventoryId: string;
    available: Array<Iavailable>;
    price: number;
    discount: number;
}
