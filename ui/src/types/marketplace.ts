export type ProductCategory = "seeds" | "fertilizers" | "tools" | "equipment" | "pesticides" | "rentals";

export interface Merchant {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  totalSales: number;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  category: ProductCategory;
  merchant: Merchant;
  images: string[];
  inStock: boolean;
  stockQuantity?: number;
  rating: number;
  reviewCount: number;
  discount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  specifications?: Record<string, string>;
  deliveryTime?: string;
  warranty?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface RentalProduct extends Product {
  rentalPeriod: string;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  requiresDeposit: boolean;
  depositAmount?: number;
}

export const categoryLabels: Record<ProductCategory, string> = {
  seeds: "Seeds",
  fertilizers: "Fertilizers",
  tools: "Farm Tools",
  equipment: "Equipment",
  pesticides: "Pesticides",
  rentals: "Equipment Rentals",
};

export const categoryIcons: Record<ProductCategory, string> = {
  seeds: "🌱",
  fertilizers: "🌾",
  tools: "🔧",
  equipment: "🚜",
  pesticides: "🧪",
  rentals: "📦",
};

