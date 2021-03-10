#cmd /V /C "set GOOS=linux&&go build"
#GOOS=linux go build
docker build -t kshruti/messageserver .
#docker run -d -p 443:443 --name clientmsg kshruti/messageserver