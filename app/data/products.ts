export type Product = {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  category: "slices" | "powders";
  image: string;
  weight: string;
  badges: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isOrganic?: boolean;
  description: string;
  benefits: string[];
  inStock: boolean;
};

export const products: Product[] = [
  // ─── Dried Fruits (Slices) ───────────────────────────────────────────────────
  {
    id: 1,
    slug: "sun-dried-orange-crisps",
    name: "Sun-Dried Orange Crisps",
    subtitle: "No added sugar · Vitamin C rich",
    price: 12.99,
    originalPrice: 15.99,
    category: "slices",
    image: "/images/product-oranges.png",
    weight: "120g",
    badges: ["Bestseller", "Organic"],
    rating: 4.9,
    reviews: 248,
    isBestseller: true,
    isOrganic: true,
    description:
      "Slowly sun-dried orange slices that burst with citrus sweetness. Zero added sugars, packed with vitamin C and antioxidants.",
    benefits: ["High in Vitamin C", "No added sugar", "100% Natural"],
    inStock: true,
  },
  {
    id: 2,
    slug: "golden-banana-chips",
    name: "Golden Banana Chips",
    subtitle: "Naturally sweet · Rich in potassium",
    price: 9.99,
    category: "slices",
    image: "/images/product-bananas.png",
    weight: "150g",
    badges: ["New"],
    rating: 4.7,
    reviews: 94,
    isNew: true,
    description:
      "Crispy golden banana chips with a warm, caramel-like sweetness. A potassium-packed snack harvested from tropical farms.",
    benefits: ["High in Potassium", "Energy Boosting", "Gluten Free"],
    inStock: true,
  },
  {
    id: 3,
    slug: "tropical-mango-slices",
    name: "Tropical Mango Slices",
    subtitle: "Naturally sweet · 100% organic",
    price: 13.49,
    category: "slices",
    image: "/images/product-mangoes.png",
    weight: "110g",
    badges: ["Organic"],
    rating: 4.8,
    reviews: 187,
    isOrganic: true,
    description:
      "Succulent mango slices slow-dehydrated to concentrate all the tropical goodness. Sourced exclusively from certified organic orchards.",
    benefits: ["100% Organic", "Rich in Vitamin A", "Antioxidant Rich"],
    inStock: true,
  },
  {
    id: 4,
    slug: "orchard-apple-rings",
    name: "Orchard Apple Rings",
    subtitle: "Cinnamon dusted · High in fiber",
    price: 11.49,
    category: "slices",
    image: "/images/product-apples.png",
    weight: "130g",
    badges: ["Farm Fresh"],
    rating: 4.6,
    reviews: 143,
    description:
      "Heirloom apple rings lightly dusted with cinnamon, slowly dehydrated to create a satisfying crunch with natural sweetness.",
    benefits: ["High in Fiber", "Gut Friendly", "Lightly Spiced"],
    inStock: true,
  },
  {
    id: 5,
    slug: "wild-strawberry-bites",
    name: "Wild Strawberry Bites",
    subtitle: "Freeze-dried · Intensely flavored",
    price: 14.99,
    originalPrice: 17.99,
    category: "slices",
    image: "/images/product-strawberries.png",
    weight: "100g",
    badges: ["Premium", "Limited"],
    rating: 4.9,
    reviews: 320,
    isBestseller: true,
    description:
      "Wild strawberry slices freeze-dried at peak ripeness to lock in vibrant color, aroma, and intense berry flavor.",
    benefits: ["Antioxidant Rich", "No Preservatives", "Freeze Dried"],
    inStock: true,
  },
  {
    id: 6,
    slug: "heritage-berry-medley",
    name: "Heritage Berry Medley",
    subtitle: "Mixed berries · Immunity blend",
    price: 15.99,
    category: "slices",
    image: "/images/product-strawberries.png",
    weight: "100g",
    badges: ["Bestseller"],
    rating: 4.7,
    reviews: 211,
    isBestseller: true,
    description:
      "A curated blend of heirloom berries — strawberry, blueberry, and raspberry — dehydrated together for a symphony of flavors.",
    benefits: ["Immunity Boost", "Rich in Antioxidants", "Mixed Vitamins"],
    inStock: true,
  },
  {
    id: 7,
    slug: "dried-pineapple-rings",
    name: "Dried Pineapple Rings",
    subtitle: "No sulfites · Tropical sweetness",
    price: 10.99,
    category: "slices",
    image: "/images/product-oranges.png",
    weight: "120g",
    badges: ["New", "Organic"],
    rating: 4.5,
    reviews: 76,
    isNew: true,
    isOrganic: true,
    description:
      "Juicy pineapple rings dehydrated without sulfites or added colors. Pure tropical heaven in every chewy bite.",
    benefits: ["No Sulfites", "Digestive Aid", "Tropical Flavor"],
    inStock: true,
  },
  {
    id: 8,
    slug: "sun-kissed-apricot-halves",
    name: "Sun-Kissed Apricot Halves",
    subtitle: "High in iron · Naturally sweet",
    price: 12.49,
    category: "slices",
    image: "/images/product-mangoes.png",
    weight: "110g",
    badges: ["Farm Fresh"],
    rating: 4.6,
    reviews: 98,
    description:
      "Golden apricot halves sun-dried on mountain slopes, delivering a rich, honey-like sweetness with a satisfying chew.",
    benefits: ["High in Iron", "Beta Carotene", "Natural Sweetness"],
    inStock: false,
  },

  // ─── Fruit Powders ───────────────────────────────────────────────────────────
  {
    id: 9,
    slug: "pure-banana-powder",
    name: "Pure Banana Powder",
    subtitle: "Smoothie ready · Natural sweetener",
    price: 16.99,
    originalPrice: 19.99,
    category: "powders",
    image: "/images/product-bananas.png",
    weight: "200g",
    badges: ["Bestseller"],
    rating: 4.8,
    reviews: 302,
    isBestseller: true,
    description:
      "100% pure banana flour ground from sun-dried bananas. Perfect for smoothies, baking, and natural sweetening.",
    benefits: ["Natural Sweetener", "Baking Ready", "High in Potassium"],
    inStock: true,
  },
  {
    id: 10,
    slug: "vibrant-beetroot-powder",
    name: "Vibrant Beetroot Powder",
    subtitle: "Earthy & nutritious · Antioxidant rich",
    price: 18.99,
    category: "powders",
    image: "/images/product-oranges.png",
    weight: "150g",
    badges: ["Premium", "Organic"],
    rating: 4.7,
    reviews: 167,
    isOrganic: true,
    description:
      "Deep ruby beetroot powder cold-processed to preserve nitrates and betalains. A vibrant superfood addition to any diet.",
    benefits: ["Rich in Nitrates", "Stamina Boost", "Antioxidant Rich"],
    inStock: true,
  },
  {
    id: 11,
    slug: "tropical-mango-powder",
    name: "Tropical Mango Powder",
    subtitle: "Amchoor style · Tangy & sweet",
    price: 15.99,
    category: "powders",
    image: "/images/product-mangoes.png",
    weight: "180g",
    badges: ["New"],
    rating: 4.6,
    reviews: 89,
    isNew: true,
    description:
      "Stone-ground from sun-ripened Alphonso mangoes, this powder brings a tropical pop to dressings, marinades, and drinks.",
    benefits: ["Vitamin A Rich", "Digestive Aid", "Versatile Use"],
    inStock: true,
  },
  {
    id: 12,
    slug: "strawberry-dust-powder",
    name: "Strawberry Dust Powder",
    subtitle: "Freeze-dried · Intense berry flavor",
    price: 17.49,
    originalPrice: 20.99,
    category: "powders",
    image: "/images/product-strawberries.png",
    weight: "120g",
    badges: ["Premium", "Bestseller"],
    rating: 4.9,
    reviews: 254,
    isBestseller: true,
    description:
      "Freeze-dried strawberries, pulverized to a fine powder that retains all the vivid color and intense berry aroma.",
    benefits: ["Intense Flavor", "Natural Color", "No Fillers"],
    inStock: true,
  },
];

export const categories = [
  { id: "all", label: "All Products" },
  { id: "slices", label: "Dried Fruits" },
  { id: "powders", label: "Fruit Powders" },
] as const;

export const sortOptions = [
  { id: "popular", label: "Most Popular" },
  { id: "new", label: "New Arrivals" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
] as const;
