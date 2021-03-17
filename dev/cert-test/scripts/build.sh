#!/usr/bin/env bash

# Build linux executable
GOOS=linux go build

# Build docker image for kylerws
docker build -t kylerws/cert-test .

# Delete go executable
go clean