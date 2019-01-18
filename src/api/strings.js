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
      Resolver: "0x7d05E654F478547F17744B90297dC2Cff1d8eAFD",
      Currency: "0x550d0e5BB991f61dea8E09bd0f83ac76306bD5f8",
      BuyMultipleTokens: "0x1aa2aB850D8c5E943cf4f5A7d0eFAd296F01e269",
      TokenBuyer: "0xa310e6DA2A13E1292A2fa53FD90995484693ac82",
      TokenBuyerFactory: "0x00e60C7dF3C63772C9361B1bA75e4d8a027dB605"
    }
  },
  themeType: {
    light: 'light',
    dark: 'dark',
  },

}

export default strings
