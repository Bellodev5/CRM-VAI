// src/services/api.ts
const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? '/api'  
  : 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export const api = {
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    console.log('📤 GET', `${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`);
    const result = await response.json();
    console.log('📥 Response:', result);
    return result;
  },
  
  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    console.log('📤 POST', `${API_URL}${endpoint}`, data);
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log('📥 Response:', result);
    return result;
  },
  
  async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    console.log('📤 PUT', `${API_URL}${endpoint}`, data);
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log('📥 Response:', result);
    return result;
  },
  
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    console.log('📤 DELETE', `${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    console.log('📥 Response:', result);
    return result;
  }
};