import { Hex } from "viem";

export interface User {
  address: Hex;
  name: string;
  email: string;
  location: string;
  farmSize: string;
  cropType: string;
  description: string;
  verified: boolean;
  createdAt: string;
  totalBorrowed: number;
  totalRepaid: number;
}

export interface Farmer extends User {
  pledgeManager: Hex;
  preferredPool: Hex;
  metadataUrl?: string;
}

export interface TimelinePost {
  id: string;
  address?: Hex;
  farmer?: Partial<Farmer>;
  content: string;
  images?: string[];
  video?: string;
  type: "update" | "activity";
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Pledge {
  id: string;
  pledgerAddress: string;
  farmerAddress: string;
  farmer: Partial<Farmer>;
  amount: number;
  currency: "HBAR";
  createdAt: string;
}

export interface Pool {
  address: Hex;
  fiat: Hex;
  fiatUnderlying: Hex;
  fiatUnderlyingId: string;
  currency: "NGN" | "GHS" | "ZAR";
  country: CountryType;
  totalLiquidity: bigint;
  totalBorrowed: bigint;
  supplyAPY: bigint;
  borrowAPY: bigint;
  utilizationRate: number;
  lp: bigint;
  withdrawable: bigint;
  borrow: bigint;
  outstanding: bigint;
  ltvBps: bigint;
  totalPledge: bigint;
  active: boolean;
}

export type CountryType = "nigeria" | "ghana" | "south africa";

export interface Bank {
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  account_number: number;
  account_name: string;
  bank_id: number;
}
