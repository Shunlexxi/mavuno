import { apiClient } from "./api";
import { Pool, PoolPosition } from "@/types";
import { ApiResponse, PoolActionRequest } from "@/types/api";
import { Contracts } from "@/utils/constants";

// Mock data (to be removed when backend is integrated)
const mockPools: Pool[] = [
  {
    id: "ngn-pool",
    currency: "NGN",
    address: Contracts.NairaPool,
    totalLiquidity: 15000000,
    totalBorrowed: 8500000,
    supplyAPY: 12.5,
    borrowAPY: 18.2,
    utilizationRate: 56.7,
  },
  {
    id: "cedi-pool",
    currency: "CEDI",
    address: Contracts.CediPool,
    totalLiquidity: 850000,
    totalBorrowed: 420000,
    supplyAPY: 14.8,
    borrowAPY: 19.5,
    utilizationRate: 49.4,
  },
  {
    id: "rand-pool",
    currency: "RAND",
    address: Contracts.RandPool,
    totalLiquidity: 2200000,
    totalBorrowed: 1300000,
    supplyAPY: 11.2,
    borrowAPY: 16.8,
    utilizationRate: 59.1,
  },
];

const mockPoolPositions: PoolPosition[] = [
  {
    id: "1",
    poolId: "ngn-pool",
    userId: "user1",
    type: "supply",
    amount: 500000,
    earnedInterest: 12500,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    poolId: "cedi-pool",
    userId: "farmer1",
    type: "borrow",
    amount: 80000,
    createdAt: "2024-02-01T00:00:00Z",
  },
];

export class PoolsService {
  // Get all pools
  async getPools(): Promise<ApiResponse<Pool[]>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 400)
      );

      return {
        data: [...mockPools],
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

  // Get single pool by ID
  async getPoolById(id: string): Promise<ApiResponse<Pool | null>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 150 + Math.random() * 300)
      );

      const pool = mockPools.find((p) => p.id === id) || null;

      return {
        data: pool,
        success: true,
        message: pool ? "Pool retrieved successfully" : "Pool not found",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: "Failed to retrieve pool",
      };
    }
  }

  // Perform pool action (supply, borrow, withdraw, repay)
  async performPoolAction(
    request: PoolActionRequest
  ): Promise<ApiResponse<PoolPosition>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 800 + Math.random() * 700)
      );

      // Find the pool
      const pool = mockPools.find((p) => p.id === request.poolId);
      if (!pool) {
        return {
          data: {} as PoolPosition,
          success: false,
          message: "Pool not found",
        };
      }

      // Create new position
      const newPosition: PoolPosition = {
        id: Date.now().toString(),
        poolId: request.poolId,
        userId: "current-user", // In real implementation, this would come from auth
        type:
          request.action === "supply" || request.action === "withdraw"
            ? "supply"
            : "borrow",
        amount: request.amount,
        createdAt: new Date().toISOString(),
      };

      // Update pool stats (simplified simulation)
      if (request.action === "supply") {
        pool.totalLiquidity += request.amount;
      } else if (request.action === "borrow") {
        pool.totalBorrowed += request.amount;
      } else if (request.action === "withdraw") {
        pool.totalLiquidity = Math.max(0, pool.totalLiquidity - request.amount);
      } else if (request.action === "repay") {
        pool.totalBorrowed = Math.max(0, pool.totalBorrowed - request.amount);
      }

      // Recalculate utilization rate
      pool.utilizationRate =
        pool.totalLiquidity > 0
          ? (pool.totalBorrowed / pool.totalLiquidity) * 100
          : 0;

      mockPoolPositions.push(newPosition);

      return {
        data: newPosition,
        success: true,
        message: `${request.action} completed successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to ${request.action}`);
    }
  }

  // Get user's pool positions
  async getUserPoolPositions(
    userId: string
  ): Promise<ApiResponse<PoolPosition[]>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 250 + Math.random() * 350)
      );

      const userPositions = mockPoolPositions.filter(
        (pos) => pos.userId === userId
      );

      return {
        data: userPositions,
        success: true,
        message: "Pool positions retrieved successfully",
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: "Failed to retrieve pool positions",
      };
    }
  }

  // Generate chart data for pool (mock implementation)
  generatePoolChartData(
    poolId: string,
    days: number = 30
  ): { day: number; apy: number }[] {
    const pool = mockPools.find((p) => p.id === poolId);
    const baseRate = pool ? pool.supplyAPY : 12;

    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      apy: baseRate + Math.sin(i * 0.2) * 2 + Math.random() * 1,
    }));
  }
}

// Export singleton instance
export const poolsService = new PoolsService();
export default poolsService;
