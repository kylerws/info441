docker rm -f msgclient
docker pull kshruti/messageserver
docker run -d --name msgclient -p 443:443 -p 80:80 -v /etc/letsencrypt:/etc/letsencrypt:ro -e ADDR=:443 -e TLSCERT=/etc/letsencrypt/live/iamshruti.me/fullchain.pem -e TLSKEY=/etc/letsencrypt/live/iamshruti.me/privkey.pem kshruti/messageserver

#docker run -d \
#-p 80:80 \
#--name mynginx \
#-v /etc/letsencrypt:/etc/letsencrypt:ro \
#kshruti/summaryserver