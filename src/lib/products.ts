export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  inStock: boolean;
  /** whether this product is a customizable card where buyer provides text */
  isCustom?: boolean;
};

export const defaultProducts: Product[] = [];

const STORAGE_KEY = "phool_products_v1";

export function loadProducts(): Product[] {
  try {
    // Clear localStorage to remove any cached products
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (e) {
    console.error("Failed to load products from storage", e);
    return [];
  }
}

export function saveProducts(list: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save products to storage", e);
  }
}

export default defaultProducts;
