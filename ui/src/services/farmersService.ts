import { Farmer } from "@/types";
import { ApiResponse, CreateFarmerRequest, FarmerFilters } from "@/types/api";
import { Hex } from "viem";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  getFirestore,
  where,
} from "firebase/firestore";

export class FarmersService {
  async getFarmers(filters?: FarmerFilters): Promise<ApiResponse<Farmer[]>> {
    try {
      const db = getFirestore();
      const dbRef = collection(db, "farmers");
      let q = query(dbRef);

      if (filters?.searchTerm) {
        q = query(q, where("name", "in", filters?.searchTerm));
      }

      if (filters?.cropType) {
        q = query(q, where("farmerAddress", "==", filters?.cropType));
      }

      if (filters?.location) {
        q = query(q, where("location", "==", filters?.location));
      }

      if (filters?.verified !== undefined) {
        q = query(q, where("verified", "==", filters?.verified));
      }

      const querySnapshot = await getDocs(q);

      const farmers: Farmer[] = [];

      querySnapshot.forEach((doc) => {
        farmers.push(doc.data() as Farmer);
      });

      return {
        data: farmers,
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

  async getFarmerByAddress(
    address: string
  ): Promise<ApiResponse<Farmer | null>> {
    try {
      const db = getFirestore();
      const docSnap = await getDoc(doc(db, "farmers", address));

      if (docSnap.exists()) {
        return {
          data: docSnap.data() as Farmer,
          success: true,
          message: "Farmer retrieved successfully",
        };
      } else {
        return {
          data: null,
          success: false,
          message: "Farmer not found",
        };
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        message: "Failed to retrieve farmer",
      };
    }
  }

  async createFarmer(
    address: Hex,
    pledgeManager: Hex,
    farmerData: CreateFarmerRequest
  ): Promise<ApiResponse<Farmer>> {
    try {
      const newFarmer: Farmer = {
        ...farmerData,
        pledgeManager,
        address,
        verified: false,
        createdAt: new Date().toLocaleString(),
        totalBorrowed: 0,
        totalRepaid: 0,
      };

      const db = getFirestore();
      await setDoc(doc(db, "farmers", address), newFarmer, { merge: true });

      return {
        data: newFarmer,
        success: true,
        message: "Farmer created successfully",
      };
    } catch (error) {
      throw new Error("Failed to create farmer");
    }
  }
}

// Export singleton instance
export const farmersService = new FarmersService();
export default farmersService;
