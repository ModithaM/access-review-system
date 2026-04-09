export type SpaceCategory = 'Mall' | 'Park' | 'Hospital' | 'Station' | 'Other';

export interface SpaceCoordinates {
  lat: number;
  lng: number;
}

export interface LocationDetails {
  address: string;
  coordinates: SpaceCoordinates;
}

export interface PublicSpaceAccessFeature {
  _id: string;
  name: string;
  description?: string;
  category?: 'Mobility' | 'Visual' | 'Auditory' | 'Cognitive' | 'Other';
  isActive?: boolean;
}

export interface PublicSpace {
  _id: string;
  id?: string;
  name: string;
  category: SpaceCategory;
  locationDetails: LocationDetails;
  imageUrl?: string;
  description?: string;
  accessFeatures?: PublicSpaceAccessFeature[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePublicSpaceDTO {
  name: string;
  category: SpaceCategory;
  locationDetails: LocationDetails;
  imageUrl?: string;
  description?: string;
  accessFeatures?: string[];
}

export interface UpdatePublicSpaceDTO {
  name?: string;
  category?: SpaceCategory;
  locationDetails?: LocationDetails;
  imageUrl?: string;
  description?: string;
  accessFeatures?: string[];
}
