# add the necessary instructions
# to create a Docker container image
# for your Go API gateway server
# FROM alpine
FROM alpine
RUN apk add --no-cache ca-certificates
# Change this to COPY . /gateway if any problems
COPY gateway /gateway
EXPOSE 443
ENTRYPOINT [ "/gateway" ]
