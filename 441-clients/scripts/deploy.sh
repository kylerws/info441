#!/usr/bin/env bash

# Working directory and build
cd ~/go/src/info441/441-clients
./scripts/build.sh

# Push API docker image to kylerws
echo Deploy [client] ...
docker push kylerws/441-client

# SSH into AWS
ssh -tt ec2-user@ec2-44-239-123-86.us-west-2.compute.amazonaws.com < ./scripts/dockerize.sh 