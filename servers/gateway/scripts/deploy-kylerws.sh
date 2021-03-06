#!/usr/bin/env bash

# Change dir
cd ~/go/src/assignments-fixed-kylerws/servers/gateway

# Run build
./scripts/build-kylerws.sh

# Announce script
echo Deploying gateway...

# Push API docker image to kylerws
docker push kylerws/gateway

# SSH into AWS
ssh -tt ec2-user@ec2-52-38-14-202.us-west-2.compute.amazonaws.com < ./scripts/aws-deploy.sh

# Wait to exit
echo Press any key to exit...
while true; do
  read -n 1
  if [ $? = 0 ] ; then
  exit ;
  fi
done