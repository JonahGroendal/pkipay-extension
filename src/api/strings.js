//should change to "settingsOptions"
let strings = {
  currency: {
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "CAD": "$",
  },
  paymentSchedule: {
    firstOfTheMonth: now => {
      let year = (new Date(now)).getFullYear()
      let monthIndex = (new Date(now)).getMonth() + 1
      if (monthIndex === 12) {
        year += 1
        monthIndex = 0
      }
      return new Date(year, monthIndex, 1)
    },
    lastOfTheMonth: now => new Date(strings.paymentSchedule.firstOfTheMonth(now).valueOf() - 86400000), // 86400000ms == 1day
  },
  web3: {
    addresses: {
      wallet: "0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009",
      Resolver: "0x7a04d7eEa0a963BD5eC765172A4a73ca939E4873",
      Currency: "0x7b2A277B88724Db621f6FDe1306797B627370DD1",
      BuyMultipleTokens: "0x1aa2aB850D8c5E943cf4f5A7d0eFAd296F01e269",
      TokenBuyer: "0x60e2af7f959d4BB8D0e87AECeA4e9293899DF99a",
    }
  },
  themeType: {
    light: 'light',
    dark: 'dark',
  },

}

export default strings
