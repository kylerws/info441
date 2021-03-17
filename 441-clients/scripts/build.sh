#!/usr/bin/env bash

# Announce and set working dir
echo Building [client] ...
cd ~/go/src/info441/441-clients

# Build docker image for kylerws
docker build -t $IMAGE .