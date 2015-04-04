#!/bin/sh
mkdir deploy
cd deploy
mkdir blue.git green.git blue-www green-www
cd blue-www
BWWW="$(pwd)"
cd ..
cd green-www
GWWW="$(pwd)"
cd ..
cd blue.git
BG="$(pwd)"
git init --bare
cd hooks
touch post-receive
echo "GIT_WORK_TREE=$BWWW git checkout -f" >> post-receive
echo "cd $BWWW" >> post-receive
echo "sudo npm install" >> post-receive
echo "redis-server --port 6380" >> post-receive
chmod +x post-receive
cd ..
cd ..
cd green.git
GG="$(pwd)"
git init --bare
cd hooks
touch post-receive
echo "GIT_WORK_TREE=$GWWW git checkout -f" >> post-receive
echo "cd $GWWW" >> post-receive
echo "sudo npm install" >> post-receive
echo "redis-server --port 6379" >> post-receive
chmod +x post-receive
cd ..
cd ..
cd ..
git clone https://github.com/meneal/App.git
cd App
sudo npm install
git remote rm origin
git remote add blue file://$BG
git remote add green file://$GG
echo "stuff" >> README.md
git add -A
git commit -m "All the stuff"
cd ..
sudo npm install
sudo npm install -g forever
DIR="$(pwd)"
echo $DIR
