let mockChrome = {
  runtime: {
    sendMessage: function(messageObj, callback) {
      if (messageObj.action === "getViews") {
        let views = []
        views.push({
          duration: 45.000,
          hostname: "open.spotify.com",
          included: true,
          name: "spotify.com",
          pinned: false,
          pinnedShare: 0,
          share: 45,
          siteId: 1,
          status: 1,
          verified: false,
          views: 2
        })
        views.push({
          duration: 55.000,
          hostname: "www.facebook.com",
          included: true,
          name: "facebook.com",
          pinned: false,
          pinnedShare: 0,
          share: 55,
          siteId: 2,
          status: 1,
          verified: false,
          views: 4
        })
        callback(views)
      }
    }
  },
  tabs: {
    query: function(obj, callback) {
      let tabs = [{url: "https://www.facebook.com/"}]
      callback(tabs);
    },
    onActivated: {
      addListener: function(whatToDo) {}
    }
  },
  storage: {
    local: {
      get: function(obj, callback) {
        let retObj = {}
        let key
        for (key in obj) {
          retObj[key] = ( mockChrome.storage.local.data[key] || obj[key] )
        }
        callback(retObj)
      },
      set: function(obj) {
        let key
        for (key in obj) {
          mockChrome.storage.local.data[key] = JSON.parse(JSON.stringify(obj[key]))
        }
      },
      data: {}
    }
  }
}

export default mockChrome
