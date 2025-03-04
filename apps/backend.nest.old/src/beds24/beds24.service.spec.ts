import { Test, TestingModule } from '@nestjs/testing';
import { Beds24Service } from './beds24.service';

describe('Beds24Service', () => {
  let service: Beds24Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Beds24Service],
    }).compile();

    service = module.get<Beds24Service>(Beds24Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
