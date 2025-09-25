import { useState, useEffect, useCallback } from "react";
import { Farmer } from "../types";
import { farmersService } from "../services/farmersService";
import { FarmerFilters, CreateFarmerRequest } from "../types/api";
import { Hex } from "viem";

interface UseFarmersState {
  farmers: Farmer[];
  loading: boolean;
  error: string | null;
}

interface UseFarmersReturn extends UseFarmersState {
  refetch: () => Promise<void>;
  createFarmer: (
    address: Hex,
    pledgeManager: Hex,
    farmerData: CreateFarmerRequest
  ) => Promise<Farmer | null>;
}

export function useFarmers(filters?: FarmerFilters): UseFarmersReturn {
  const [state, setState] = useState<UseFarmersState>({
    farmers: [],
    loading: true,
    error: null,
  });

  const fetchFarmers = useCallback(async () => {
    try {
      const response = await farmersService.getFarmers(filters);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          farmers: response.data,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to fetch farmers",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        loading: false,
      }));
    }
  }, [filters]);

  const createFarmer = useCallback(
    async (
      address: Hex,
      pledgeManager: Hex,
      farmerData: CreateFarmerRequest
    ): Promise<Farmer | null> => {
      try {
        const response = await farmersService.createFarmer(
          address,
          pledgeManager,
          farmerData
        );

        if (response.success) {
          return response.data;
        } else {
          setState((prev) => ({
            ...prev,
            error: response.message || "Failed to create farmer",
          }));
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create farmer";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return null;
      }
    },
    []
  );

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  return {
    ...state,
    refetch: fetchFarmers,
    createFarmer,
  };
}

interface UseFarmerState {
  farmer: Farmer | null;
  loading: boolean;
  error: string | null;
}

interface UseFarmerReturn extends UseFarmerState {
  refetch: () => Promise<void>;
}

export function useFarmer(address: Hex): UseFarmerReturn {
  const [state, setState] = useState<UseFarmerState>({
    farmer: null,
    loading: true,
    error: null,
  });

  const fetchFarmer = useCallback(async () => {
    if (!address) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await farmersService.getFarmerByAddress(address);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          farmer: response.data,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to fetch farmer",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        loading: false,
      }));
    }
  }, [address]);

  useEffect(() => {
    fetchFarmer();
  }, [fetchFarmer]);

  return {
    ...state,
    refetch: fetchFarmer,
  };
}
