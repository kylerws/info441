# Remove old containers
docker rm -f cert-test

# Pull new images
docker pull kylerws/cert-test

# Run API gateway
docker run -d \
-p 443:443 \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
--name cert-test \
kylerws/cert-test

exit
