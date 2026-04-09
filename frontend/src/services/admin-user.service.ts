import axios from 'axios';
import authHeader from './auth-header';

const API_URL = `${import.meta.env.VITE_API_URL}/user`;

export interface AdminUser {
  _id: string;
  name: string;
  surname: string;
  email: string;
  userType: 'admin' | 'user' | 'guest';
  enabled?: boolean;
  removed?: boolean;
  createdAt?: string;
  isLoggedIn?: boolean;
}

interface UserListResponse {
  success: boolean;
  result: AdminUser[];
  pagination: {
    page: number;
    pages: number;
    count: number;
  };
  message: string;
}

class AdminUserService {
  getUsers(page = 1, items = 100) {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('items', String(items));

    return axios.get<UserListResponse>(`${API_URL}/list?${params.toString()}`, {
      headers: authHeader(),
    });
  }
}

export default new AdminUserService();
