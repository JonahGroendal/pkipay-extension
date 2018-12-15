if ( (typeof browser === 'undefined' || typeof browser.tabs === 'undefined')
  && (typeof chrome === 'undefined' || typeof chrome.tabs === 'undefined') )
{
  console.log('Using mock chrome API')
  var browser = mockChrome
}
else if (typeof browser === 'undefined' || typeof browser.tabs === 'undefined') {
  var browser = chrome
}

let performScheduledPayment = () => {

}

browser.runtime.onInstalled.addListener(function() {
  browser.alarms.onAlarm.addListener(function() {
    browser.storage.local.get('subs', function(result) {
      if (browser.lastError) {
        console.log(browser.lastError)
        return;
      }
      console.log(result)
    })

    browser.runtime.sendMessage({action: 'scheduledPayment'}, function(response) {
      console.log(response)
    })
  })

  browser.alarms.create("scheduledPayment", { when: Date.now() + 1000 })
})
