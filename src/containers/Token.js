import React from 'react';
import PresentationalComponent from '../components/Token';
import {
  apiContractApproved,
  resolveToken,
  resolveTokenSale,
  createTxApproveApiContract,
  createTxBuyTokens,
  createTxSellToken,
  createTxWithdraw,
  createTxWithdrawETH,
  addresses,
  getTokenInfo,
  getTokenSaleInfo
} from '../api/blockchain';
import { connect } from 'react-redux'
import { reviewTx, addSubscription, removeSubscription, setTabIndex, addToken } from '../actions'
import { isEnsNode } from '../api/utils'

const tokenOptions = ['DAI', 'ETH']
const orderTypeOptions = ['Buy', 'Sell', 'Subscribe (Buy Monthly)']

function Token(props) {
  const { ensAddress, adminViewEnabled, ...mapped } = props;

  const [amount, setAmount] = React.useState('');
  const parsedAmount = isNaN(amount) ? 0 : Number(amount);
  const [orderType, setOrderType] = React.useState(orderTypeOptions[0]);
  const [submitOrderButtonLoading, setSubmitOrderButtonLoading] = React.useState(false);
  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [token, setToken] = React.useState(tokenOptions[0]);
  const [totalSupply] = useTokenInfo(ensAddress, mapped.txScreenOpen);
  const [buyPrice, sellPrice, reservesDAI/*, reservesETH*/] = useTokenSaleInfo(ensAddress, mapped.txScreenOpen);

  const prices = {
    'Buy': buyPrice,
    'Sell': sellPrice,
    'Subscribe (Buy Monthly)': buyPrice
  }
  const reserves = {
    'DAI': reservesDAI,
    // 'ETH': reservesETH
  }

  function handleChangeAmount(amount) {
    if (amount === '.' || !isNaN(amount))
      setAmount(amount)
  }

  function handleChangeWithdrawAmount(amount) {
    if (amount === '.' || !isNaN(amount))
      setWithdrawAmount(amount)
  }

  async function handleClickSubmitOrder() {
    const numTokens = parseFloat(amount);
    switch (orderType) {
      case 'Buy':
        return await mapped.onBuy(mapped.address, ensAddress, numTokens * buyPrice, numTokens);
      case 'Sell':
        return await mapped.onSell(mapped.address, ensAddress, numTokens, numTokens * sellPrice);
      case 'Subscribe (Buy Monthly)':
        setSubmitOrderButtonLoading(true);
        if (mapped.subscriptions.filter(sub => sub.address === ensAddress).length > 0)
          await mapped.onUnsubscribe(ensAddress, false)
        await mapped.onSubscribe(ensAddress, numTokens * buyPrice);
        setSubmitOrderButtonLoading(false);
        mapped.onChangeTab(1);
        setAmount('');
        setOrderType(orderTypeOptions[0]);
    }
  }

  async function handleClickWithdraw() {
    const amount = parseFloat(withdrawAmount)
    if (token === 'ETH')
      await mapped.onWithdrawETH(mapped.address, ensAddress, amount)
    else
      await mapped.onWithdraw(mapped.address, ensAddress, addresses[token], amount, token)
  }


  const domainName = ensAddress.replace('.dnsroot.eth', '').replace('.dnsroot.test', '')
  return React.createElement(PresentationalComponent, {
    adminViewEnabled,
    title: "Token",
    subtitle: isEnsNode(domainName) ? "" : "A stablecoin backed by the credit of ".concat(domainName, "'s registrant."),
    contract: `This is a vehicle for charitable investment, and, as such,
               will not yield a positive return on investment. The token issuer, the registrant of ${domainName},
               agrees to repurchase all tokens on-demand at a price no less
               than the nominal repurchase price offered at the time of
               purchase. In other words, reserves must never run out, and, over
               time, the nominal sell price must either remain constant or
               monotonically increase. An inability or unwillingness to
               repurchase under these conditions should be reguarded
               as a failure of credit on the part of the issuer (the borrower). The details of all
               purchases and repurchases are immutably recorded on the
               Ethereum blockchain and contribute to the issuer's credit
               history.`,
    totalSupplyText: totalSupply.toFixed(2),
    totalReservesText: Object.keys(reserves).map((symbol, i) => reserves[symbol].toFixed(symbol === 'DAI' ? 2 : 3).concat(" ", symbol)).join(' + '),
    priceText: prices[orderType].toFixed(2).concat(' DAI'),
    inputLabel: "Amount",
    amount,
    onChangeAmount: handleChangeAmount,
    orderTypeOptions,
    orderType,
    onChangeOrderType: setOrderType,
    onClickSubmitOrder: handleClickSubmitOrder,
    submitOrderButtonText: (parsedAmount * prices[orderType]).toFixed(2).concat(" DAI"),
    submitOrderButtonTooltip: (orderType === 'Sell' ? "Sell " : "Buy ").concat(
      parsedAmount.toFixed(2), " tokens for ",
      (parsedAmount * prices[orderType]).toFixed(2), " DAI",
      orderType === 'Subscribe (Buy Monthly)' ? " every month" : ""
    ),
    submitOrderButtonDisabled: parsedAmount <= 0 || (orderType === 'Sell' && reserves['DAI'] < parsedAmount) || !ensAddress,
    submitOrderButtonLoading,
    withdrawAmount,
    onChangeWithdrawAmount: handleChangeWithdrawAmount,
    tokenOptions,
    token,
    onChangeToken: setToken,
    onClickWithdraw: handleClickWithdraw,
    withdrawButtonDisabled: !(0 < withdrawAmount && withdrawAmount <= reserves[token])
  });
}

function useTokenInfo(ensAddress, txScreenOpen) {
  const [totalSupply, setTotalSupply] = React.useState(0);

  React.useEffect(() => {
    if (ensAddress && !txScreenOpen) {
      getTokenInfo(ensAddress).then(info => {
        setTotalSupply(info.totalSupply)
      })
    } else {
      setTotalSupply(0);
    }
  }, [ensAddress, txScreenOpen])

  return [totalSupply]
}

function useTokenSaleInfo(ensAddress, txScreenOpen) {
  const [buyPrice, setBuyPrice] = React.useState(1);
  const [sellPrice, setSellPrice] = React.useState(1);
  const [reservesDAI, setReservesDAI] = React.useState(0);
  // const [reservesETH, setReservesETH] = React.useState(0);

  React.useEffect(() => {
    if (ensAddress) {
      if (!txScreenOpen) {
        getTokenSaleInfo(ensAddress).then(info => {
          setBuyPrice(info.buyPrice);
          setSellPrice(info.sellPrice);
          setReservesDAI(info.reservesDAI);
          // setReservesETH(info.reservesETH);
        })
      }
    } else {
      setBuyPrice(1);
      setSellPrice(1);
      setReservesDAI(0);
      // setReservesETH(0);
    }
  }, [ensAddress, txScreenOpen])

  return [buyPrice, sellPrice, reservesDAI/*, reservesETH*/]
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  txScreenOpen: state.transactionScreen.isOpen,
  subscriptions: state.subscriptions
})

const mapDispatchToProps = (dispatch) => ({
  onBuy: async (from, ensAddress, daiValue, amount) => {
    const txs = []
    const approved = await apiContractApproved(from)
    if (!approved)
      txs.push(createTxApproveApiContract(from))
    txs.push(createTxBuyTokens(from, ensAddress, daiValue))
    dispatch(addToken(ensAddress))
    dispatch(reviewTx(txs, [ensAddress], [{ 'DAI': daiValue*-1, 'tokens': amount }]))
  },
  onSell: async (from, ensAddress, amount, daiValue) => {
    const tokenAddr = await resolveToken(ensAddress, { usePublicResolver: true })
    const tokenSaleAddr = await resolveTokenSale(ensAddress, { usePublicResolver: true })
    const txs = await createTxSellToken(from, tokenAddr, tokenSaleAddr, amount)
    dispatch(reviewTx(txs, [ensAddress], [{ 'DAI': daiValue, 'tokens': amount*-1 }]))
  },
  onSubscribe: (ensAddress, amount) => dispatch(addSubscription(ensAddress, amount)),
  onUnsubscribe: (ensAddress, reschedule) => dispatch(removeSubscription(ensAddress, reschedule)),
  onChangeTab: tabIndex => dispatch(setTabIndex(tabIndex)),
  onWithdraw: async (from, ensAddress, tokenAddr, amount, tokenSymbol) => {
    const tx = await createTxWithdraw(from, tokenAddr, ensAddress, amount)
    dispatch(reviewTx([tx], [ensAddress], [{ [tokenSymbol]: amount }]))
  },
  onWithdrawETH: async (from, ensAddress, amount) => {
    const tx = await createTxWithdrawETH(from, ensAddress, amount)
    dispatch(reviewTx([tx], [ensAddress], [{ 'ETH': amount }]))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Token)
