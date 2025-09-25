import { farmerRegistryAbi } from "@/abis/farmerRegistry";
import { lendingPoolAbi } from "@/abis/lendingPool";
import { pledgeManagerAbi } from "@/abis/pledgeManager";
import { Pool } from "@/types";
import { ApiResponse } from "@/types/api";
import { Contracts, publicClient } from "@/utils/constants";
import { Hex, zeroAddress } from "viem";

export class PoolsService {
  private async loadPool(
    address: Hex,
    account: Hex = zeroAddress
  ): Promise<Pool> {
    let currency: "NGN" | "CEDI" | "RAND";
    let fiat: Hex;
    let fiatUnderlying: Hex;
    let fiatUnderlyingId: string;

    switch (address) {
      case Contracts.CediPool:
        currency = "CEDI";
        fiat = Contracts.CediFiat;
        fiatUnderlying = Contracts.CediFiatUnderlying;
        fiatUnderlyingId = Contracts.CediFiatUnderlyingId;
        break;
      case Contracts.RandPool:
        currency = "RAND";
        fiat = Contracts.RandFiat;
        fiatUnderlying = Contracts.RandFiatUnderlying;
        fiatUnderlyingId = Contracts.RandFiatUnderlyingId;
        break;
      default:
        currency = "NGN";
        fiat = Contracts.NairaFiat;
        fiatUnderlying = Contracts.NairaFiatUnderlying;
        fiatUnderlyingId = Contracts.NairaFiatUnderlyingId;
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

      const utilizationRate =
        totalLiquidity <= 0n
          ? 0
          : Number((totalBorrowed * 100n) / totalLiquidity);

      const supplyAPY = BigInt((Number(borrowAPY) * utilizationRate) / 100);

      const lp =
        account == zeroAddress
          ? 0n
          : ((await publicClient.readContract({
              abi: lendingPoolAbi,
              address,
              functionName: "balanceOf",
              args: [account],
              authorizationList: undefined,
            })) as bigint);

      const [principal] =
        account == zeroAddress
          ? [0n, 0n]
          : ((await publicClient.readContract({
              abi: lendingPoolAbi,
              address,
              functionName: "farmerPositions",
              args: [account],
              authorizationList: undefined,
            })) as bigint[]);

      const outstanding =
        account == zeroAddress
          ? 0n
          : ((await publicClient.readContract({
              abi: lendingPoolAbi,
              address,
              functionName: "outstanding",
              args: [account],
              authorizationList: undefined,
            })) as bigint);

      const healthFactor =
        account == zeroAddress
          ? 0n
          : ((await publicClient.readContract({
              abi: lendingPoolAbi,
              address,
              functionName: "healthFactorLTV",
              args: [account],
              authorizationList: undefined,
            })) as bigint);

      const pledgeManager =
        account == zeroAddress
          ? zeroAddress
          : ((await publicClient.readContract({
              abi: farmerRegistryAbi,
              address: Contracts.FarmerRegistry,
              functionName: "farmerToManager",
              args: [account],
              authorizationList: undefined,
            })) as Hex);

      const totalPledge =
        pledgeManager == zeroAddress
          ? 0n
          : ((await publicClient.readContract({
              abi: pledgeManagerAbi,
              address: pledgeManager,
              functionName: "totalSupply",
              authorizationList: undefined,
            })) as bigint);

      const active =
        pledgeManager == zeroAddress
          ? false
          : ((await publicClient.readContract({
              abi: pledgeManagerAbi,
              address: pledgeManager,
              functionName: "active",
              authorizationList: undefined,
            })) as boolean);

      return {
        address,
        fiat,
        fiatUnderlying,
        fiatUnderlyingId,
        currency,
        totalLiquidity,
        totalBorrowed,
        supplyAPY,
        borrowAPY,
        utilizationRate,
        lp,
        borrow: principal,
        outstanding,
        healthFactor,
        totalPledge,
        active,
      };
    } catch (error) {
      console.log(error);

      return {
        address,
        currency,
        fiat,
        fiatUnderlying,
        fiatUnderlyingId,
        totalLiquidity: 0n,
        totalBorrowed: 0n,
        supplyAPY: 0n,
        borrowAPY: 0n,
        utilizationRate: 0,
        lp: 0n,
        borrow: 0n,
        outstanding: 0n,
        healthFactor: 0n,
        totalPledge: 0n,
        active: false,
      };
    }
  }

  async getPools(account: Hex): Promise<ApiResponse<Pool[]>> {
    try {
      const pools = [
        Contracts.NairaPool,
        Contracts.CediPool,
        Contracts.RandPool,
      ].map((address) => this.loadPool(address, account));

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

  async getPoolByAddress(
    address: Hex,
    account: Hex
  ): Promise<ApiResponse<Pool>> {
    try {
      return {
        data: await this.loadPool(address, account),
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

  generatePoolChartData(
    supplyAPY: number,
    days: number = 30
  ): { day: number; apy: number }[] {
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      apy: supplyAPY + Math.sin(i * 0.02) * 2 + Math.random() * 1,
    }));
  }
}

export const poolsService = new PoolsService();

export default poolsService;
