import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { InstanceTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoValues } from 'utils'
import { ec2UserData } from './ec2-user-data'

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    if (!process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_REGION) {
      throw new Error('No AWS credentials provided via .env file!')
    }


    // The S3 bucket to host the SPA
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: 'vue-converter-spa-website',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // For SPA routing, fallback to index.html,
      publicReadAccess: true,
    });

    // Create DynamoDB customer database
    new dynamodb.Table(this, 'CustomerDB', {
      tableName: DynamoValues.TableName,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Should keep customer database when stack is destroyed
    });

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      natGateways: 0
    });

    const ecrRepo = ecr.Repository.fromRepositoryName(this, 'VueConverterRepoImported', 'vue-converter-repo');

    const ec2Role = new iam.Role(this, 'MyEc2InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    ec2Role.addToPolicy(new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['arn:aws:secretsmanager:eu-central-1:714722585977:secret:ssh-key-67OUC6'],
    }));

    ec2Role.addToPolicy(new iam.PolicyStatement({
      actions: ['ecr:GetDownloadUrlForLayer', 'ecr:BatchCheckLayerAvailability', 'ecr:ListImages'],
      resources: [ecrRepo.repositoryArn],  // replace with your ECR repo ARN
    }));

    // Give the EC2 instance permission to access the ECR repo
    ecrRepo.grantPull(ec2Role);


    // Create an EC2 instance with the role
    const instance = new ec2.Instance(this, 'EC2Instance', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 }),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      keyName: "Adrian's Macbook Pro",
      role: ec2Role,  // Associate the role with the instance
      userData: ec2.UserData.custom(ec2UserData),
    });


    // Explicitly create a security group for the Load Balancer
    const lbSg = new ec2.SecurityGroup(this, 'LoadBalancerSG', { vpc });
    lbSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));  // Or any other rules you need
    lbSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));  // Or any other rules you need


    // Create a Load Balancer
    const lb = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
      vpc,
      internetFacing: true,
      securityGroup: lbSg
    });

    // ACM certificate
    // needs to be a certificate in us-east-1 due to CloudFront requirements
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', process.env.ACM_CERTIFICATE_ARN_US ?? '');

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      certificate,
      errorResponses: [{
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: 'index.html',
      }],
      domainNames: ['vue-converter.com'],
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.LoadBalancerV2Origin(lb),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
    });


    // Create a security group for the instance
    const sg = new ec2.SecurityGroup(this, 'Instance security group', { vpc });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));
    sg.addIngressRule(ec2.Peer.securityGroupId(lbSg.securityGroupId), ec2.Port.tcp(80))


    // Attach security group to instance
    instance.addSecurityGroup(sg);



    const listenerHttps = lb.addListener('HTTPSListener', {
      port: 443,
      certificates: [{ certificateArn: process.env.ACM_CERTIFICATE_ARN_EU ?? '' }]
    });
    const listenerHttp = lb.addListener('HTTPListener', {
      port: 80,

    });

    listenerHttps.addTargets('HTTPSListenerTargets', {
      port: 80,
      targets: [new InstanceTarget(instance)]
    });
    listenerHttp.addTargets('HTTPListenerTargets', {
      port: 80,
      targets: [new InstanceTarget(instance)]
    });

    // Create Route53 record
    const myZone = route53.HostedZone.fromLookup(this, 'MyZone', {
      domainName: 'vue-converter.com',

    });

    new route53.ARecord(this, 'SubdomainRecord', {
      zone: myZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
  }
}
