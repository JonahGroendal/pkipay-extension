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
      wallet: "0x14dc006e80635fa3d4f81231850bd624d73a435649ec5f19d02c68f78e04c045", //0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009
      gratiis: "0x4bfb253aa6dc799312b0e8876a7361d1e1e25ee1",
    }
  }

}

export default strings
