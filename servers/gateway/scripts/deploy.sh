#!/usr/bin/env bash
cd ~/go/src/assignments-fixed-kylerws/servers/gateway

# Run build
./scripts/build.sh

# Announce script
echo Deploying gateway...

# Push API docker image up
docker push kylerws/gateway:a5

# SSH into AWS
ssh -tt ec2-user@ec2-52-38-14-202.us-west-2.compute.amazonaws.com < ./scripts/dockerize.sh

# sh ./scripts/wait.sh