unzip -o back.zip -d /srv/back-itp
rm -rf back.zip
rm -rf install.sh
pm2 reload back-itp