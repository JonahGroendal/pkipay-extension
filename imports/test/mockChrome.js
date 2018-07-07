let mockChrome;
export default mockChrome = {
  runtime: {
    sendMessage: function(messageObj, callback) {
      if (messageObj.action === "getViews") {
        let views = []
        views.push({
          duration: 45.000,
          hostname: "open.spotify.com",
          included: true,
          name: "open.spotify.com",
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
          name: "www.facebook.com",
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
      let tabs = [{url: "https://www.awebsite.com/"}]
      callback(tabs);
    }
  }
}
