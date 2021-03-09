docker pull kylerws/schedules

docker rm -f schedules

export MONGOADDR="mongodb://mongodb:27017/schedules"
export PORT=80

# running messaging instance
docker run -d \
  -e PORT=$PORT \
  -e MONGOADDR=$MONGOADDR \
  --network 441 \
  --name schedules \
  kylerws/schedules

exit
