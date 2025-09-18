import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantSearchService } from './restaurant-search.service';

describe('RestaurantSearchService', () => {
  let service: RestaurantSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestaurantSearchService],
    }).compile();

    service = module.get<RestaurantSearchService>(RestaurantSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
