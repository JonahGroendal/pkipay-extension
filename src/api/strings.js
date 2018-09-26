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
      wallet: "0xd115170b296b61e0da7e28db12f52800f4e820075c918e08771a2c662a6970d0", //0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009
      gratiis: "0x82e75f8347a24172d940c8adae0fd320fd17b3bd",
    }
  }

}

export default strings
