import { Injectable, OnModuleInit } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class CloudWatchLogsService implements OnModuleInit {
  private cloudwatchlogs: AWS.CloudWatchLogs;
  private logGroupName = 'VueConverter';
  private logStreamName = 'VueConverterBackend';

  onModuleInit() {
    AWS.config.update({
      region: 'eu-central-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.cloudwatchlogs = new AWS.CloudWatchLogs();

  }

  async logMessage(message: string) {
    console.log(message)
    const params = {
      logGroupName: this.logGroupName,
      logStreamName: this.logStreamName,
      logEvents: [
        {
          message,
          timestamp: Date.now(),
        },
      ],
    };

    try {
      await this.cloudwatchlogs.putLogEvents(params).promise();
    } catch (err) {
      console.error('Could not log to CloudWatch:', err);
    }
  }
}
