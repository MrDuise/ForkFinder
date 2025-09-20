import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleMapsService } from './google-maps.service';
//import { YelpService } from './yelp.service';
import { RestaurantSearchService } from './restaurant-search.service';
import { RestaurantController } from './restaurant.controller';

@Module({
  imports: [ConfigModule],
  providers: [RestaurantSearchService, GoogleMapsService],
  controllers: [RestaurantController],
  exports: [GoogleMapsService, RestaurantSearchService],
})
export class RestaurantSearchModule {}
