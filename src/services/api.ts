import type { Product } from '../types';

const API_BASE_URL = 'https://stageapi.monkcommerce.app/task/products/search';
const API_KEY = import.meta.env.VITE_API_KEY;

export interface SearchParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchProducts(params: SearchParams = {}): Promise<Product[]> {
  if (!API_KEY ) {
    throw new Error('API Key is missing');
  }

  const { search = '', page = 0, limit = 10 } = params;
  const queryParams = new URLSearchParams({
    search: search.trim(),
    page: Math.max(0, page).toString(),
    limit: Math.max(1, Math.min(100, limit)).toString(),
  });

  const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid or missing API key. Please check your VITE_API_KEY in .env file.');
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

