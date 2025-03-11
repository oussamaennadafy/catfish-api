# sync local files with ec2 instance
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' \
-e "ssh -i ~/Desktop/casablanca-oussama-mac.pem" \
. ubuntu@ec2-18-212-206-197.compute-1.amazonaws.com:~/app

# connect to ec2 instance
cd ..
chmod 400 "casablanca-oussama-mac.pem"
ssh -i "casablanca-oussama-mac.pem" ubuntu@ec2-18-212-206-197.compute-1.amazonaws.com

# restart background service
sudo systemctl restart myapp.service