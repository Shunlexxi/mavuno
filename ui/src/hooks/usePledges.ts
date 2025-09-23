import { useState, useEffect, useCallback } from 'react';
import { Pledge, PledgeStats } from '@/types';
import { pledgesService } from '@/services/pledgesService';
import { PledgeFilters, CreatePledgeRequest, UpdatePledgeRequest } from '@/types/api';

interface UsePledgesState {
  pledges: Pledge[];
  loading: boolean;
  error: string | null;
}

interface UsePledgesReturn extends UsePledgesState {
  refetch: () => Promise<void>;
  createPledge: (pledgeData: CreatePledgeRequest) => Promise<Pledge | null>;
  updatePledge: (request: UpdatePledgeRequest) => Promise<Pledge | null>;
}

export function usePledges(filters?: PledgeFilters): UsePledgesReturn {
  const [state, setState] = useState<UsePledgesState>({
    pledges: [],
    loading: true,
    error: null,
  });

  const fetchPledges = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await pledgesService.getPledges(filters);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          pledges: response.data,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'Failed to fetch pledges',
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
  }, [filters]);

  const createPledge = useCallback(async (pledgeData: CreatePledgeRequest): Promise<Pledge | null> => {
    try {
      const response = await pledgesService.createPledge(pledgeData);
      
      if (response.success) {
        // Refresh the pledges list
        await fetchPledges();
        return response.data;
      } else {
        setState(prev => ({ ...prev, error: response.message || 'Failed to create pledge' }));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create pledge';
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, [fetchPledges]);

  const updatePledge = useCallback(async (request: UpdatePledgeRequest): Promise<Pledge | null> => {
    try {
      const response = await pledgesService.updatePledge(request);
      
      if (response.success) {
        // Update the pledges list locally
        setState(prev => ({
          ...prev,
          pledges: prev.pledges.map(pledge => 
            pledge.id === request.pledgeId ? response.data : pledge
          ),
        }));
        return response.data;
      } else {
        setState(prev => ({ ...prev, error: response.message || 'Failed to update pledge' }));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update pledge';
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, []);

  useEffect(() => {
    fetchPledges();
  }, [fetchPledges]);

  return {
    ...state,
    refetch: fetchPledges,
    createPledge,
    updatePledge,
  };
}

interface UsePledgeState {
  pledge: Pledge | null;
  loading: boolean;
  error: string | null;
}

interface UsePledgeReturn extends UsePledgeState {
  refetch: () => Promise<void>;
}

export function usePledge(id: string): UsePledgeReturn {
  const [state, setState] = useState<UsePledgeState>({
    pledge: null,
    loading: true,
    error: null,
  });

  const fetchPledge = useCallback(async () => {
    if (!id) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await pledgesService.getPledgeById(id);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          pledge: response.data,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'Failed to fetch pledge',
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
    fetchPledge();
  }, [fetchPledge]);

  return {
    ...state,
    refetch: fetchPledge,
  };
}

interface UsePledgeStatsState {
  stats: PledgeStats | null;
  loading: boolean;
  error: string | null;
}

interface UsePledgeStatsReturn extends UsePledgeStatsState {
  refetch: () => Promise<void>;
}

export function usePledgeStats(pledgerId: string): UsePledgeStatsReturn {
  const [state, setState] = useState<UsePledgeStatsState>({
    stats: null,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    if (!pledgerId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await pledgesService.getPledgeStats(pledgerId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          stats: response.data,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'Failed to fetch pledge stats',
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
  }, [pledgerId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    refetch: fetchStats,
  };
}