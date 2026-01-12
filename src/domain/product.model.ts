export type InventoryState = 'DISPONIBLE' | 'BAJO_STOCK' | 'AGOTADO';

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  rating: number;
  inventoryState: InventoryState;
}
