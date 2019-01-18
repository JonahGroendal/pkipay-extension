const api = chrome || browser;

api.runtime.onInstalled.addListener(function() {
  api.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name.substring(0, 2) !== 'TX') return;
    api.storage.sync.get(null, function(storage) {
      if (api.lastError) return;
      const serializedState = Object.keys(storage).filter(k => k.includes('state')).sort().map(k => storage[k]).join('')
      if (!serializedState) return;
      const tx = JSON.parse(serializedState).scheduledTXs[alarm.name]
      if (Date.now() - tx.when > 604800000) return;
      let oReq = new XMLHttpRequest();
      oReq.addEventListener('load', function() {
        console.log(oReq.response)
      })
      oReq.open("POST", "https://rinkeby.infura.io/v3/48899b10645a48e189e345be4be19ece");
      oReq.setRequestHeader("Content-Type", "application/json");
      oReq.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": "eth_sendRawTransaction",
        "params": [tx.rawTransaction],
        "id": 1
      }));
      console.log()
      chrome.notifications.create(alarm.name, {
        type: 'basic',
        iconUrl: 'favicon.ico',
        title: 'Grattis: Transaction',
        message: 'Sending scheduled subscriptions payment'
      })
    })
  })
})
