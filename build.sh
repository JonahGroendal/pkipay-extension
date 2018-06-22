#!/bin/sh
sudo rm -r ./build
meteor-build-client ./build/
python3 extensify.py "./build/"
cp backgroundScripts/background.js ./build/
cp contentScripts/content.js ./build/
cp backgroundScripts/storagedb.js ./build/
