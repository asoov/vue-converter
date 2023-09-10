import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CloudWatchLogsService } from 'src/providers/cloudwatch-logs.service';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, CloudWatchLogsService],
})
export class CustomerModule { }
