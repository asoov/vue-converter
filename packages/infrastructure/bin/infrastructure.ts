#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import * as dotenv from 'dotenv';
dotenv.config();
const app = new cdk.App();
new InfrastructureStack(app, 'InfrastructureStack', { env: { region: process.env.CDK_DEFAULT_REGION, account: process.env.CDK_DEFAULT_ACCOUNT } });
