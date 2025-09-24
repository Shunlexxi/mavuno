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
  totalLoans: number;
  totalRepaid: number;
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
  amount: number;
  currency: "HBAR";
  status: "active" | "withdrawn" | "locked";
  createdAt: string;
  canWithdraw: boolean;
  lockEndDate?: string;
  seasonCycle?: string;
}

export interface Pool {
  id: string;
  address: Hex;
  currency: "NGN" | "CEDI" | "RAND";
  totalLiquidity: number;
  totalBorrowed: number;
  supplyAPY: number;
  borrowAPY: number;
  utilizationRate: number;
}

export interface PoolPosition {
  id: string;
  poolId: string;
  userId: string;
  type: "supply" | "borrow";
  amount: number;
  earnedInterest?: number;
  createdAt: string;
}

export interface PledgeStats {
  totalPledged: number;
  activePledges: number;
  lockedPledges: number;
}
