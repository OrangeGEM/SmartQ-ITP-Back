unzip -o build.zip -d /srv/back-itp
rm -rf build.zip
rm -rf install.sh
pm2 reload back-itp