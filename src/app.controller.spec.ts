import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpStatus } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  const mockAppService = {
    getHello: jest.fn().mockReturnValue('Hello World!'),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return Hello World', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('getHealth', () => {
    it('should return health status object', () => {
      const result = appController.getHealth();

      expect(result.status).toBe('ok');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
      expect(result.environment).toBeDefined();
      expect(result.version).toBeDefined();
    });
  });

  describe('getStatus', () => {
    it('should return service statuses and OK status code', () => {
      const result = appController.getStatus();

      expect(result).toEqual({
        auth_service: 'running',
        session_service: 'running',
        database: 'connected',
        redis: 'connected',
        status: HttpStatus.OK,
      });
    });
  });
});
