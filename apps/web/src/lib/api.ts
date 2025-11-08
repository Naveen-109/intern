// Use relative paths for API routes (works with Vercel)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Stats
export interface Stats {
  totalSpend: number;
  totalInvoicesProcessed: number;
  documentsUploaded: number;
  averageInvoiceValue: number;
}

export async function getStats(): Promise<Stats> {
  return fetchAPI<Stats>('/stats');
}

// Invoice Trends
export interface InvoiceTrend {
  month: string;
  invoiceCount: number;
  totalSpend: number;
}

export async function getInvoiceTrends(months?: number): Promise<InvoiceTrend[]> {
  const params = months ? `?months=${months}` : '';
  return fetchAPI<InvoiceTrend[]>(`/invoice-trends${params}`);
}

// Top Vendors
export interface TopVendor {
  id: string;
  name: string;
  totalSpend: number;
}

export async function getTopVendors(): Promise<TopVendor[]> {
  return fetchAPI<TopVendor[]>('/vendors/top10');
}

// Category Spend
export interface CategorySpend {
  category: string;
  total: number;
}

export async function getCategorySpend(): Promise<CategorySpend[]> {
  return fetchAPI<CategorySpend[]>('/category-spend');
}

// Cash Outflow
export interface CashOutflow {
  date: string;
  amount: number;
}

export async function getCashOutflow(startDate?: string, endDate?: string): Promise<CashOutflow[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI<CashOutflow[]>(`/cash-outflow${query}`);
}

// Invoices
export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  vendorId: string;
  customer: string | null;
  issueDate: string;
  dueDate: string | null;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  currency: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getInvoices(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendorId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<InvoicesResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.vendorId) queryParams.append('vendorId', params.vendorId);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return fetchAPI<InvoicesResponse>(`/invoices${query}`);
}

// Chat with Data
export interface ChatResponse {
  sql: string;
  data: any[];
  message?: string;
}

export async function chatWithData(query: string): Promise<ChatResponse> {
  return fetchAPI<ChatResponse>('/chat-with-data', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

