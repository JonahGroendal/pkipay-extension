#!/bin/sh
sudo rm -r ../../../build
meteor-build-client ../../../build/
python3 extensify.py "../../../build/"
