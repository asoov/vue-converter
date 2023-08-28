import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const customerTable = new dynamodb.Table(this, 'Table', {
      tableName: 'Customers',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      replicationRegions: ['eu-central-1', 'eu-west-1'],
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

  }
}
