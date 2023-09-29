import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { UtilityService } from 'src/providers/utility.provider';
import { CloudWatchLogsService } from 'src/providers/cloudwatch-logs.service';
import { ConfigService } from '@nestjs/config';
import { CustomerRepository } from './customer.repository';

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, CustomerService, UtilityService, CloudWatchLogsService, CustomerRepository],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
