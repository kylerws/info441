echo Deploying [mongodb] ...
cd ~/go/src/info441/servers/mongodb

ssh -tt ec2-user@ec2-54-68-10-95.us-west-2.compute.amazonaws.com < ./dockerize.sh