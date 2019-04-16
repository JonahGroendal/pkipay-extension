import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from './index'
// import fetchMock from 'fetch-mock'
import expect from 'expect'
import { createTxBuyThx } from '../api/blockchain'
import browser from '../api/browser'
import web3js from '../api/web3js'

const mockStore = configureMockStore([thunk])

jest.mock('../api/web3js')
jest.mock('../api/browser')

describe('actions', () => {
  // afterEach(() => {
  //   fetchMock.restore()
  // })

  it('should generate new wallet then create action to set it', () => {
    const action = actions.createWallet('password')
    expect(action).toEqual(expect.objectContaining({
      type: 'CREATE_WALLET'
    }))
    expect(action.payload.addresses).toHaveLength(1)
    expect(action.payload.keystore).toHaveLength(1)
    expect(browser.downloads.download).toHaveBeenCalledWith({
      url: 'chrome://path/to/keystore',
      filename: 'keystore.json'
    })
  })

  it('should import account then create action to add it', () => {
    const action = actions.addAccount('0xd3adcdbf12b4d79dfc05434d25b32fcc12d264a5be4eabddb1ce7bb5305c0009', 'password')
    expect(action).toEqual(expect.objectContaining({
      type: 'ADD_ACCOUNT'
    }))
    expect(action.payload.address.toLowerCase()).toEqual('0x4b42536834c29b4098e960decc6fce9107e8d597')
    expect(action.payload.keystore.length).toBeGreaterThanOrEqual(1)
    const walletIndex = web3js.eth.accounts.wallet.length - 1
    expect(web3js.eth.accounts.wallet[walletIndex].address.toLowerCase()).toEqual('0x4b42536834c29b4098e960decc6fce9107e8d597')
  })

  it('should schedule TX for one min from now', async () => {
    let txObj = await createTxBuyThx(
      '0x4b42536834c29b4098e960decc6fce9107e8d597',
      'www.wikipedia.org',
      5
    )
    const inAMin = (new Date()).getTime() + 60000
    const expectedAction = {
      "type":"SCHEDULE_TX",
      "payload": {
        "id":"TX00000001",
        "when": inAMin,
        "txObject": {
          "from": "0x4b42536834c29b4098e960decc6fce9107e8d597",
          "to": "0xed2c2446d69274390aec4f2ae34314906b86a544",
          "gas": "0x927c0",
          "data": "0x07da68cd0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000007777772e77696b6970656469612e6f726700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000004563918244f40000",
          "nonce":"0x1",
          "chainId": 4,
          "gasPrice":"0x3b9aca00"
        },
        "rawTransaction":"0xf9012901843b9aca00830927c094ed2c2446d69274390aec4f2ae34314906b86a54480b8c407da68cd0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000007777772e77696b6970656469612e6f726700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000004563918244f400002ba064606e1a962db4d33e2b796bc62fd2c4e5cc90066b5d7f28ad300b581de5e323a035f04d670f5264b1bbea0c95058b4b1e5e5eae1d3b772d8804effe148fd24ee6",
        "txHash": "0xeb00b11256efe116dc6b92ed438285252fb02adc81916d51512cf6c1212dba0b"
      }
    }
    txObj.nonce = '0x1'
    txObj.chainId = 4
    txObj.gasPrice = '0x3b9aca00'
    const store = mockStore({})

    await store.dispatch(actions.scheduleTx(inAMin, txObj))

    expect(store.getActions()[0]).toEqual(expectedAction)
    expect(browser.alarms.create).toHaveBeenCalledWith(
      expectedAction.payload.id,
      { when: inAMin }
    )
  })

  it('should send a TX', async () => {

    // waiting for fix to ganache-cli

    const expectedAction = {
      type: 'SEND_TX_SUCCESS',
      payload: {
        txHash: "0x5772a80dc7fe2eb723425e551e3edf92bbfe474731bc284674aae3f505c9ce61"
      }
    }

    let txObj = await createTxBuyThx(
      '0x4b42536834c29b4098e960decc6fce9107e8d597',
      'www.wikipedia.org',
      5
    )
    txObj.nonce = '0x0'
    txObj.chainId = 4
    txObj.gasPrice = '0x3b9aca00'

    const store = mockStore({ scheduledTXs: {} })

    await store.dispatch(actions.sendTx(txObj))

    expect(store.getActions()[0]).toEqual(expectedAction)
  })

  // it('should update nonces on scheduled TXs', () => {
  //   const inAMin = (new Date()).getTime() + 60000
  //   const store = mockStore({
  //     'TX00000001': {
  //       txObject: {
  //         from: "0x4b42536834c29b4098e960decc6fce9107e8d597",
  //         to: "0xed2c2446d69274390aec4f2ae34314906b86a544",
  //         gas: "0x927c0",
  //         data: "0x07da68cd0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000007777772e77696b6970656469612e6f726700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000004563918244f40000",
  //         nonce: "0x1",
  //         chainId: 4,
  //         gasPrice: "0x3b9aca00"
  //       },
  //       rawTransaction: "0xf9012901843b9aca00830927c094ed2c2446d69274390aec4f2ae34314906b86a54480b8c407da68cd0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000007777772e77696b6970656469612e6f726700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000004563918244f400002ba064606e1a962db4d33e2b796bc62fd2c4e5cc90066b5d7f28ad300b581de5e323a035f04d670f5264b1bbea0c95058b4b1e5e5eae1d3b772d8804effe148fd24ee6",
  //       txHash: "0xeb00b11256efe116dc6b92ed438285252fb02adc81916d51512cf6c1212dba0b",
  //       when: inAMin
  //     }
  //   })
  // })
})
