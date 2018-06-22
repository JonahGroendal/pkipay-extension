import os
import sys

# Get filenames
files = os.listdir(sys.argv[1])
for i, f in enumerate(files):
    if ".js" in f and ".json" not in f:
        jsFileIndex = i

# Open files to copy from
with open(sys.argv[1] + "index.html") as indexFile:
    indexContents = indexFile.read()
with open(sys.argv[1] + files[jsFileIndex]) as jsFile:
    jsContents = jsFile.read()

# Combine meteor scripts into one file
meteorjsContents = ""
indexLines = indexContents.splitlines()
meteorjsContents += indexLines[4].split(">")[1].split("<")[0] + "\n"
meteorjsContents += jsContents + "\n"
meteorjsContents += indexLines[6].split(">")[1].split("<")[0] + "\n"
with open(sys.argv[1] + "meteor.js", "w+") as meteorjsFile:
    meteorjsFile.write(meteorjsContents)
# Create popup.html
del indexLines[6]
indexLines[5] = indexLines[5].replace(files[jsFileIndex], "meteor.js")
del indexLines[4]
popupContents = ""
for line in indexLines:
    popupContents += line + "\n"
with open(sys.argv[1] + "popup.html", "w+") as popupjs:
    popupjs.write(popupContents)

# Create manifest
manifestjson = '''{
  "manifest_version": 2,

  "name": "PKIPay",
  "description": "",
  "version": "1.0",

  "browser_action": {
    "default_popup": "popup.html"
  },
  "background": {
    "scripts": [
        "storagedb.js",
        "background.js"
    ]
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "all_frames": false
  }],
  "permissions": [
    "tabs",
    "webNavigation",
    "notifications",
    "downloads",
    "storage",
    "unlimitedStorage"
  ],
  "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'"
}'''
with open(sys.argv[1] + "manifest.json", "w+") as manifest:
    manifest.write(manifestjson)

# Remove unwanted files
for f in files:
    if "." in f and "stats.json" not in f and ".css" not in f:
        print(sys.argv[1] + f)
        os.remove(sys.argv[1] + f)
