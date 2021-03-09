#!/usr/bin/env bash
cd ~/go/src/info441/servers/gateway

# Run build
./scripts/build.sh

# Announce script
echo Deploying gateway...

# Push API docker image up
docker push kylerws/project-gateway

# SSH into AWS
ssh -tt ec2-user@ec2-52-39-237-85.us-west-2.compute.amazonaws.com < ./scripts/dockerize.sh

# sh ./scripts/wait.sh