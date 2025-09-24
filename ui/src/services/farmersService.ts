import { apiClient } from "./api";
import { Farmer } from "@/types";
import { ApiResponse, CreateFarmerRequest, FarmerFilters } from "@/types/api";

// Mock data (to be removed when backend is integrated)
const mockFarmers: Farmer[] = [
  {
    name: "Sarah Okafor",
    email: "sarah.okafor@email.com",
    avatar: "/api/placeholder/150/150",
    location: "Kaduna State, Nigeria",
    farmSize: "5 hectares",
    cropType: "Maize & Soybeans",
    description:
      "Dedicated farmer with 10 years of experience in sustainable agriculture. Specializing in maize and soybean production with modern farming techniques.",
    verified: true,
    totalLoans: 45000,
    totalRepaid: 40000,
    createdAt: "2024-01-15",
  },
  {
    name: "John Adebayo",
    email: "john.adebayo@email.com",
    avatar: "/api/placeholder/150/150",
    location: "Ogun State, Nigeria",
    farmSize: "3 hectares",
    cropType: "Cassava & Yam",
    description:
      "Young entrepreneur focused on root crop cultivation. Using innovative techniques to maximize yield and sustainability.",
    verified: true,
    totalLoans: 25000,
    totalRepaid: 22000,
    createdAt: "2024-02-10",
  },
  {
    name: "Fatima Hassan",
    email: "fatima.hassan@email.com",
    avatar: "/api/placeholder/150/150",
    location: "Kano State, Nigeria",
    farmSize: "7 hectares",
    cropType: "Rice & Millet",
    description:
      "Experienced rice farmer committed to food security. Leading community efforts in modern irrigation and crop management.",
    verified: true,
    totalLoans: 60000,
    totalRepaid: 55000,
    createdAt: "2024-01-20",
  },
];

export class FarmersService {
  // Get all farmers with optional filters
  async getFarmers(filters?: FarmerFilters): Promise<ApiResponse<Farmer[]>> {
    try {
      // Simulate API call - will be replaced with actual API call
      let filteredFarmers = [...mockFarmers];

      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredFarmers = filteredFarmers.filter(
          (farmer) =>
            farmer.name.toLowerCase().includes(searchTerm) ||
            farmer.cropType.toLowerCase().includes(searchTerm) ||
            farmer.location.toLowerCase().includes(searchTerm)
        );
      }

      if (filters?.cropType) {
        filteredFarmers = filteredFarmers.filter((farmer) =>
          farmer.cropType
            .toLowerCase()
            .includes(filters.cropType!.toLowerCase())
        );
      }

      if (filters?.location) {
        filteredFarmers = filteredFarmers.filter((farmer) =>
          farmer.location
            .toLowerCase()
            .includes(filters.location!.toLowerCase())
        );
      }

      if (filters?.verified !== undefined) {
        filteredFarmers = filteredFarmers.filter(
          (farmer) => farmer.verified === filters.verified
        );
      }

      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 300 + Math.random() * 500)
      );

      return {
        data: filteredFarmers,
        success: true,
        message: "Farmers retrieved successfully",
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: "Failed to retrieve farmers",
      };
    }
  }

  // Get single farmer by ID
  async getFarmerById(address: string): Promise<ApiResponse<Farmer | null>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 300)
      );

      const farmer = mockFarmers.find((f) => f.address === address) || null;

      return {
        data: farmer,
        success: true,
        message: farmer ? "Farmer retrieved successfully" : "Farmer not found",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: "Failed to retrieve farmer",
      };
    }
  }

  // Create new farmer
  async createFarmer(
    farmerData: CreateFarmerRequest
  ): Promise<ApiResponse<Farmer>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + Math.random() * 500)
      );

      const newFarmer: Farmer = {
        ...farmerData,
        avatar: "/api/placeholder/150/150",
        verified: false, // New farmers start unverified
        totalLoans: 0,
        totalRepaid: 0,
        createdAt: new Date().toISOString(),
      };

      // In real implementation, this would be saved to backend
      mockFarmers.push(newFarmer);

      return {
        data: newFarmer,
        success: true,
        message: "Farmer created successfully",
      };
    } catch (error) {
      throw new Error("Failed to create farmer");
    }
  }

  // Update farmer profile
  async updateFarmer(
    address: string,
    updates: Partial<Farmer>
  ): Promise<ApiResponse<Farmer>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 400 + Math.random() * 400)
      );

      const farmerIndex = mockFarmers.findIndex((f) => f.address === address);
      if (farmerIndex === -1) {
        return {
          data: {} as Farmer,
          success: false,
          message: "Farmer not found",
        };
      }

      // Update farmer
      mockFarmers[farmerIndex] = { ...mockFarmers[farmerIndex], ...updates };

      return {
        data: mockFarmers[farmerIndex],
        success: true,
        message: "Farmer updated successfully",
      };
    } catch (error) {
      throw new Error("Failed to update farmer");
    }
  }
}

// Export singleton instance
export const farmersService = new FarmersService();
export default farmersService;
