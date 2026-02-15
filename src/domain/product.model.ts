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
  category: {
    id: string;
    name: string;
  };
}

export interface ProductDetail {
  id: string;
  color: string;
  size: string;
  stock: number;
  warehouse: string;
  product: Product | null;
}

export interface ProductAvailable {
  categoryName: string;
  productName: string;
  image: string;
  price: number;
  productDetailId: string;
  color: string;
  size: string;
  stock: number;
  warehouse: string;
}
