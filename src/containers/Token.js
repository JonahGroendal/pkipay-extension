import React from 'react';
import PresentationalComponent from '../components/Token';
import {
  tokenBuyerApproved,
  createTxApproveTokenBuyer,
  createTxBuyTokens,
  createTxSellToken,
  createTxWithdraw,
  createTxWithdrawETH,
  addresses,
  getTokenInfo,
  getTokenSaleInfo,
} from '../api/blockchain';
import { connect } from 'react-redux'
import { reviewTx, addSubscription, removeSubscription, setTabIndex } from '../actions'

const tokenOptions = ['DAI', 'ETH']
const orderTypeOptions = ['Buy', 'Sell', 'Subscribe (Buy Monthly)']

function Token(props) {
  const { domainName, adminViewEnabled, ...mapped } = props;

  const [amount, setAmount] = React.useState('');
  const parsedAmount = isNaN(amount) ? 0 : Number(amount);
  const [orderType, setOrderType] = React.useState(orderTypeOptions[0]);
  const [submitOrderButtonLoading, setSubmitOrderButtonLoading] = React.useState(false);
  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [token, setToken] = React.useState(tokenOptions[0]);
  const [totalSupply] = useTokenInfo(domainName, mapped.txScreenOpen);
  const [buyPrice, sellPrice, reservesDAI, reservesETH] = useTokenSaleInfo(domainName, mapped.txScreenOpen);

  const prices = {
    'Buy': buyPrice,
    'Sell': sellPrice,
    'Subscribe (Buy Monthly)': buyPrice
  }
  const reserves = {
    'DAI': reservesDAI,
    'ETH': reservesETH
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
        return await mapped.onBuy(mapped.address, domainName, numTokens * buyPrice, numTokens);
      case 'Sell':
        return await mapped.onSell(mapped.address, domainName, numTokens, numTokens * sellPrice);
      case 'Subscribe (Buy Monthly)':
        setSubmitOrderButtonLoading(true);
        if (mapped.subscriptions.filter(sub => sub.domainName === domainName).length > 0)
          await mapped.onUnsubscribe(domainName, false)
        await mapped.onSubscribe(domainName, numTokens * buyPrice);
        setSubmitOrderButtonLoading(false);
        mapped.onChangeTab(1);
        setAmount('');
        setOrderType(orderTypeOptions[0]);
    }
  }

  async function handleClickWithdraw() {
    const amount = parseFloat(withdrawAmount)
    if (token === 'ETH')
      await mapped.onWithdrawETH(mapped.address, domainName, amount)
    else
      await mapped.onWithdraw(mapped.address, domainName, addresses[token], amount, token)
  }

  return React.createElement(PresentationalComponent, {
    adminViewEnabled,
    title: "Token",
    totalSupply: totalSupply.toFixed(2),
    totalReserves: Object.keys(reserves).map((symbol, i) => reserves[symbol].toFixed(symbol === 'DAI' ? 2 : 3).concat(" ", symbol)).join(' + '),
    buyPrice: buyPrice.toFixed(2).concat(' DAI/token'),
    sellPrice: sellPrice.toFixed(2).concat(' DAI/token'),
    inputLabel: "Amount",
    amount,
    onChangeAmount: handleChangeAmount,
    orderTypeOptions,
    orderType,
    onChangeOrderType: setOrderType,
    onClickSubmitOrder: handleClickSubmitOrder,
    submitOrderButtonText: (parsedAmount * prices[orderType]).toFixed(2).concat(" DAI"),
    submitOrderButtonTooltip: orderType.concat(" ", parsedAmount.toFixed(2), " tokens", " for ", (parsedAmount * prices[orderType]).toFixed(2), " DAI"),
    submitOrderButtonDisabled: parsedAmount <= 0 || (orderType === 'Sell' && reserves['DAI'] < parsedAmount),
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

function useTokenInfo(domainName, txScreenOpen) {
  const [totalSupply, setTotalSupply] = React.useState(0);

  React.useEffect(() => {
    if (domainName && !txScreenOpen) {
      getTokenInfo(domainName).then(info => {
        setTotalSupply(info.totalSupply)
      })
    } else {
      setTotalSupply(0);
    }
  }, [domainName, txScreenOpen])

  return [totalSupply]
}

function useTokenSaleInfo(domainName, txScreenOpen) {
  const [buyPrice, setBuyPrice] = React.useState(1);
  const [sellPrice, setSellPrice] = React.useState(1);
  const [reservesDAI, setReservesDAI] = React.useState(0);
  const [reservesETH, setReservesETH] = React.useState(0);

  React.useEffect(() => {
    if (domainName) {
      if (!txScreenOpen) {
        getTokenSaleInfo(domainName).then(info => {
          setBuyPrice(info.buyPrice);
          setSellPrice(info.sellPrice);
          setReservesDAI(info.reservesDAI);
          setReservesETH(info.reservesETH);
        })
      }
    } else {
      setBuyPrice(1);
      setSellPrice(1);
      setReservesDAI(0);
      setReservesETH(0);
    }
  }, [domainName, txScreenOpen])

  return [buyPrice, sellPrice, reservesDAI, reservesETH]
}

const mapStateToProps = state => ({
  address: state.wallet.addresses[state.wallet.defaultAccount],
  txScreenOpen: state.transactionScreen.isOpen,
  subscriptions: state.subscriptions
})

const mapDispatchToProps = (dispatch) => ({
  onBuy: async (from, domainName, daiValue, amount) => {
    const txs = []
    const approved = await tokenBuyerApproved(from)
    if (!approved)
      txs.push(createTxApproveTokenBuyer(from))
    txs.push(createTxBuyTokens(from, domainName, daiValue))
    dispatch(reviewTx(txs, [domainName], [{ 'DAI': daiValue*-1, 'tokens': amount }]))
  },
  onSell: async (from, domainName, amount, daiValue) => {
    const txs = await createTxSellToken(from, domainName, amount)
    dispatch(reviewTx(txs, [domainName], [{ 'DAI': daiValue, 'tokens': amount*-1 }]))
  },
  onSubscribe: (domainName, amount) => dispatch(addSubscription(domainName, amount)),
  onUnsubscribe: (domainName, reschedule) => dispatch(removeSubscription(domainName, reschedule)),
  onChangeTab: tabIndex => dispatch(setTabIndex(tabIndex)),
  onWithdraw: async (from, domainName, tokenAddr, amount, tokenSymbol) => {
    const tx = await createTxWithdraw(from, domainName, tokenAddr, amount)
    dispatch(reviewTx([tx], [domainName], [{ [tokenSymbol]: amount }]))
  },
  onWithdrawETH: async (from, domainName, amount) => {
    const tx = await createTxWithdrawETH(from, domainName, amount)
    dispatch(reviewTx([tx], [domainName], [{ 'ETH': amount }]))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Token)
