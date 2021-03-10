sh build.sh
docker login
docker push kshruti/messageserver
ssh ec2-user@ec2-44-242-96-157.us-west-2.compute.amazonaws.com # < awsScript.sh

#docker run -d -p 443:443 -p 80:80 --name 344gateway -v /etc/letsencrypt:/etc/letsencrypt:ro -e ADDR=:443 -e TLSCERT=/etc/letsencrypt/live/iamshruti.me/fullchain.pem -e TLSKEY=/etc/letsencrypt/live/iamshruti.me/privkey.pem kshruti/summaryServer