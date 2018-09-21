let strings = {
  currency: {
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "CAD": "$",
  },
  paymentSchedule: {
    firstOfTheMonth: now => new Date((new Date(now)).getFullYear(), (new Date(now)).getMonth(), 1),
    lastOfTheMonth: now => new Date(strings.paymentSchedule.firstOfTheMonth(now).valueOf() - 86400000) // 86400000ms == 1day
  },
  web3: {
    addresses: {
      wallet: "0x47088d1c54d1d232db25ce31f669c873c21ecf5c5a3d0790a2b7856e52655798", //0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009
      gratiis: "0xcbb589435491983194b084f12c3c1523a2c0cc21",
    }
  }

}

export default strings
