import { Injectable, Logger } from '@nestjs/common';
import { GoogleMapsService, GooglePlaceResult } from './google-maps.service';
import { YelpService, YelpBusiness } from './yelp.service';

export interface CombinedRestaurantResult {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  priceLevel?: number;
  categories: string[];
  photos: string[];
  phone?: string;
  website?: string;
  isOpen?: boolean;
  source: 'google' | 'yelp' | 'both';
  googleData?: GooglePlaceResult;
  yelpData?: YelpBusiness;
}

export interface SearchParams {
  query: string;
  location: {
    lat: number;
    lng: number;
  };
  radius?: number;
  limit?: number;
}

@Injectable()
export class RestaurantSearchService {
  private readonly logger = new Logger(RestaurantSearchService.name);

  constructor(
    private readonly googleMapsService: GoogleMapsService,
    private readonly yelpService: YelpService,
  ) {}

  async searchRestaurants(
    params: SearchParams,
  ): Promise<CombinedRestaurantResult[]> {
    const { query, location, radius = 5000, limit = 20 } = params;

    try {
      // Run both API calls in parallel
      const [googleResults, yelpResults] = await Promise.allSettled([
        this.googleMapsService.searchRestaurants(query, location, radius),
        this.yelpService.searchByLocation(query, location, radius, limit),
      ]);

      const googleData =
        googleResults.status === 'fulfilled' ? googleResults.value : [];
      const yelpData =
        yelpResults.status === 'fulfilled' ? yelpResults.value : [];

      // Log any failures
      if (googleResults.status === 'rejected') {
        this.logger.warn('Google Maps search failed:', googleResults.reason);
      }
      if (yelpResults.status === 'rejected') {
        this.logger.warn('Yelp search failed:', yelpResults.reason);
      }

      // Combine and deduplicate results
      const combinedResults = this.combineResults(googleData, yelpData);

      // Sort by rating and limit results
      return combinedResults
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    } catch (error) {
      this.logger.error('Error in combined restaurant search:', error);
      throw error;
    }
  }

  private combineResults(
    googleResults: GooglePlaceResult[],
    yelpResults: YelpBusiness[],
  ): CombinedRestaurantResult[] {
    const combinedMap = new Map<string, CombinedRestaurantResult>();

    // Process Google results
    googleResults.forEach((place) => {
      const normalized = this.normalizeGoogleResult(place);
      combinedMap.set(normalized.id, normalized);
    });

    // Process Yelp results
    yelpResults.forEach((business) => {
      const normalized = this.normalizeYelpResult(business);
      const existing = this.findMatchingRestaurant(combinedMap, normalized);

      if (existing) {
        // Merge with existing Google result
        existing.source = 'both';
        existing.yelpData = business;
        // Use Yelp data if it has more reviews or higher rating
        if (business.review_count > existing.reviewCount) {
          existing.reviewCount = business.review_count;
          existing.rating = business.rating;
        }
        if (business.photos && business.photos.length > 0) {
          existing.photos = [...existing.photos, ...business.photos];
        }
      } else {
        // Add as new result
        combinedMap.set(normalized.id, normalized);
      }
    });

    return Array.from(combinedMap.values());
  }

  private normalizeGoogleResult(
    place: GooglePlaceResult,
  ): CombinedRestaurantResult {
    return {
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
      priceLevel: place.price_level,
      categories: place.types || [],
      photos: place.photos
        ? place.photos.map((photo) =>
            this.googleMapsService.getPhotoUrl(photo.photo_reference),
          )
        : [],
      isOpen: place.opening_hours?.open_now,
      source: 'google',
      googleData: place,
    };
  }

  private normalizeYelpResult(
    business: YelpBusiness,
  ): CombinedRestaurantResult {
    return {
      id: business.id,
      name: business.name,
      address: business.location.display_address.join(', '),
      coordinates: {
        lat: business.coordinates.latitude,
        lng: business.coordinates.longitude,
      },
      rating: business.rating,
      reviewCount: business.review_count,
      priceLevel: business.price ? business.price.length : undefined,
      categories: business.categories.map((cat) => cat.title),
      photos: business.image_url ? [business.image_url] : [],
      phone: business.display_phone,
      website: business.url,
      isOpen: !business.is_closed,
      source: 'yelp',
      yelpData: business,
    };
  }

  private findMatchingRestaurant(
    existingResults: Map<string, CombinedRestaurantResult>,
    newResult: CombinedRestaurantResult,
  ): CombinedRestaurantResult | undefined {
    // Simple matching by name similarity and location proximity
    for (const existing of existingResults.values()) {
      if (this.areSimilarRestaurants(existing, newResult)) {
        return existing;
      }
    }
    return undefined;
  }

  private areSimilarRestaurants(
    a: CombinedRestaurantResult,
    b: CombinedRestaurantResult,
  ): boolean {
    // Check name similarity (simple approach)
    const nameA = a.name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
    const nameB = b.name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
    const nameSimilarity = this.calculateStringSimilarity(nameA, nameB);

    // Check location proximity (within 100 meters)
    const distance = this.calculateDistance(a.coordinates, b.coordinates);

    return nameSimilarity > 0.8 && distance < 100;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  private calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number },
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.lat * Math.PI) / 180;
    const φ2 = (coord2.lat * Math.PI) / 180;
    const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
