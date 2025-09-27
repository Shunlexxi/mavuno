import { useState, useEffect, useCallback } from "react";
import { Pledge } from "@/types";
import { pledgesService } from "@/services/pledgesService";
import { PledgeFilters, PledgeRequest } from "@/types/api";
import { Hex } from "viem";

interface UsePledgesState {
  pledges: Pledge[];
  loading: boolean;
  error: string | null;
}

interface UsePledgesReturn extends UsePledgesState {
  refetch: () => Promise<void>;
  createPledge: (
    pledgeAddress: Hex,
    pledgeData: PledgeRequest
  ) => Promise<Pledge | null>;
}

export function usePledges(filters?: PledgeFilters): UsePledgesReturn {
  const [state, setState] = useState<UsePledgesState>({
    pledges: [],
    loading: true,
    error: null,
  });

  const fetchPledges = useCallback(async () => {
    try {
      const response = await pledgesService.getPledges(filters);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          pledges: response.data,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to fetch pledges",
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

  const createPledge = useCallback(
    async (
      pledgeAddress: Hex,
      pledgeData: PledgeRequest
    ): Promise<Pledge | null> => {
      try {
        const response = await pledgesService.createPledge(
          pledgeAddress,
          pledgeData
        );

        if (response.success) {
          return response.data;
        } else {
          setState((prev) => ({
            ...prev,
            error: response.message || "Failed to create pledge",
          }));
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create pledge";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return null;
      }
    },
    []
  );

  useEffect(() => {
    fetchPledges();
  }, [fetchPledges]);

  return {
    ...state,
    refetch: fetchPledges,
    createPledge,
  };
}
