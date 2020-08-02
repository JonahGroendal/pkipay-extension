let rates = {}

const getRates = async () => {
  return fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml')
  .then(response => response.text())
  .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
  .then(data => {
    const ratesArray = Array.from(data.getElementsByTagName('Cube'))
    .filter(elem => (
      Array.from(elem.attributes).some(elem => elem.nodeName === 'currency') &&
      Array.from(elem.attributes).some(elem => elem.nodeName === 'rate')
    ))
    .map(elem => ({
      currency: Array.from(elem.attributes).find(elem => elem.nodeName === 'currency').nodeValue,
      rate: parseFloat(Array.from(elem.attributes).find(elem => elem.nodeName === 'rate').nodeValue)
    }))

    ratesArray.push({ currency: 'EUR', rate: 1.0 })

    const usdRate = ratesArray.find(rate => rate.currency === 'USD').rate

    ratesArray.forEach(rate => {
      rate.rate = rate.rate / usdRate
    })

    rates = ratesArray.reduce((acc, cur) => ({ ...acc, [cur.currency]: cur.rate }), {})

    return rates
  })
}

export async function getUsdExchangeRate(currency, options={ useCached: true }) {
  let retVal
  if (options.useCached && rates[currency]) {
    retVal = rates[currency]
  }
  else {
    await getRates()
    console.log('rates', rates)
    retVal = rates[currency]
  }
  if (!retVal) {
    throw new Error('Unsupported currency: '.concat(currency))
  }
  return retVal
}
