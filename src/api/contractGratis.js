import web3js from './web3js'
import gratisABI from './gratisABI'
import strings from './strings'

let contractGratis = new web3js.eth.Contract(gratisABI, strings.web3.addresses.gratiis)

let donate = function(recipient, amount) {
  return contractGratis.methods.donate(recipient).send({
    value: amount,
    from: web3js.eth.accounts.wallet[0].address,
    gas: 100000
  })
}

export { contractGratis, donate }
