#!/usr/bin/env bash
cd ~/go/src/info441/servers/gateway

# Run build
./scripts/build.sh

# Announce script
echo Deploy [gateway] ...

# Push API docker image up
docker push kylerws/project-gateway

# SSH into AWS
ssh -tt ec2-user@ec2-54-68-10-95.us-west-2.compute.amazonaws.com < ./scripts/dockerize.sh

# sh ./scripts/wait.sh