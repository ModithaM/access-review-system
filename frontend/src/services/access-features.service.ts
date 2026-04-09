import axios from 'axios';
import authHeader from '@/services/auth-header.ts';

const API_URL = `${import.meta.env.VITE_API_URL}/access-features`;

export interface AccessFeature {
  _id?: string;
  name: string;
  description: string;
  category: 'Mobility' | 'Visual' | 'Auditory' | 'Cognitive' | 'Other';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const getHeaders = () => {
  return {
    headers: authHeader(),
  };
};

class AccessFeaturesService {
  getAllAccessFeatures(activeOnly = false) {
    return axios.get<{
      success: boolean;
      count: number;
      data: AccessFeature[];
    }>(`${API_URL}${activeOnly ? '?activeOnly=true' : ''}`);
  }

  getAccessFeatureById(id: string) {
    return axios.get<{ success: boolean; data: AccessFeature }>(`${API_URL}/${id}`);
  }

  createAccessFeature(data: Omit<AccessFeature, '_id'>) {
    // The backend accepts is_active for creating from req.body
    const payload = {
      ...data,
      is_active: data.isActive,
    };
    return axios.post<{ success: boolean; data: AccessFeature }>(API_URL, payload, getHeaders());
  }

  updateAccessFeature(id: string, data: Partial<AccessFeature>) {
    // The backend accepts is_active for updating from req.body
    const payload = {
      ...data,
      ...(data.isActive !== undefined ? { is_active: data.isActive } : {}),
    };
    return axios.put<{ success: boolean; data: AccessFeature }>(
      `${API_URL}/${id}`,
      payload,
      getHeaders(),
    );
  }

  deleteAccessFeature(id: string) {
    return axios.delete<{
      success: boolean;
      message: string;
      data: AccessFeature;
    }>(`${API_URL}/${id}`, getHeaders());
  }
}

export default new AccessFeaturesService();
