import { Test, TestingModule } from '@nestjs/testing';
import { Beds24Controller } from './beds24.controller';

describe('Beds24Controller', () => {
  let controller: Beds24Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Beds24Controller],
    }).compile();

    controller = module.get<Beds24Controller>(Beds24Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
