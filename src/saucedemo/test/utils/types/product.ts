/**
 * Tipos relacionados con el inventario, productos y ordenamiento en Sauce Demo
 */

export type SortOrderOption =
  | "name_asc"   // Name (A to Z)
  | "name_desc"  // Name (Z to A)
  | "price_asc"  // Price (low to high)
  | "price_desc"; // Price (high to low)

export interface ProductItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
}

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

