export type Review = {
  id: number;
  productId: number;
  rating: number; // 1-5
  text: string; // up to configured limit
  createdAt: string;
};

const STORAGE_KEY = "phool_reviews_v1";

const loadAll = (): Review[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Review[];
  } catch (e) {
    return [];
  }
};

const saveAll = (arr: Review[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error("Failed to save reviews", e);
  }
};

export const loadReviews = (productId: number): Review[] => {
  return loadAll().filter((r) => r.productId === productId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const saveReview = (payload: { productId: number; rating: number; text: string }) => {
  const all = loadAll();
  const next: Review = {
    id: Math.max(0, ...all.map((r) => r.id)) + 1,
    productId: payload.productId,
    rating: Math.min(5, Math.max(1, Math.round(payload.rating))),
    text: payload.text.slice(0, 150),
    createdAt: new Date().toISOString(),
  };
  const arr = [...all, next];
  saveAll(arr);
  return next;
};

export default { loadReviews, saveReview };
