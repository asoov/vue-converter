import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CloudWatchLogsService } from 'src/providers/cloudwatch-logs.service';
import { UtilityService } from 'src/providers/utility.provider';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, CloudWatchLogsService, UtilityService],
})
export class CustomerModule { }
