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
export async function createTxSwap(params) {
  const response = await fetch(
      `https://api.0x.org/swap/v0/quote?${qs.stringify(params)}`
  );

  return await response.json()
}
