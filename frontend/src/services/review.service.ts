import axios from 'axios';
import type {
  AccessibilityReview,
  ReviewListResponse,
  ReviewResponse,
  ReviewSearchResponse,
} from '../types/review.type';
import authHeader from '@/services/auth-header.ts';

const API_URL = `${import.meta.env.VITE_API_URL}/review`;

const getHeaders = () => {
  return {
    headers: authHeader(),
  };
};

type ReviewListFilters = {
  spaceId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
};

class ReviewService {
  getAllReviews(page = 1, items = 10, filters?: ReviewListFilters) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('items', items.toString());

    if (filters?.spaceId) params.append('spaceId', filters.spaceId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.minRating !== undefined) params.append('minRating', filters.minRating.toString());
    if (filters?.maxRating !== undefined) params.append('maxRating', filters.maxRating.toString());

    return axios.get<ReviewListResponse>(`${API_URL}/list?${params.toString()}`);
  }

  searchReviews(query: string, spaceId?: string) {
    const params = new URLSearchParams();
    params.append('q', query);
    if (spaceId) params.append('spaceId', spaceId);

    return axios.get<ReviewSearchResponse>(`${API_URL}/search?${params.toString()}`);
  }

  getReviewById(id: string) {
    return axios.get<ReviewResponse>(`${API_URL}/read/${id}`);
  }

  deleteReview(id: string) {
    return axios.delete<{ success: boolean; result: AccessibilityReview; message: string }>(
      `${API_URL}/delete/${id}`,
      getHeaders(),
    );
  }
}

export default new ReviewService();
