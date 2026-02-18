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

export const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Rose Bouquet Amigurumi",
    price: 35,
    category: "Amigurumi",
    images: [],
    description: "Hand-stitched rose bouquet amigurumi. Soft yarn and child-safe eyes.",
    inStock: true,
  },
  {
    id: 2,
    name: "Sunflower Blanket",
    price: 85,
    category: "Blankets",
    images: [],
    description: "Cozy sunflower-themed blanket, perfect for naps and picnics.",
    inStock: true,
  },
  {
    id: 3,
    name: "Lavender Bear",
    price: 28,
    category: "Amigurumi",
    images: [],
    description: "Small lavender-scented bear, great as a keepsake or gift.",
    inStock: true,
  },
  {
    id: 4,
    name: "Daisy Chain Garland",
    price: 22,
    category: "Garlands",
    images: [],
    description: "Lightweight daisy garland for room decor or parties.",
    inStock: true,
  },
  {
    id: 5,
    name: "Cotton Scrunchie Set",
    price: 12,
    category: "Accessories",
    images: [],
    description: "Set of three cotton scrunchies in coordinating colors.",
    inStock: true,
  },
  {
    id: 6,
    name: "Baby Whale",
    price: 30,
    category: "Amigurumi",
    images: [],
    description: "Cute baby whale stuffed toy — perfect for nurseries.",
    inStock: false,
  },
  {
    id: 7,
    name: "Rainbow Blanket",
    price: 95,
    category: "Blankets",
    images: [],
    description: "Large rainbow blanket — bright, soft, and warm.",
    inStock: true,
  },
  {
    id: 8,
    name: "Flower Coasters (Set of 4)",
    price: 18,
    category: "Accessories",
    images: [],
    description: "Set of four floral coasters to protect surfaces with style.",
    inStock: true,
  },
];

const STORAGE_KEY = "phool_products_v1";

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProducts;
    const parsed = JSON.parse(raw) as Product[];
    return parsed;
  } catch (e) {
    console.error("Failed to load products from storage", e);
    return defaultProducts;
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
