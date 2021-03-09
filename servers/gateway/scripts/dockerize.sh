# Remove old containers
docker rm -f redis
docker rm -f gateway
docker rm -f mysqldb

# Pull new images
docker pull kylerws/project-gateway
docker pull kylerws/project-mysqldb

# Create network
docker network rm 441
docker network create 441

# SQL env variables
# export MYSQL_ROOT_PASSWORD=$(openssl rand -base64 18)
export MYSQL_ROOT_PASSWORD="info441"
export MYSQL_DATABASE="mysqldb"

# Run MYSQL server
docker run -d \
--name mysqldb \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
-e MYSQL_DATABASE=$MYSQL_DATABASE \
--network 441 \
kylerws/project-mysqldb

# Run Redis server
docker run -d --name redis --network 441 redis

# Set DSN, redis ADDR, signing key
export REDISADDR=redis:6379
export SESSIONKEY="441testkey"

# Run API gateway
docker run -d -p 443:443 \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
-e TLSCERT=/etc/letsencrypt/live/api.scheduleup.info/fullchain.pem \
-e TLSKEY=/etc/letsencrypt/live/api.scheduleup.info/privkey.pem \
-e SESSIONKEY=$SESSIONKEY \
-e REDISADDR=$REDISADDR \
-e MYSQL_ROOT_PASSWORD="info441" \
--network 441 \
--name gateway \
kylerws/project-gateway

# -e MESSAGESADDR="http://messaging:80" \
# -e SUMMARYADDR="http://summary:80" \

exit
