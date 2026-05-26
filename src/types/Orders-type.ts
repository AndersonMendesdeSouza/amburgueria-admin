export interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observations?: string;
  addons?: { id?: string; name: string; price: number; quantity?: number }[];
}
