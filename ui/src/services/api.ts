/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from "../types/api";

// Base API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3000/api";

class ApiClient {
  // private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(_: string = API_BASE_URL) {
    // this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Remove authentication token
  clearAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      };

      // For now, simulate API calls with mock data
      // This will be replaced with actual fetch calls when backend is ready
      return this.simulateApiCall<T>(endpoint, config);
    } catch (error) {
      console.error("API Request failed:", error);
      throw new Error("Network request failed");
    }
  }

  // Simulate API calls with mock data (to be replaced with real API)
  private async simulateApiCall<T>(
    _: string,
    __: RequestInit
  ): Promise<ApiResponse<T>> {
    // Add delay to simulate network latency
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 700)
    );

    // Mock successful response
    return {
      data: {} as T, // This will be populated by individual service methods
      success: true,
      message: "Success",
    };
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
