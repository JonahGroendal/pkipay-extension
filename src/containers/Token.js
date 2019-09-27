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
    subtitle: "A stablecoin backed by the credit of ".concat(domainName, ". All purchases are 100% refundable."),
    contract: `This is a vehicle for charitable investment, and, as such,
               will not yield a positive return on investment. The token issuer, the registrant of ${domainName},
               promises to repurchase all tokens on-demand at a price no less
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
    buyPriceText: buyPrice.toFixed(2).concat(' DAI/token'),
    sellPriceText: sellPrice.toFixed(2).concat(' DAI/token'),
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
