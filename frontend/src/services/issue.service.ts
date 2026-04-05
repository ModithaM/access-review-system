import axios from 'axios';
import authService from './auth.service';

const API_URL = `${import.meta.env.VITE_API_URL}issue`;

export interface Issue {
  _id?: string;
  title: string;
  location: string;
  description: string;
  reporter?: string;
  reporterEmail?: string;
  category?: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'Open' | 'In Progress' | 'Resolved';
  adminNotes?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  responseTime?: string;
  resolutionTime?: string;
}

export interface IssueResponse {
  success: boolean;
  result: Issue;
  message: string;
}

export interface IssueListResponse {
  success: boolean;
  result: {
    data: Issue[];
    pagination: {
      page: number;
      items: number;
      total: number;
      pages: number;
    };
  };
  message: string;
}

export interface StatsResponse {
  success: boolean;
  result: {
    summary: {
      total: number;
      open: number;
      inProgress: number;
      resolved: number;
    };
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    responseMetrics: {
      avgResponseTime: number;
      minResponseTime: number;
      maxResponseTime: number;
    };
  };
  message: string;
}

const getHeaders = () => {
  const token = authService.getToken();
  return {
    headers: {
      'x-auth-token': token ? token : '',
    },
  };
};

class IssueService {
  // Public - Create issue (no auth required)
  createIssue(data: Omit<Issue, '_id' | 'createdAt' | 'updatedAt'>) {
    return axios.post<IssueResponse>(`${API_URL}/create`, data);
  }

  // Admin - Get all issues
  getAllIssues(page = 1, items = 10, search?: string, filters?: any) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('items', items.toString());

    if (search) params.append('search', search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.category) params.append('category', filters.category);

    return axios.get<IssueListResponse>(`${API_URL}/admin/all?${params.toString()}`, getHeaders());
  }

  // Admin - Get statistics
  getStats() {
    return axios.get<StatsResponse>(`${API_URL}/admin/stats`, getHeaders());
  }

  // Admin - Get single issue
  getIssueById(id: string) {
    return axios.get<IssueResponse>(`${API_URL}/admin/${id}`, getHeaders());
  }

  // Admin - Update issue
  updateIssue(id: string, data: Partial<Issue>) {
    const payload = {
      ...data,
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.severity !== undefined ? { severity: data.severity } : {}),
      ...(data.adminNotes !== undefined ? { adminNotes: data.adminNotes } : {}),
    };
    return axios.patch<IssueResponse>(`${API_URL}/admin/${id}`, payload, getHeaders());
  }

  // Admin - Delete issue
  deleteIssue(id: string) {
    return axios.delete<{ success: boolean; message: string }>(
      `${API_URL}/admin/${id}`,
      getHeaders(),
    );
  }

  // User - Get own issues
  getMyIssues(page = 1, items = 10) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('items', items.toString());
    return axios.get<IssueListResponse>(
      `${API_URL}/user/my-issues?${params.toString()}`,
      getHeaders(),
    );
  }
}

export default new IssueService();
