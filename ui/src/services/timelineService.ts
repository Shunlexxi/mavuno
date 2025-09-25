import { TimelinePost } from "@/types";
import {
  ApiResponse,
  CreateTimelinePostRequest,
  TimelineFilters,
} from "@/types/api";
import { farmersService } from "./farmersService";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  getFirestore,
  deleteDoc,
  where,
} from "firebase/firestore";
import { Hex } from "viem";
export class TimelineService {
  async getTimelinePosts(
    filters?: TimelineFilters
  ): Promise<ApiResponse<TimelinePost[]>> {
    try {
      const db = getFirestore();
      const dbRef = collection(db, "timelines");
      let q = query(dbRef);

      if (filters?.address) {
        q = query(q, where("address", "==", filters?.address));
      }

      if (filters?.type) {
        q = query(q, where("type", "==", filters?.type));
      }

      if (filters?.limit || filters?.offset) {
        q = query(q, where("type", "==", filters?.type));
      }

      const querySnapshot = await getDocs(q);

      const timelines: TimelinePost[] = [];

      querySnapshot.forEach((doc) => {
        timelines.push(doc.data() as TimelinePost);
      });

      return {
        data: timelines,
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

  async createTimelinePost(
    address: Hex,
    postData: CreateTimelinePostRequest
  ): Promise<ApiResponse<TimelinePost>> {
    try {
      const farmerResponse = await farmersService.getFarmerByAddress(address);

      const newPost: TimelinePost = {
        id: Date.now().toString(),
        address,
        farmer: farmerResponse.success
          ? {
              name: farmerResponse.data.name,
              address: farmerResponse.data.address,
              pledgeManager: farmerResponse.data.pledgeManager,
              preferredPool: farmerResponse.data.preferredPool,
              location: farmerResponse.data.location,
              farmSize: farmerResponse.data.farmSize,
              cropType: farmerResponse.data.cropType,
              verified: false,
            }
          : null,
        content: postData.content,
        images: postData.images ?? null,
        type: postData.type,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
      };

      const db = getFirestore();
      await setDoc(doc(db, "timelines", newPost.id), newPost, {
        merge: true,
      });

      return {
        data: newPost,
        success: true,
        message: "Timeline post created successfully",
      };
    } catch (error) {
      throw new Error("Failed to create timeline post");
    }
  }

  async deleteTimelinePost(id: string): Promise<ApiResponse<boolean>> {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "timelines", id));

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
