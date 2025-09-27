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
  totalLiquidity: bigint;
  totalBorrowed: bigint;
  supplyAPY: bigint;
  borrowAPY: bigint;
  utilizationRate: number;
  lp: bigint;
  withdrawable: bigint;
  borrow: bigint;
  outstanding: bigint;
  healthFactor: bigint;
  totalPledge: bigint;
  active: boolean;
}
