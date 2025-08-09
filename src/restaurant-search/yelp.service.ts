import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface YelpBusiness {
  id: string;
  name: string;
  image_url: string;
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: Array<{
    alias: string;
    title: string;
  }>;
  rating: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  transactions: string[];
  price?: string;
  location: {
    address1: string;
    address2?: string;
    address3?: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  phone: string;
  display_phone: string;
  distance?: number;
}

export interface YelpBusinessDetails extends YelpBusiness {
  photos: string[];
  hours?: Array<{
    open: Array<{
      is_overnight: boolean;
      start: string;
      end: string;
      day: number;
    }>;
    hours_type: string;
    is_open_now: boolean;
  }>;
}

export interface YelpReview {
  id: string;
  rating: number;
  user: {
    id: string;
    profile_url: string;
    image_url: string;
    name: string;
  };
  text: string;
  time_created: string;
  url: string;
}

export interface YelpSearchParams {
  term?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  categories?: string;
  locale?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'best_match' | 'rating' | 'review_count' | 'distance';
  price?: string;
  open_now?: boolean;
  open_at?: number;
  attributes?: string;
}

@Injectable()
export class YelpService {
  private readonly logger = new Logger(YelpService.name);
  private readonly apiClient: AxiosInstance;
  private readonly baseUrl = 'https://api.yelp.com/v3';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('YELP_API_KEY');
    if (!apiKey) {
      throw new Error('Yelp API key is required');
    }

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async searchBusinesses(params: YelpSearchParams): Promise<{
    businesses: YelpBusiness[];
    total: number;
  }> {
    try {
      const response = await this.apiClient.get('/businesses/search', {
        params: {
          ...params,
          categories: params.categories || 'restaurants',
          limit: params.limit || 20,
        },
      });

      return {
        businesses: response.data.businesses,
        total: response.data.total,
      };
    } catch (error) {
      this.logger.error('Error searching businesses with Yelp:', error);
      throw error;
    }
  }

  async getBusinessDetails(businessId: string): Promise<YelpBusinessDetails> {
    try {
      const response = await this.apiClient.get(`/businesses/${businessId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting business details from Yelp:', error);
      throw error;
    }
  }

  async getBusinessReviews(businessId: string): Promise<YelpReview[]> {
    try {
      const response = await this.apiClient.get(
        `/businesses/${businessId}/reviews`,
      );
      return response.data.reviews;
    } catch (error) {
      this.logger.error('Error getting business reviews from Yelp:', error);
      throw error;
    }
  }

  async searchByLocation(
    term: string,
    location: { lat: number; lng: number },
    radius: number = 5000,
    limit: number = 20,
  ): Promise<YelpBusiness[]> {
    const params: YelpSearchParams = {
      term,
      latitude: location.lat,
      longitude: location.lng,
      radius: Math.min(radius, 40000), // Yelp max radius is 40km
      limit,
      categories: 'restaurants',
      sort_by: 'best_match',
    };

    const result = await this.searchBusinesses(params);
    return result.businesses;
  }
}
