import {CurrencyConverter} from 'ecb-currency-converter';

var converter = new CurrencyConverter();

export default async function convert(from, to, quantity) {
  const result = await converter.convert({from: from, to: to, quantity: quantity});
  return result.quantity;
}
