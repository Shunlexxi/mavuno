import { lendingPoolAbi } from "@/abis/lendingPool";
import { Pool, PoolPosition } from "@/types";
import { ApiResponse } from "@/types/api";
import { Contracts, publicClient } from "@/utils/constants";
import { formatUnits, Hex } from "viem";

export class PoolsService {
  private async loadPool(address: Hex): Promise<Pool> {
    let currency: "NGN" | "CEDI" | "RAND";

    switch (address) {
      case Contracts.CediPool:
        currency = "CEDI";
        break;
      case Contracts.RandPool:
        currency = "RAND";
        break;
      default:
        currency = "NGN";
    }

    try {
      const totalLiquidity = (await publicClient.readContract({
        abi: lendingPoolAbi,
        address,
        functionName: "totalSupplied",
        authorizationList: undefined,
      })) as bigint;

      const totalBorrowed = (await publicClient.readContract({
        abi: lendingPoolAbi,
        address,
        functionName: "totalBorrowed",
        authorizationList: undefined,
      })) as bigint;

      const borrowAPY = (await publicClient.readContract({
        abi: lendingPoolAbi,
        address,
        functionName: "borrowRateBp",
        authorizationList: undefined,
      })) as bigint;

      const utilizationRate = Number(totalBorrowed / totalLiquidity);
      const supplyAPY = BigInt((Number(borrowAPY) * utilizationRate) / 100);

      return {
        address,
        currency,
        totalLiquidity,
        totalBorrowed,
        supplyAPY,
        borrowAPY,
        utilizationRate,
      };
    } catch (error) {
      return {
        address,
        currency,
        totalLiquidity: 0n,
        totalBorrowed: 0n,
        supplyAPY: 0n,
        borrowAPY: 0n,
        utilizationRate: 0,
      };
    }
  }

  private async loadPosition(address, account): Promise<PoolPosition> {
    try {
    } catch (error) {
      return {};
    }
  }

  async getPools(): Promise<ApiResponse<Pool[]>> {
    try {
      const pools = [
        Contracts.NairaPool,
        Contracts.CediPool,
        Contracts.RandPool,
      ].map((address) => this.loadPool(address));

      return {
        data: await Promise.all(pools),
        success: true,
        message: "Pools retrieved successfully",
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: "Failed to retrieve pools",
      };
    }
  }

  async getPoolByAddress(address: Hex): Promise<ApiResponse<Pool>> {
    try {
      return {
        data: await this.loadPool(address),
        success: true,
        message: "Pool retrieved successfully",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: "Failed to retrieve pool",
      };
    }
  }

  async getAccountPoolPosition(
    address: Hex,
    account: Hex
  ): Promise<ApiResponse<PoolPosition | null>> {
    try {
      return {
        data: await this.loadPosition(address, account),
        success: true,
        message: "Pool positions retrieved successfully",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: "Failed to retrieve pool positions",
      };
    }
  }

  generatePoolChartData(
    supplyAPY: number,
    days: number = 30
  ): { day: number; apy: number }[] {
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      apy: supplyAPY + Math.sin(i * 0.2) * 2 + Math.random() * 1,
    }));
  }
}

export const poolsService = new PoolsService();

export default poolsService;
