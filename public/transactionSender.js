const api = chrome || browser;

api.runtime.onInstalled.addListener(function () {
  // Send scheduled transaction on alarm
  api.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name.substring(0, 2) !== 'TX') return;
    // Get application state
    api.storage.sync.get(null, function (storage) {
      if (api.lastError) return;
      // Piece together chunks of stringified state
      let serializedState = Object.keys(storage).filter(k => k.includes('state')).sort().map(k => storage[k]).join('');
      if (!serializedState) return;
      // Get scheduledTx
      serializedState = inflateZeros(serializedState);
      const scheduledTx = JSON.parse(serializedState).scheduledTXs[alarm.name];
      if (Date.now() - scheduledTx.when > 604800000) return;
      sendAll(scheduledTx.txs);
      // Notify user
      api.notifications.create(alarm.name, {
        type: 'basic',
        iconUrl: 'icon16.png',
        title: 'PkiPay: Transaction',
        message: 'Sending scheduled subscriptions payment'
      });
    });
  });

  api.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'SEND_TXS') {
      sendAll(request.txs, sendResponse)
      return true;
    }
  })
});

// recursively loop through txs and send them
function sendAll(txs, callback) {
  function loop(i, responses) {
    if (i < txs.length) {
      send(txs[i].rawTransaction, txs[i].txObject.chainId, function (response) {
        console.log(response)
        responses.push(JSON.parse(response))
        loop(i+1, responses)
      })
    } else {
      callback(responses)
    }
  }
  loop(0, [])
}

function send(rawTransaction, chainId, callback) {
  const rpcEndpoint = parseInt(chainId) === 1
    ? "https://mainnet.infura.io/v3/48899b10645a48e189e345be4be19ece"
    : "https://kovan.infura.io/v3/48899b10645a48e189e345be4be19ece"
  // Send TX
  let oReq = new XMLHttpRequest();
  oReq.addEventListener('load', function() {
    callback(oReq.response);
  })
  oReq.open("POST", rpcEndpoint);
  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send(JSON.stringify({
    "jsonrpc": "2.0",
    "method": "eth_sendRawTransaction",
    "params": [rawTransaction],
    "id": 1
  }));
}

// function sendAll(txs, i=0) {
//   return send(txs[i].rawTransaction, txs[i].txObject.chainId)
//   .then((response) => {
//     console.log(response);
//     if (txs.length < i+1)
//       return sendAll(txs, i+1);
//   })
// }
// function send(rawTransaction, chainId) {
//   return new Promise((resolve, reject) => {
//     const rpcEndpoint = parseInt(chainId) === 1
//       ? "https://mainnet.infura.io/v3/48899b10645a48e189e345be4be19ece"
//       : "https://kovan.infura.io/v3/48899b10645a48e189e345be4be19ece"
//     // Send TX
//     let oReq = new XMLHttpRequest();
//     oReq.addEventListener('load', function() {
//       resolve(oReq.response);
//     })
//     oReq.open("POST", rpcEndpoint);
//     oReq.setRequestHeader("Content-Type", "application/json");
//     oReq.send(JSON.stringify({
//       "jsonrpc": "2.0",
//       "method": "eth_sendRawTransaction",
//       "params": [rawTransaction],
//       "id": 1
//     }));
//   })
// }

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
