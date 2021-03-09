#!/usr/bin/env bash

echo Building gateway...

# Build linux executable
GOOS=linux go build

# Build docker image for kylerws
docker build -t kylerws/gateway .

# Delete go executable
go clean