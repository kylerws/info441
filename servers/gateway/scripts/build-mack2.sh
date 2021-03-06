#! /bin/bash
cd ..
cmd /V /C "set GOOS=linux&&go build"
docker build -t mackenziehutchison/gateway .
go clean

