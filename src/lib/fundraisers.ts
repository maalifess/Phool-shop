export type Fundraiser = {
  id: number;
  title: string;
  description: string;
  goal: string;
  active: boolean;
  productId?: number;
  image?: string;
};

const defaultFundraisers: Fundraiser[] = [
  {
    id: 1,
    title: "Crochet for Kids",
    description:
      "Handmade blankets and stuffed animals for children in shelters. Every purchase goes directly to creating warm, cozy items for kids in need.",
    goal: "$500",
    active: true,
    image: "🧶",
  },
  {
    id: 2,
    title: "Community Craft Workshop",
    description:
      "Help us fund free crochet workshops for the community. Learn to crochet and take home your own handmade creation.",
    goal: "$300",
    active: true,
    image: "🎨",
  },
  {
    id: 3,
    title: "Holiday Gift Drive",
    description:
      "Last year we delivered 200+ handmade gifts. This campaign helped bring smiles to families during the holiday season.",
    goal: "$750 (reached!)",
    active: false,
    image: "🎁",
  },
];

const STORAGE_KEY = "phool_fundraisers_v1";

export function loadFundraisers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFundraisers;
    return JSON.parse(raw) as Fundraiser[];
  } catch (e) {
    console.error("Failed to load fundraisers", e);
    return defaultFundraisers;
  }
}

export function saveFundraisers(list: Fundraiser[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save fundraisers", e);
  }
}

export default defaultFundraisers;
