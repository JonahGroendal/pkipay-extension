import web3js from './web3js'
import gratisABI from './gratisABI'
import strings from './strings'
import namehash from 'eth-ens-namehash'

const contractGratis = new web3js.eth.Contract(gratisABI, strings.web3.addresses.gratiis)

const donate = function(hostname, amount) {
  const recipient = namehash.hash(hostname)
  return contractGratis.methods.donate(recipient).send({
    value: amount,
    from: web3js.eth.accounts.wallet[0].address,
    gas: 100000
  })
}

const donateToMany = function(hostnames, amounts) {
  let recipients = []
  for (let i=0; i<hostnames.length; i++) {
    recipients.push(namehash.hash(hostnames[i]))
  }
  console.log(recipients)
  console.log(amounts)
  if (recipients.length === 1)
    return donate(recipients[0], amounts[0])

  const totalValue = amounts.reduce( (a, b) => a + b, 0 )
  return contractGratis.methods.donateMany(recipients, amounts).send({
    value: totalValue,
    from: web3js.eth.accounts.wallet[0].address,
    gas: 50000 + 50000 * recipients.length
  })
}

export { contractGratis, donate, donateToMany }
