FROM alpine
RUN apk add --no-cache ca-certificates
COPY cert-test /cert-test
EXPOSE 443
ENTRYPOINT [ "/cert-test" ]
