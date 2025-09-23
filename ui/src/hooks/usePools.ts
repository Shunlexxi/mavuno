import { useState, useEffect, useCallback } from 'react';
import { Pool, PoolPosition } from '@/types';
import { poolsService } from '@/services/poolsService';
import { PoolActionRequest } from '@/types/api';

interface UsePoolsState {
  pools: Pool[];
  loading: boolean;
  error: string | null;
}

interface UsePoolsReturn extends UsePoolsState {
  refetch: () => Promise<void>;
  performPoolAction: (request: PoolActionRequest) => Promise<PoolPosition | null>;
  generateChartData: (poolId: string, days?: number) => { day: number; apy: number }[];
}

export function usePools(): UsePoolsReturn {
  const [state, setState] = useState<UsePoolsState>({
    pools: [],
    loading: true,
    error: null,
  });

  const fetchPools = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await poolsService.getPools();
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          pools: response.data,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'Failed to fetch pools',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false,
      }));
    }
  }, []);

  const performPoolAction = useCallback(async (request: PoolActionRequest): Promise<PoolPosition | null> => {
    try {
      const response = await poolsService.performPoolAction(request);
      
      if (response.success) {
        // Refresh pools to get updated stats
        await fetchPools();
        return response.data;
      } else {
        setState(prev => ({ ...prev, error: response.message || 'Failed to perform action' }));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to perform action';
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, [fetchPools]);

  const generateChartData = useCallback((poolId: string, days: number = 30) => {
    return poolsService.generatePoolChartData(poolId, days);
  }, []);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  return {
    ...state,
    refetch: fetchPools,
    performPoolAction,
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

export function usePool(id: string): UsePoolReturn {
  const [state, setState] = useState<UsePoolState>({
    pool: null,
    loading: true,
    error: null,
  });

  const fetchPool = useCallback(async () => {
    if (!id) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await poolsService.getPoolById(id);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          pool: response.data,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'Failed to fetch pool',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false,
      }));
    }
  }, [id]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  return {
    ...state,
    refetch: fetchPool,
  };
}

interface UsePoolPositionsState {
  positions: PoolPosition[];
  loading: boolean;
  error: string | null;
}

interface UsePoolPositionsReturn extends UsePoolPositionsState {
  refetch: () => Promise<void>;
}

export function usePoolPositions(userId: string): UsePoolPositionsReturn {
  const [state, setState] = useState<UsePoolPositionsState>({
    positions: [],
    loading: true,
    error: null,
  });

  const fetchPositions = useCallback(async () => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await poolsService.getUserPoolPositions(userId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          positions: response.data,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'Failed to fetch positions',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false,
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return {
    ...state,
    refetch: fetchPositions,
  };
}