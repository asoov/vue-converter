export const ec2UserData = `#!/bin/bash
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
`