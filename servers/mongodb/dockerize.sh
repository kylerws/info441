docker rm -f mongodb

docker run -d \
  -p 27017:27017 \
  --name mongodb \
  --network 441 \
  mongo

exit