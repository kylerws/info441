#!/usr/bin/env bash

# Announce and set working dir
echo Building [schedules] ...
cd ~/go/src/info441/servers/schedules

# Build docker image for kylerws
docker build -t kylerws/schedules .