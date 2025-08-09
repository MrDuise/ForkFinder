import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleMapsService } from './google-maps.service';
import { YelpService } from './yelp.service';
import { RestaurantSearchService } from './restaurant-search.service';

@Module({
  imports: [ConfigModule],
  providers: [GoogleMapsService, YelpService, RestaurantSearchService],
  exports: [GoogleMapsService, YelpService, RestaurantSearchService],
})
export class RestaurantSearchModule {}
