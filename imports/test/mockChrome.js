let mockChrome;
export default mockChrome = {
  tabs: {
    query: function(obj, callback) {
      let tabs = [{url: "https://www.awebsite.com/"}]
      callback(tabs);
    }
  }
}
