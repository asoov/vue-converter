import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { CloudWatchLogsService } from 'src/providers/cloudwatch-logs.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private concurrentRequests = 0;
  private maxConcurrentRequests = 20;

  constructor(private readonly cloudWatchLogsService: CloudWatchLogsService) { }

  async use(_, res: Response, next: NextFunction) {
    if (this.concurrentRequests >= this.maxConcurrentRequests) {
      this.cloudWatchLogsService.logMessage('Too many concurrent requests');
      throw new HttpException('Too many concurrent requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    this.concurrentRequests++;

    res.on('finish', () => {
      this.concurrentRequests--;
    });

    next();
  }
}
