import { useState, useEffect, useCallback } from "react";
import { Farmer } from "../types";
import { farmersService } from "../services/farmersService";
import { FarmerFilters, CreateFarmerRequest } from "../types/api";

interface UseFarmersState {
  farmers: Farmer[];
  loading: boolean;
  error: string | null;
}

interface UseFarmersReturn extends UseFarmersState {
  refetch: () => Promise<void>;
  createFarmer: (farmerData: CreateFarmerRequest) => Promise<Farmer | null>;
  updateFarmer: (
    id: string,
    updates: Partial<Farmer>
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
      setState((prev) => ({ ...prev, loading: true, error: null }));

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
    async (farmerData: CreateFarmerRequest): Promise<Farmer | null> => {
      try {
        const response = await farmersService.createFarmer(farmerData);

        if (response.success) {
          // Refresh the farmers list
          await fetchFarmers();
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
    [fetchFarmers]
  );

  const updateFarmer = useCallback(
    async (id: string, updates: Partial<Farmer>): Promise<Farmer | null> => {
      try {
        const response = await farmersService.updateFarmer(id, updates);

        if (response.success) {
          // Update the farmers list locally
          setState((prev) => ({
            ...prev,
            farmers: prev.farmers.map((farmer) =>
              farmer.id === id ? response.data : farmer
            ),
          }));
          return response.data;
        } else {
          setState((prev) => ({
            ...prev,
            error: response.message || "Failed to update farmer",
          }));
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update farmer";
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
    updateFarmer,
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

export function useFarmer(id: string): UseFarmerReturn {
  const [state, setState] = useState<UseFarmerState>({
    farmer: null,
    loading: true,
    error: null,
  });

  const fetchFarmer = useCallback(async () => {
    if (!id) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await farmersService.getFarmerById(id);

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
  }, [id]);

  useEffect(() => {
    fetchFarmer();
  }, [fetchFarmer]);

  return {
    ...state,
    refetch: fetchFarmer,
  };
}
