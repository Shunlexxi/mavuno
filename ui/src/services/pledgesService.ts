import { Pledge, PledgeStats } from "../types";
import {
  ApiResponse,
  CreatePledgeRequest,
  UpdatePledgeRequest,
  PledgeFilters,
} from "../types/api";
import { farmersService } from "./farmersService";

// Mock data (to be removed when backend is integrated)
let mockPledges: Pledge[] = [];
const mockPledgeStats: PledgeStats = {
  totalPledged: 10000,
  activePledges: 2,
  lockedPledges: 1,
};

// Initialize mock pledges with farmer data
const initializeMockPledges = async () => {
  const farmersResponse = await farmersService.getFarmers();
  if (farmersResponse.success && farmersResponse.data.length > 0) {
    const farmers = farmersResponse.data;
    mockPledges = [
      {
        id: "1",
        pledgerId: "pledger1",
        farmerId: farmers[0].id,
        farmer: farmers[0],
        amount: 5000,
        currency: "HBAR",
        status: "locked",
        createdAt: "2024-02-01T00:00:00Z",
        canWithdraw: false,
        lockEndDate: "2024-06-01T00:00:00Z",
        seasonCycle: "Planting Season 2024",
      },
      {
        id: "2",
        pledgerId: "pledger1",
        farmerId: farmers[1].id,
        farmer: farmers[1],
        amount: 3000,
        currency: "HBAR",
        status: "active",
        createdAt: "2024-01-15T00:00:00Z",
        canWithdraw: true,
        seasonCycle: "Available for Next Cycle",
      },
      {
        id: "3",
        pledgerId: "pledger1",
        farmerId: farmers[2].id,
        farmer: farmers[2],
        amount: 2000,
        currency: "HBAR",
        status: "withdrawn",
        createdAt: "2023-12-01T00:00:00Z",
        canWithdraw: false,
      },
    ];
  }
};

export class PledgesService {
  constructor() {
    // Initialize mock data
    initializeMockPledges();
  }

  // Get pledges with optional filters
  async getPledges(filters?: PledgeFilters): Promise<ApiResponse<Pledge[]>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 250 + Math.random() * 400)
      );

      let filteredPledges = [...mockPledges];

      if (filters?.pledgerId) {
        filteredPledges = filteredPledges.filter(
          (pledge) => pledge.pledgerId === filters.pledgerId
        );
      }

      if (filters?.farmerId) {
        filteredPledges = filteredPledges.filter(
          (pledge) => pledge.farmerId === filters.farmerId
        );
      }

      if (filters?.status) {
        filteredPledges = filteredPledges.filter(
          (pledge) => pledge.status === filters.status
        );
      }

      return {
        data: filteredPledges,
        success: true,
        message: "Pledges retrieved successfully",
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: "Failed to retrieve pledges",
      };
    }
  }

  // Get pledge statistics for a user
  async getPledgeStats(pledgerId: string): Promise<ApiResponse<PledgeStats>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 150 + Math.random() * 300)
      );

      // Calculate stats from current pledges
      const userPledges = mockPledges.filter((p) => p.pledgerId === pledgerId);
      const activePledges = userPledges.filter((p) => p.status === "active");
      const lockedPledges = userPledges.filter((p) => p.status === "locked");
      const totalPledged = userPledges.reduce(
        (sum, pledge) =>
          pledge.status !== "withdrawn" ? sum + pledge.amount : sum,
        0
      );

      const stats: PledgeStats = {
        totalPledged,
        activePledges: activePledges.length,
        lockedPledges: lockedPledges.length,
      };

      return {
        data: stats,
        success: true,
        message: "Pledge stats retrieved successfully",
      };
    } catch (error) {
      return {
        data: mockPledgeStats,
        success: false,
        message: "Failed to retrieve pledge stats",
      };
    }
  }

  // Create new pledge
  async createPledge(
    pledgeData: CreatePledgeRequest
  ): Promise<ApiResponse<Pledge>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 600 + Math.random() * 600)
      );

      // Get farmer data
      const farmerResponse = await farmersService.getFarmerById(
        pledgeData.farmerId
      );
      if (!farmerResponse.success || !farmerResponse.data) {
        return {
          data: {} as Pledge,
          success: false,
          message: "Farmer not found",
        };
      }

      const newPledge: Pledge = {
        id: Date.now().toString(),
        pledgerId: "current-user", // In real implementation, this would come from auth
        farmerId: pledgeData.farmerId,
        farmer: farmerResponse.data,
        amount: pledgeData.amount,
        currency: pledgeData.currency,
        status: "active",
        createdAt: new Date().toISOString(),
        canWithdraw: true,
        seasonCycle: "Available for Next Cycle",
      };

      mockPledges.push(newPledge);

      return {
        data: newPledge,
        success: true,
        message: "Pledge created successfully",
      };
    } catch (error) {
      throw new Error("Failed to create pledge");
    }
  }

  // Update existing pledge (increase or withdraw)
  async updatePledge(
    request: UpdatePledgeRequest
  ): Promise<ApiResponse<Pledge>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + Math.random() * 500)
      );

      const pledgeIndex = mockPledges.findIndex(
        (p) => p.id === request.pledgeId
      );
      if (pledgeIndex === -1) {
        return {
          data: {} as Pledge,
          success: false,
          message: "Pledge not found",
        };
      }

      const pledge = mockPledges[pledgeIndex];

      if (request.action === "increase") {
        pledge.amount += request.amount;
      } else if (request.action === "withdraw") {
        if (!pledge.canWithdraw) {
          return {
            data: pledge,
            success: false,
            message: "Pledge cannot be withdrawn at this time",
          };
        }

        if (request.amount >= pledge.amount) {
          pledge.status = "withdrawn";
          pledge.canWithdraw = false;
        } else {
          pledge.amount -= request.amount;
        }
      }

      mockPledges[pledgeIndex] = pledge;

      return {
        data: pledge,
        success: true,
        message: `Pledge ${request.action} completed successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to ${request.action} pledge`);
    }
  }

  // Get single pledge by ID
  async getPledgeById(id: string): Promise<ApiResponse<Pledge | null>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 150 + Math.random() * 250)
      );

      const pledge = mockPledges.find((p) => p.id === id) || null;

      return {
        data: pledge,
        success: true,
        message: pledge ? "Pledge retrieved successfully" : "Pledge not found",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: "Failed to retrieve pledge",
      };
    }
  }
}

// Export singleton instance
export const pledgesService = new PledgesService();
export default pledgesService;
