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
    firstOfTheMonth: now => new Date((new Date(now)).getFullYear(), (new Date(now)).getMonth(), 1),
    lastOfTheMonth: now => new Date(strings.paymentSchedule.firstOfTheMonth(now).valueOf() - 86400000), // 86400000ms == 1day
  },
  web3: {
    addresses: {
      wallet: "0x3386ebe18cd1e84df3bbb691da831aceec0f2544971ec48877f09f26a80b1440",
      resolver: "0x5Eaab6793f36af8C727eaBf2FB0C8393207eC076",
      currency: "0x98E76130446453a9678CcF0B0984B6fD85e4697B",
    }
  },
  themeType: {
    light: 'light',
    dark: 'dark',
  },

}

export default strings
