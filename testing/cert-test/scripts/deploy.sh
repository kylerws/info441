#!/usr/bin/env bash
cd ~/go/src/info441/testing/cert-test

# Run build
echo Starting build ...
./scripts/build.sh

# Deploy
echo Starting deploy ...
docker push kylerws/cert-test

# SSH into AWS
ssh -tt ec2-user@ec2-54-68-10-95.us-west-2.compute.amazonaws.com < ./scripts/dockerize.sh