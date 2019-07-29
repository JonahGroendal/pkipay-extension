import {CurrencyConverter} from 'ecb-currency-converter';

var converter = new CurrencyConverter();

const rates = {
  'USD': 1.0,
  'EUR': 0.0,
  'GBP': 0.0,
  'JPY': 0.0,
  'CAD': 0.0
}
Promise.all([
  converter.convert({from: 'USD', to: 'EUR', quantity: 1.0}),
  converter.convert({from: 'USD', to: 'GBP', quantity: 1.0}),
  converter.convert({from: 'USD', to: 'JPY', quantity: 1.0}),
  converter.convert({from: 'USD', to: 'CAD', quantity: 1.0}),
]).then(([EUR, GBP, JPY, CAD]) => {
  rates['EUR'] = EUR.quantity
  rates['GBP'] = GBP.quantity
  rates['JPY'] = JPY.quantity
  rates['CAD'] = CAD.quantity
})

export function convertFromUSD(to, value) {
  return value * rates[to]
}

export function convertToUSD(from, value) {
  return value / rates[from]
}

export const supportedCurrencies = Object.keys(rates)
