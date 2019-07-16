const api = chrome || browser;

api.runtime.onInstalled.addListener(function() {
  // Send scheduled transaction on alarm
  api.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name.substring(0, 2) !== 'TX') return;
    // Get application state
    api.storage.sync.get(null, function(storage) {
      if (api.lastError) return;
      // Piece together chunks of stringified state
      let serializedState = Object.keys(storage).filter(k => k.includes('state')).sort().map(k => storage[k]).join('')
      if (!serializedState) return;
      // Get scheduledTx
      serializedState = inflateZeros(serializedState);
      const tx = JSON.parse(serializedState).scheduledTXs[alarm.name]
      const rpcEndpoint = parseInt(tx.txObject.chainId) === 1
        ? "https://mainnet.infura.io/v3/48899b10645a48e189e345be4be19ece"
        : "https://kovan.infura.io/v3/48899b10645a48e189e345be4be19ece"
      if (Date.now() - tx.when > 604800000) return;
      // Send TX
      let oReq = new XMLHttpRequest();
      oReq.addEventListener('load', function() {
        console.log(oReq.response)
      })
      oReq.open("POST", rpcEndpoint);
      oReq.setRequestHeader("Content-Type", "application/json");
      oReq.send(JSON.stringify({
        "jsonrpc": "2.0",
        "method": "eth_sendRawTransaction",
        "params": [tx.rawTransaction],
        "id": 1
      }));

      // Notify user
      chrome.notifications.create(alarm.name, {
        type: 'basic',
        iconUrl: 'icon16.png',
        title: 'PkiPay: Transaction',
        message: 'Sending scheduled subscriptions payment'
      })
    })
  })
})

// Same function as in project_root/src/api/browser.js
function inflateZeros(str) {
  let chars = str.split('');
  let numZeros = 0;
  let numZerosStr = '';
  let j;
  for (let i=0; i<chars.length; i++) {
    if (chars[i] === '0') {
      j = i+1;
      while (chars[j] !== ';') {
        numZerosStr += chars[j];
        j++;
      }
      numZeros = parseInt(numZerosStr);
      numZerosStr = '';
      chars[i] = '0'.repeat(numZeros);
      chars.splice(i+1, j-i);
    }
  }
  return chars.join('');
}
