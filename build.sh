#!/bin/sh
sudo rm -r ../../../build
meteor-build-client ../../../build/
python3 extensify.py "../../../build/"
cp ../../../pkipay/chromeExtension/background.js ../../../build/
cp ../../../pkipay/chromeExtension/content.js ../../../build/
cp ../../../pkipay/chromeExtension/storagedb.js ../../../build/
