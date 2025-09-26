import { Pledge } from "@/types";
import { ApiResponse, CreatePledgeRequest, PledgeFilters } from "@/types/api";
import { farmersService } from "./farmersService";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  getFirestore,
  where,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { Hex } from "viem";

export class PledgesService {
  async getPledges(filters?: PledgeFilters): Promise<ApiResponse<Pledge[]>> {
    try {
      const db = getFirestore();
      const dbRef = collection(db, "pledges");
      let q = query(dbRef);

      if (filters?.pledgerAddress) {
        q = query(q, where("pledgerAddress", "==", filters?.pledgerAddress));
      }

      if (filters?.farmerAddress) {
        q = query(q, where("farmerAddress", "==", filters?.farmerAddress));
      }

      const querySnapshot = await getDocs(q);

      const pledges: Pledge[] = [];

      querySnapshot.forEach((doc) => {
        pledges.push(doc.data() as Pledge);
      });

      return {
        data: pledges,
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

  async createPledge(
    pledgerAddress: Hex,
    pledgeData: CreatePledgeRequest
  ): Promise<ApiResponse<Pledge>> {
    try {
      const farmerResponse = await farmersService.getFarmerByAddress(
        pledgeData.farmerAddress
      );

      if (!farmerResponse.success || !farmerResponse.data) {
        return {
          data: {} as Pledge,
          success: false,
          message: "Farmer not found",
        };
      }

      const newPledge: Pledge = {
        id: `${farmerResponse.data.address}-${pledgerAddress}`,
        pledgerAddress,
        farmerAddress: pledgeData.farmerAddress,
        farmer: {
          name: farmerResponse.data.name,
          address: farmerResponse.data.address,
          pledgeManager: farmerResponse.data.pledgeManager,
          preferredPool: farmerResponse.data.preferredPool,
          location: farmerResponse.data.location,
          farmSize: farmerResponse.data.farmSize,
          cropType: farmerResponse.data.cropType,
          verified: false,
        },
        amount: pledgeData.amount,
        currency: pledgeData.currency,
        createdAt: new Date().toISOString(),
      };

      const db = getFirestore();

      const docSnap = await getDoc(doc(db, "pledges", newPledge.id));

      if (docSnap.exists()) {
        await updateDoc(doc(db, "pledges", newPledge.id), {
          amount: increment(newPledge.amount),
          farmer: {
            name: farmerResponse.data.name,
            address: farmerResponse.data.address,
            pledgeManager: farmerResponse.data.pledgeManager,
            preferredPool: farmerResponse.data.preferredPool,
            location: farmerResponse.data.location,
            farmSize: farmerResponse.data.farmSize,
            cropType: farmerResponse.data.cropType,
            verified: false,
          },
        });
      } else {
        await setDoc(doc(db, "pledges", newPledge.id), newPledge, {
          merge: true,
        });
      }

      return {
        data: newPledge,
        success: true,
        message: "Pledge created successfully",
      };
    } catch (error) {
      throw new Error("Failed to create pledge");
    }
  }

  async decreasePledge(
    pledgerAddress: Hex,
    pledgeData: CreatePledgeRequest
  ): Promise<ApiResponse<Partial<Pledge>>> {
    try {
      const farmerResponse = await farmersService.getFarmerByAddress(
        pledgeData.farmerAddress
      );

      if (!farmerResponse.success || !farmerResponse.data) {
        return {
          data: {} as Pledge,
          success: false,
          message: "Farmer not found",
        };
      }

      const pledge: Partial<Pledge> = {
        id: `${farmerResponse.data.address}-${pledgerAddress}`,
      };

      const db = getFirestore();

      const docSnap = await getDoc(doc(db, "pledges", pledge.id));

      if (docSnap.exists()) {
        await updateDoc(doc(db, "pledges", pledge.id), {
          amount: increment(-1 * pledge.amount),
          farmer: {
            name: farmerResponse.data.name,
            address: farmerResponse.data.address,
            pledgeManager: farmerResponse.data.pledgeManager,
            preferredPool: farmerResponse.data.preferredPool,
            location: farmerResponse.data.location,
            farmSize: farmerResponse.data.farmSize,
            cropType: farmerResponse.data.cropType,
            verified: false,
          },
        });
      }

      return {
        data: pledge,
        success: true,
        message: "Pledge created successfully",
      };
    } catch (error) {
      throw new Error("Failed to create pledge");
    }
  }
}

export const pledgesService = new PledgesService();
export default pledgesService;
