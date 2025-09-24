import { Hex } from "viem";

export interface User {
  name: string;
  email: string;
  avatar?: string;
  address?: string;
  createdAt: string;
}

export interface Farmer extends User {
  location: string;
  farmSize: string;
  cropType: string;
  description: string;
  verified: boolean;
  totalLoans: bigint;
  totalRepaid: bigint;
}

export interface TimelinePost {
  id: string;
  farmerId: string;
  farmer: Farmer;
  content: string;
  images?: string[];
  video?: string;
  type: "update" | "milestone" | "harvest" | "request";
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Pledge {
  id: string;
  pledgerId: string;
  farmerId: string;
  farmer: Farmer;
  amount: bigint;
  currency: "HBAR";
  status: "active" | "withdrawn" | "locked";
  createdAt: string;
  canWithdraw: boolean;
  lockEndDate?: string;
  seasonCycle?: string;
}

export interface Pool {
  address: Hex;
  currency: "NGN" | "CEDI" | "RAND";
  totalLiquidity: bigint;
  totalBorrowed: bigint;
  supplyAPY: number;
  borrowAPY: number;
  utilizationRate: number;
}

export interface PoolPosition {
  id: string;
  poolAddress: string;
  account: string;
  amount: number;
  earnedInterest?: number;
  createdAt: string;
}

export interface PledgeStats {
  totalPledged: bigint;
  activePledges: bigint;
  lockedPledges: bigint;
}
