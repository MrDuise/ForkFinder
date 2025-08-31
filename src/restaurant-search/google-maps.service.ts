import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@googlemaps/google-maps-services-js';

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now: boolean;
  };
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly client: Client;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
    if (!this.apiKey) {
      throw new Error('Google Maps API key is required');
    }
    this.client = new Client({});
  }

  async searchRestaurants(
    query: string,
    location: { lat: number; lng: number },
    radius: number = 5000,
  ): Promise<GooglePlaceResult[]> {
    try {
      const response = await this.client.placesNearby({
        params: {
          location,
          radius,
          type: 'restaurant',
          keyword: query,
          key: this.apiKey,
        },
      });

      return response.data.results as GooglePlaceResult[];
    } catch (error) {
      this.logger.error('Error searching restaurants with Google Maps:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'formatted_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'price_level',
            'reviews',
            'opening_hours',
            'photos',
          ],
          key: this.apiKey,
        },
      });

      return response.data.result as GooglePlaceDetails;
    } catch (error) {
      this.logger.error('Error getting place details from Google Maps:', error);
      throw error;
    }
  }

  async textSearch(
    query: string,
    location?: string,
  ): Promise<GooglePlaceResult[]> {
    try {
      const response = await this.client.textSearch({
        params: {
          query: `${query} restaurant`,
          location,
          key: this.apiKey,
        },
      });

      return response.data.results as GooglePlaceResult[];
    } catch (error) {
      this.logger.error('Error with text search in Google Maps:', error);
      throw error;
    }
  }

  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  async geocodeAddress(address: string) {
    const geo = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`,
    );
    const gdata = await geo.json();
    return gdata.results[0].geometry.location;
    // const geocoder = NodeGeocoder({
    //   provider: 'openstreetmap', // You can also use 'google', 'mapquest', etc.
    // });
    // try {
    //   const res = await geocoder.geocode(address);
    //   console.log(res);
    //   return res[0]; // Contains latitude, longitude, etc.
    // } catch (error) {
    //   console.error('Geocoding error:', error);
    // }
  }
}
