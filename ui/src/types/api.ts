// API Request/Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Request Types
export interface CreateFarmerRequest {
  name: string;
  email: string;
  location: string;
  farmSize: string;
  cropType: string;
  description: string;
  preferredPool: 'NGN' | 'CEDI' | 'RAND';
}

export interface CreatePledgeRequest {
  farmerId: string;
  amount: number;
  currency: 'HBAR';
}

export interface UpdatePledgeRequest {
  pledgeId: string;
  amount: number;
  action: 'increase' | 'withdraw';
}

export interface CreateTimelinePostRequest {
  content: string;
  type: 'update' | 'milestone' | 'harvest' | 'request';
  images?: string[];
}

export interface PoolActionRequest {
  poolId: string;
  amount: number;
  action: 'supply' | 'borrow' | 'withdraw' | 'repay';
}

// Filter Types
export interface FarmerFilters {
  searchTerm?: string;
  cropType?: string;
  location?: string;
  verified?: boolean;
}

export interface TimelineFilters {
  farmerId?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface PledgeFilters {
  pledgerId?: string;
  farmerId?: string;
  status?: 'active' | 'withdrawn' | 'locked';
}