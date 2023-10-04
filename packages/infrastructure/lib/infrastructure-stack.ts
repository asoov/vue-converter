import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
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

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    if (!process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_REGION) {
      throw new Error('No AWS credentials provided via .env file!')
    }

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
      userData: ec2.UserData.custom(`#!/bin/bash
        # Create a script that contains the actual user data logic
        echo '#!/bin/bash
        # Add your startup logic here
        # Update packages and install necessary packages
        yum update -y
        yum install -y git
        yum install -y jq  # jq is a utility to process JSON
        yum install -y docker
        sudo service docker start

        # Login to ECR
        aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 714722585977.dkr.ecr.eu-central-1.amazonaws.com

        # Pull the Docker image from your private ECR repository
        docker pull 714722585977.dkr.ecr.eu-central-1.amazonaws.com/vue-converter-repo:tag  

        # Run the Docker container
        docker run -p 80:80 --name vue-backend 714722585977.dkr.ecr.eu-central-1.amazonaws.com/vue-converter-repo:tag  

        # AWS env vars need to be exposed to make dynamoose work. Unfortunately dynamoose relies on env vars set on the host and ignores them being set through their config :(
        docker exec vue-backend export AWS_REGION=${process.env.AWS_REGION}
        docker exec vue-backend export AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}
        docker exec vue-backend export AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY}
        ' > /root/startup-script.sh

        # Make the script executable
        chmod +x /root/startup-script.sh

        # Create a systemd service unit file to run the script
        echo '[Unit]
        Description=Run user data on startup
        After=network.target

        [Service]
        ExecStart=/bin/bash /root/startup-script.sh

        [Install]
        WantedBy=multi-user.target' > /etc/systemd/system/userdata.service

        # Enable and start the service so it runs on every subsequent boot
        systemctl enable userdata.service
        systemctl start userdata.service
      `),
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


    // Create a security group for the instance
    const sg = new ec2.SecurityGroup(this, 'Instance security group', { vpc });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));
    sg.addIngressRule(ec2.Peer.securityGroupId(lbSg.securityGroupId), ec2.Port.tcp(80))


    // Attach security group to instance
    instance.addSecurityGroup(sg);



    const listenerHttps = lb.addListener('HTTPSListener', {
      port: 443,
      certificates: [{ certificateArn: process.env.ACM_CERTIFICATE_ARN ?? '' }]
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
      domainName: 'fromthissoil.de',
    });

    new route53.ARecord(this, 'SubdomainRecord', {
      zone: myZone,
      recordName: 'vue2converter',
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(lb)),
    });
  }
}
