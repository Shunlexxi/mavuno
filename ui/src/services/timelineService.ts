import { TimelinePost } from "../types";
import {
  ApiResponse,
  CreateTimelinePostRequest,
  TimelineFilters,
} from "../types/api";
import { farmersService } from "./farmersService";

// Mock data (to be removed when backend is integrated)
let mockTimelinePosts: TimelinePost[] = [];

// Initialize mock timeline posts with farmer data
const initializeMockPosts = async () => {
  const farmersResponse = await farmersService.getFarmers();
  if (farmersResponse.success && farmersResponse.data.length > 0) {
    const farmers = farmersResponse.data;
    mockTimelinePosts = [
      {
        id: "1",
        farmerId: farmers[0].id,
        farmer: farmers[0],
        content:
          "Exciting update! Our maize is showing excellent growth after the recent rains. The new irrigation system we installed with the community loan is working perfectly. Expecting a 30% increase in yield this season! 🌽",
        images: ["/api/placeholder/400/300", "/api/placeholder/400/300"],
        type: "update",
        createdAt: "2024-03-15T10:30:00Z",
        likes: 24,
        comments: 8,
      },
      {
        id: "2",
        farmerId: farmers[1].id,
        farmer: farmers[1],
        content:
          "Harvest milestone achieved! Successfully harvested 2 tons of cassava this week. Thanks to all the pledgers who made this possible. The quality is exceptional and we are already getting great market prices. 🎉",
        images: ["/api/placeholder/400/300"],
        type: "harvest",
        createdAt: "2024-03-14T14:15:00Z",
        likes: 45,
        comments: 12,
      },
      {
        id: "3",
        farmerId: farmers[2].id,
        farmer: farmers[2],
        content:
          "Community milestone! We have successfully trained 20 local farmers in modern rice cultivation techniques. The knowledge sharing continues to strengthen our agricultural community. Together we grow! 🌾",
        images: [
          "/api/placeholder/400/300",
          "/api/placeholder/400/300",
          "/api/placeholder/400/300",
        ],
        type: "milestone",
        createdAt: "2024-03-13T09:00:00Z",
        likes: 67,
        comments: 18,
      },
      {
        id: "4",
        farmerId: farmers[0].id,
        farmer: farmers[0],
        content:
          "Need support for the upcoming planting season. Looking to expand our soybean cultivation to 2 additional hectares. This will help us increase productivity and create more employment opportunities in our community.",
        type: "request",
        createdAt: "2024-03-12T11:45:00Z",
        likes: 15,
        comments: 6,
      },
    ];
  }
};

export class TimelineService {
  constructor() {
    // Initialize mock data
    initializeMockPosts();
  }

  // Get timeline posts with optional filters
  async getTimelinePosts(
    filters?: TimelineFilters
  ): Promise<ApiResponse<TimelinePost[]>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 300 + Math.random() * 500)
      );

      let filteredPosts = [...mockTimelinePosts];

      // Filter by farmer ID
      if (filters?.farmerId) {
        filteredPosts = filteredPosts.filter(
          (post) => post.farmerId === filters.farmerId
        );
      }

      // Filter by type
      if (filters?.type) {
        filteredPosts = filteredPosts.filter(
          (post) => post.type === filters.type
        );
      }

      // Sort by creation date (newest first)
      filteredPosts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Apply pagination
      if (filters?.limit || filters?.offset) {
        const offset = filters.offset || 0;
        const limit = filters.limit || 10;
        filteredPosts = filteredPosts.slice(offset, offset + limit);
      }

      return {
        data: filteredPosts,
        success: true,
        message: "Timeline posts retrieved successfully",
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: "Failed to retrieve timeline posts",
      };
    }
  }

  // Create new timeline post
  async createTimelinePost(
    farmerId: string,
    postData: CreateTimelinePostRequest
  ): Promise<ApiResponse<TimelinePost>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 400 + Math.random() * 600)
      );

      // Get farmer data
      const farmerResponse = await farmersService.getFarmerById(farmerId);
      if (!farmerResponse.success || !farmerResponse.data) {
        return {
          data: {} as TimelinePost,
          success: false,
          message: "Farmer not found",
        };
      }

      const newPost: TimelinePost = {
        id: Date.now().toString(),
        farmerId,
        farmer: farmerResponse.data,
        content: postData.content,
        images: postData.images,
        type: postData.type,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
      };

      mockTimelinePosts.unshift(newPost); // Add to beginning (newest first)

      return {
        data: newPost,
        success: true,
        message: "Timeline post created successfully",
      };
    } catch (error) {
      throw new Error("Failed to create timeline post");
    }
  }

  // Get single timeline post by ID
  async getTimelinePostById(
    id: string
  ): Promise<ApiResponse<TimelinePost | null>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 150 + Math.random() * 250)
      );

      const post = mockTimelinePosts.find((p) => p.id === id) || null;

      return {
        data: post,
        success: true,
        message: post
          ? "Timeline post retrieved successfully"
          : "Timeline post not found",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: "Failed to retrieve timeline post",
      };
    }
  }

  // Update timeline post (like, comment, etc.)
  async updateTimelinePost(
    id: string,
    updates: Partial<Pick<TimelinePost, "likes" | "comments">>
  ): Promise<ApiResponse<TimelinePost>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 300)
      );

      const postIndex = mockTimelinePosts.findIndex((p) => p.id === id);
      if (postIndex === -1) {
        return {
          data: {} as TimelinePost,
          success: false,
          message: "Timeline post not found",
        };
      }

      mockTimelinePosts[postIndex] = {
        ...mockTimelinePosts[postIndex],
        ...updates,
      };

      return {
        data: mockTimelinePosts[postIndex],
        success: true,
        message: "Timeline post updated successfully",
      };
    } catch (error) {
      throw new Error("Failed to update timeline post");
    }
  }

  // Delete timeline post
  async deleteTimelinePost(id: string): Promise<ApiResponse<boolean>> {
    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 250 + Math.random() * 350)
      );

      const postIndex = mockTimelinePosts.findIndex((p) => p.id === id);
      if (postIndex === -1) {
        return {
          data: false,
          success: false,
          message: "Timeline post not found",
        };
      }

      mockTimelinePosts.splice(postIndex, 1);

      return {
        data: true,
        success: true,
        message: "Timeline post deleted successfully",
      };
    } catch (error) {
      throw new Error("Failed to delete timeline post");
    }
  }
}

// Export singleton instance
export const timelineService = new TimelineService();
export default timelineService;
