import {CurrencyConverter} from 'ecb-currency-converter';

var converter = new CurrencyConverter();

const rates = {
  'USD': 1,
  'EUR': 0,
  'GBP': 0,
  'JPY': 0,
  'CAD': 0
}
Promise.all([
  converter.convert({from: 'USD', to: 'EUR', quantity: 1.0}),
  converter.convert({from: 'USD', to: 'GBP', quantity: 1.0}),
  converter.convert({from: 'USD', to: 'JPY', quantity: 1.0}),
  converter.convert({from: 'USD', to: 'CAD', quantity: 1.0}),
]).then(([EUR, GBP, JPY, CAD]) => {
  rates['EUR'] = EUR
  rates['GBP'] = GBP
  rates['JPY'] = JPY
  rates['CAD'] = CAD
})

export default function convertUSD(to, value) {
  return value * rates[to]
}
