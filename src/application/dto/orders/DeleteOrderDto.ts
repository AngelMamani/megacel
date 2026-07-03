export interface DeleteOrderInput {
  orderId: string;
  actorEmail?: string;
  actorName?: string;
}

export interface DeleteOrderOutput {
  orderId: string;
}
