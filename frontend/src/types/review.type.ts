export interface ReviewFeature {
  featureName: string;
  available: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'not_available';
}

export interface ReviewUser {
  _id?: string;
  name?: string;
  surname?: string;
  email?: string;
  userType?: string;
}

export interface ReviewSpace {
  _id?: string;
  name?: string;
  category?: string;
  location?: string;
  locationDetails?: {
    address?: string;
    city?: string;
    district?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  imageUrl?: string;
  description?: string;
}

export interface AccessibilityReview {
  _id?: string;
  spaceId: string | ReviewSpace;
  userId: string | ReviewUser;
  rating: number;
  comment: string;
  features?: ReviewFeature[];
  title?: string;
  removed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewListResponse {
  success: boolean;
  result: AccessibilityReview[];
  pagination: {
    page: number;
    pages: number;
    count: number;
  };
  message: string;
}

export interface ReviewResponse {
  success: boolean;
  result: AccessibilityReview;
  message: string;
}

export interface ReviewSearchResponse {
  success: boolean;
  result: AccessibilityReview[];
  message: string;
}
