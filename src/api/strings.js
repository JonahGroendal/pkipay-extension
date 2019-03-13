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
      Resolver: "0x7348387F31e7e840420450F8C53FaB2563821aBE",
      Currency: "0xB8EbadB0414c7A515bC6c66e043d262c99D7B298",
      TokenSale: "0x1B4eBB098fF675C605AF0161a5D5a475dC6E89Be",
      TokenBuyer: "0xEd2C2446d69274390aEc4F2ae34314906B86A544",
    }
  },
  themeType: {
    light: 'light',
    dark: 'dark',
  },

}

export default strings
