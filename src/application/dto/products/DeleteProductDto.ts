export interface DeleteProductInput {
  productId: string;
  itemName: string;
  actorEmail?: string;
  actorName?: string;
}

export interface DeleteProductOutput {
  productId: string;
}
