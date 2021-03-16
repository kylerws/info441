# export IMAGE="kylerws/441-client"
export IMAGE="mackenziehutchison/441-final-client"

docker pull $IMAGE

docker rm -f client

docker run -d -p 80:80 -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro --name client $IMAGE

exit
