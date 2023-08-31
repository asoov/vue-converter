import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { InstanceTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 3
    });

    const ec2Role = new iam.Role(this, 'MyEc2InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    ec2Role.addToPolicy(new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['arn:aws:secretsmanager:eu-central-1:714722585977:secret:ssh-key-67OUC6'],
    }));

    // Create an EC2 instance with the role
    const instance = new ec2.Instance(this, 'MyInstance', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(),
      vpc,
      keyName: "Adrian's Macbook Pro",
      role: ec2Role,  // Associate the role with the instance
      userData: ec2.UserData.custom(`#!/bin/bash
      # Update packages and install necessary packages
      yum update -y
      yum install -y git
      yum install -y jq  # jq is a utility to process JSON
  
      # Install Node Version Manager (NVM)
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
      . ~/.nvm/nvm.sh
  
      # Install Node.js v18
      nvm install 18
      nvm use 18
  
      # Install Yarn
      npm install -g yarn
  
      # Fetch the SSH key from AWS Secrets Manager
      SSH_SECRET=$(aws secretsmanager get-secret-value --secret-id ssh-key --query SecretString --output text)
  
      # Store the SSH key and set permissions
      echo "$SSH_SECRET" > /root/.ssh/id_rsa
      chmod 600 /root/.ssh/id_rsa
  
      # Add GitHub to known hosts
      ssh-keyscan github.com >> /root/.ssh/known_hosts
  
      # Clone your repository
      git clone git@github.com/asoov/vue-converter /converter
  
      # Navigate to your repository folder and install dependencies
      cd /converter
      yarn install

      cd packages/backend
  
      # Build your project
      yarn build
  
      # Start your application
      yarn start
    `),
    });


    // Create a security group for the instance
    const sg = new ec2.SecurityGroup(this, 'MyInstanceSG', { vpc });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

    const bastion = new ec2.BastionHostLinux(this, 'MyBastion', {
      vpc,
    })
    bastion.allowSshAccessFrom(ec2.Peer.anyIpv4())

    // Attach security group to instance
    instance.addSecurityGroup(sg);

    // Create a Load Balancer
    const lb = new elbv2.ApplicationLoadBalancer(this, 'MyLoadBalancer', {
      vpc,
      internetFacing: true
    });

    const listener = lb.addListener('MyListener', {
      port: 443,
      certificates: [{ certificateArn: process.env.ACM_CERTIFICATE_ARN ?? '' }]
    });

    listener.addTargets('MyTargets', {
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
