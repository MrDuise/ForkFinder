import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { RestaurantSearchService } from './restaurant-search.service';
import { GoogleMapsService } from './google-maps.service';
//import { YelpService } from './yelp.service';

@Controller('restaurants')
export class RestaurantController {
  constructor(
    private readonly restaurantSearchService: RestaurantSearchService,
    private readonly googleMapsService: GoogleMapsService,
    //private readonly yelpService: YelpService,
  ) {}

  @Get('search')
  async searchRestaurants(
    @Query('query') query: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || !lat || !lng) {
      throw new BadRequestException('Query, lat, and lng are required');
    }

    const searchParams = {
      query,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      radius: radius ? parseInt(radius) : 5000,
      limit: limit ? parseInt(limit) : 20,
    };

    return this.restaurantSearchService.searchRestaurants(searchParams);
  }

  @Get('google')
  async searchGoogleOnly(
    @Query('query') query: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    if (!query || !lat || !lng) {
      throw new BadRequestException('Query, lat, and lng are required');
    }

    const location = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };
    const searchRadius = radius ? parseInt(radius) : 5000;

    return this.googleMapsService.searchRestaurants(
      query,
      location,
      searchRadius,
    );
  }

  // @Get('yelp')
  // async searchYelpOnly(
  //   @Query('query') query: string,
  //   @Query('lat') lat: string,
  //   @Query('lng') lng: string,
  //   @Query('radius') radius?: string,
  //   @Query('limit') limit?: string,
  // ) {
  //   if (!query || !lat || !lng) {
  //     throw new BadRequestException('Query, lat, and lng are required');
  //   }

  //   const location = {
  //     lat: parseFloat(lat),
  //     lng: parseFloat(lng),
  //   };
  //   const searchRadius = radius ? parseInt(radius) : 5000;
  //   const searchLimit = limit ? parseInt(limit) : 20;

  //   return this.yelpService.searchByLocation(
  //     query,
  //     location,
  //     searchRadius,
  //     searchLimit,
  //   );
  // }

  @Get('google/details/:placeId')
  async getGooglePlaceDetails(@Query('placeId') placeId: string) {
    if (!placeId) {
      throw new BadRequestException('Place ID is required');
    }
    return this.googleMapsService.getPlaceDetails(placeId);
  }

  // @Get('yelp/details/:businessId')
  // async getYelpBusinessDetails(@Query('businessId') businessId: string) {
  //   if (!businessId) {
  //     throw new BadRequestException('Business ID is required');
  //   }
  //   return this.yelpService.getBusinessDetails(businessId);
  // }

  // @Get('yelp/reviews/:businessId')
  // async getYelpReviews(@Query('businessId') businessId: string) {
  //   if (!businessId) {
  //     throw new BadRequestException('Business ID is required');
  //   }
  //   return this.yelpService.getBusinessReviews(businessId);
  // }
}
