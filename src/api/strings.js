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
  themeType: {
    light: 'light',
    dark: 'dark',
  },

}

export default strings
