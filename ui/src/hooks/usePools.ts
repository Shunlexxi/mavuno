import { useState, useEffect, useCallback } from "react";
import { Pool, PoolPosition } from "@/types";
import { poolsService } from "@/services/poolsService";
import { Hex } from "viem";

interface UsePoolsState {
  pools: Pool[];
  loading: boolean;
  error: string | null;
}

interface UsePoolsReturn extends UsePoolsState {
  refetch: () => Promise<void>;
  generateChartData: (
    supplyApy: number,
    days?: number
  ) => { day: number; apy: number }[];
}

export function usePools(): UsePoolsReturn {
  const [state, setState] = useState<UsePoolsState>({
    pools: [],
    loading: true,
    error: null,
  });

  const fetchPools = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await poolsService.getPools();

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
    fetchPools();
  }, [fetchPools]);

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

export function usePool(address: Hex): UsePoolReturn {
  const [state, setState] = useState<UsePoolState>({
    pool: null,
    loading: true,
    error: null,
  });

  const fetchPool = useCallback(async () => {
    if (!address) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await poolsService.getPoolByAddress(address);

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
  }, [address]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  return {
    ...state,
    refetch: fetchPool,
  };
}

interface UsePoolPositionsState {
  position: PoolPosition | null;
  loading: boolean;
  error: string | null;
}

interface UsePoolPositionsReturn extends UsePoolPositionsState {
  refetch: () => Promise<void>;
}

export function usePoolPositions(
  address: Hex,
  account: Hex
): UsePoolPositionsReturn {
  const [state, setState] = useState<UsePoolPositionsState>({
    position: null,
    loading: true,
    error: null,
  });

  const fetchPositions = useCallback(async () => {
    if (!address || !account) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await poolsService.getAccountPoolPosition(
        address,
        account
      );

      if (response.success) {
        setState((prev) => ({
          ...prev,
          position: response.data,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.message || "Failed to fetch positions",
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
    fetchPositions();
  }, [fetchPositions]);

  return {
    ...state,
    refetch: fetchPositions,
  };
}
