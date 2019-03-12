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
      Resolver: "0x1564c1620095CDbE21610266f50CaC72eC21CFc5",
      Currency: "0x5B7f6B7800D7f9e8E1849Fe21344C9dA0a802E06",
      BuyMultipleTokens: "0x1aa2aB850D8c5E943cf4f5A7d0eFAd296F01e269",
      TokenBuyer: "0x7B80411cac2Fb58B7FD11DC6b355c26081FeD162",
    }
  },
  themeType: {
    light: 'light',
    dark: 'dark',
  },

}

export default strings
