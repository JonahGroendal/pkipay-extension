import * as qs from 'qs'

/*
 * To buy 1 DAI:
 * params = {
 *     buyToken: 'DAI',
 *     sellToken: 'ETH',
 *     buyAmount: '1000000000000000000',
 * }
 * returns a web3 tx object
 */
export async function createTxSwap(params, options={ chainId: 1 }) {
  let baseUrl
  if (options.chainId === 1) {
    baseUrl = 'https://api.0x.org/'
  }
  else if (options.chainId === 42) {
    baseUrl = 'https://kovan.api.0x.org/'
  }
  else {
    throw new Error(`Chain ID "${options.chainId}" not supported`)
  }
  const response = await fetch(
      `${baseUrl}swap/v0/quote?${qs.stringify(params)}`
  );

  return await response.json()
}
