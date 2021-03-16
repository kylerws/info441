docker pull kylerws/441-client

docker rm -f client

docker run -d -p 80:80 -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro --name client kylerws/441-client

exit
