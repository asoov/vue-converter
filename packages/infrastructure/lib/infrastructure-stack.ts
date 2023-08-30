import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { InstanceTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 3
    });

    // Create an EC2 instance
    const instance = new ec2.Instance(this, 'MyInstance', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(),
      vpc,
      userData: ec2.UserData.custom(`#!/bin/bash
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
        . ~/.nvm/nvm.sh
        nvm install 18
        nvm use 18
      `),
    });

    // Create a security group for the instance
    const sg = new ec2.SecurityGroup(this, 'MyInstanceSG', { vpc });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

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
