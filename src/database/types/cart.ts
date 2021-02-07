export interface ICartItem {
    id: string;
    quantity: number;
}

export interface ICart {
    items: Array<ICartItem>
}