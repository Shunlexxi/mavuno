import { useState, useEffect, useCallback } from "react";
import { Pool } from "@/types";
import { poolsService } from "@/services/poolsService";
import { Hex, zeroAddress } from "viem";

interface UsePoolsState {
  pools: Pool[];
  loading: boolean;
  error: string | null;
}

interface UsePoolsReturn extends UsePoolsState {
  refetch: (account: Hex) => Promise<void>;
  generateChartData: (
    supplyApy: number,
    days?: number
  ) => { day: number; apy: number }[];
}

export function usePools(account: Hex): UsePoolsReturn {
  const [state, setState] = useState<UsePoolsState>({
    pools: [],
    loading: true,
    error: null,
  });

  const fetchPools = useCallback(async (account: Hex) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await poolsService.getPools(account);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          pools: response.data,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to fetch pools",
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
  }, []);

  const generateChartData = useCallback(
    (supplyApy: number, days: number = 30) => {
      return poolsService.generatePoolChartData(supplyApy, days);
    },
    []
  );

  useEffect(() => {
    fetchPools(account);
  }, [account, fetchPools]);

  return {
    ...state,
    refetch: fetchPools,
    generateChartData,
  };
}

interface UsePoolState {
  pool: Pool | null;
  loading: boolean;
  error: string | null;
}

interface UsePoolReturn extends UsePoolState {
  refetch: () => Promise<void>;
}

export function usePool(
  address: Hex,
  account: Hex = zeroAddress
): UsePoolReturn {
  const [state, setState] = useState<UsePoolState>({
    pool: null,
    loading: true,
    error: null,
  });

  const fetchPool = useCallback(async () => {
    if (!address) return;

    try {
      const response = await poolsService.getPoolByAddress(address, account);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          pool: response.data,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to fetch pool",
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
  }, [address, account]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  return {
    ...state,
    refetch: fetchPool,
  };
}
