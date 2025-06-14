# sync local files with ec2 instance
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' --exclude 'dist' \
-e "ssh -i ~/Desktop/casablanca-oussama-mac.pem" \
. ubuntu@ec2-44-204-42-93.compute-1.amazonaws.com:~/app

# connect to ec2 instance
cd ..
chmod 400 "casablanca-oussama-mac.pem"
ssh -i "casablanca-oussama-mac.pem" ubuntu@ec2-44-204-42-93.compute-1.amazonaws.com

# restart background service
sudo systemctl restart myapp.service

# edit service config file
sudo vim /etc/systemd/system/myapp.service

# reload units after changing service config file
sudo systemctl daemon-reload

# show log tail of prod service
sudo journalctl -fu myapp.service