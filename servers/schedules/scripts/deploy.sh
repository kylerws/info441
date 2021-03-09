#!/usr/bin/env bash

# Working directory and build
cd ~/go/src/assignments-fixed-kylerws/servers/schedules
./scripts/build.sh

# Push API docker image to kylerws
echo Deploy [schedules] ...
docker push kylerws/schedules

# SSH into AWS
ssh -tt ec2-user@ec2-54-68-10-95.us-west-2.compute.amazonaws.com < ./scripts/dockerize.sh