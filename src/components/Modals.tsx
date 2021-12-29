import styled from 'styled-components'
import { Modal, Container, Row, Col, Button, Dropdown, Form, Spinner } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'
import { ORDER_SIDE, ORDER_TYPE } from '../utils/enums'
import { formatPriceUI, formatPrice2 } from '../utils/utils'
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'

import './Modals.css'
import TokenInput from './extra/TokenInput'
import {BUY, SELL, MARKET, LIMIT, IOC, FOK, MOC } from '../utils/constants'
import { WITHDRAW, DEPOSIT, MINT, BURN } from '../utils/constants'

const ERC20_ABI = require('../../src/artifacts/TestToken.json').abi
const DEX_ABI = require('../../src/artifacts/Dex.json').abi

const ModalTitle = styled.p`
  font-size: 1rem;
  font-weight: bold;
`
const TokenInfoParent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const TokenInfoHorizontal = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 5px;
`
const TokenInfoVertical = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const SideButton = styled(Button)`
  width: 100%;
  border-radius: 0px .25rem .25rem 0px;
  margin-left: 0px;
  &:focus {
    box-shadow: none;
  } 
`
const TypeButton = styled(Button)`
  width: 100%;
  border-radius: .25rem 0px 0px .25rem;
  margin-right: 0px;
  &:focus {
    box-shadow: none;
  } 
`
const ControlButton = styled(Button)`
  width: 25%;
`
const TokenLabel = styled.div`
  width: 100px;
`
const TokenBalance = styled.div`
  width: 140px;
  margin-left: 5px;
`

export function OrderModal(props) {

  const TX_NO = 0
  const TX_PENDING = 1
  const TX_SENT = 2

  const defaultOrderState = {
    side: BUY,
    type: LIMIT,
    amount: '0',
    price: '0',
    valid: false,
    balances: {base:'0', paired:'0'},
    market: {buy: '0', sell: '0'}
  }

  const [order, setOrder] = useState<any>(defaultOrderState)
  const [message, setMessage] = useState<any>({
    disabled: true,
    color: '#000',
    text: 'Dummy'
  })
  const [txState, setTxState] = useState<any>(TX_NO)

  /**
   * Update token balances and market prices
   */
  useEffect(() => {

    if(!props.appstate.baseToken || !props.appstate.pairedToken || !props.metamask.currentAccount) {
      return
    }

    const getBalances = async () => {
      
      const baseTokenBalance = await props.dexcontract.methods.balances(props.metamask.currentAccount, props.appstate.baseToken.ticker).call()
      const pairedTokenBalance = await props.dexcontract.methods.balances(props.metamask.currentAccount, props.appstate.pairedToken.ticker).call()

      return {base: baseTokenBalance, paired: pairedTokenBalance}
    }

    const getMarket = async () => {

      let buyMarket = order.market.buy
      let sellMarket = order.market.sell
      try {
        buyMarket = await props.dexcontract.methods.getMarketPrice(SELL, props.appstate.baseToken.ticker, props.appstate.pairedToken.ticker).call()
      } catch (e) {}
      try {
        sellMarket = await props.dexcontract.methods.getMarketPrice(BUY, props.appstate.baseToken.ticker, props.appstate.pairedToken.ticker).call()
      } catch (e) {}

      return {buy: buyMarket, sell: sellMarket}
    }

    getBalances()
    .then((balances) => {
      setOrder((prevOrder) => ({...prevOrder, balances: balances}))
    })
    .catch((err) => console.error(err))
    getMarket().then((market) => {
      setOrder((prevOrder) => ({...prevOrder, market: market}))
    })
    .catch((err) => console.error(err))


  }, [props.metamask.currentAccount, props.appstate.baseToken, props.appstate.pairedToken, props.show])

  useEffect(() => {
    setOrder(() => ({...defaultOrderState, amount: '0', price: '0'}))
  }, [props.appstate.baseToken, props.appstate.pairedToken])

  // Update the price based on the current order side
  useEffect(() => {
    setOrder((prevOrder) => ({...prevOrder, price: prevOrder.side === SELL ? prevOrder.market.sell : prevOrder.market.buy}))
  }, [order.side, order.market])

  const disableSubmit = order.type === 0 && ((order.side === 0 && order.market.buy === '0') || (order.side === 1 && order.market.sell === '0'))
  
  const baseTokenSymbol = props.appstate.baseToken ? props.appstate.baseToken.symbol : ''
  const baseTokenDecimals = props.appstate.baseToken ? props.appstate.baseToken.decimals : '1'
  const baseTokenBalance = (order.balances.base / 10 ** baseTokenDecimals).toString()
  const baseTokenQuantity = (order.amount / 10 ** baseTokenDecimals).toString()

  const pairedTokenSymbol = props.appstate.pairedToken ? props.appstate.pairedToken.symbol : ''
  const pairedTokenDecimals = props.appstate.pairedToken ? props.appstate.pairedToken.decimals : '1'
  const pairedTokenBalance = (order.balances.paired / 10 ** pairedTokenDecimals).toString()

  const pricePerToken = (order.price / 10 ** pairedTokenDecimals).toString()

  // Calculate the total amount of paired tokens required to make a trade
  const a = parseFloat((BigInt(order.amount) * BigInt(order.price) / BigInt(10 ** baseTokenDecimals)).toString())
  const calculatedPairedTokenValue = (a / 10 ** pairedTokenDecimals).toString()

  // Handler for order side change
  const changeSide = () => {
    setOrder((prevOrder) => ({...prevOrder, side: (prevOrder.side + 1) % Object.keys(ORDER_SIDE).length}))
  }
  // Handler for order type change
  const changeType = () => {
    setOrder((prevOrder) => ({...prevOrder, type: (prevOrder.type + 1) % Object.keys(ORDER_TYPE).length}))
  }
  // Handler for base token quantity change. Changes the `order.amount` directly
  const changeBaseQuantity = (baseTokenQuantity) => {
    setOrder((prevOrder) => ({
      ...prevOrder, 
      amount: (BigInt(parseFloat(baseTokenQuantity) * 10 ** baseTokenDecimals)).toString()
    }))
  }
  // Handler for base token quantity change. Changes the `order.amount` by calculating the amount base on the paired token and price
  const changePairedQuantity = (pairedTokenQuantity) => {
    if (order.price == 0) {
      return
    }
    setOrder((prevOrder) => ({
      ...prevOrder, 
      amount: (BigInt(parseFloat(pairedTokenQuantity) * 10 ** pairedTokenDecimals) * BigInt(10 ** baseTokenDecimals) / BigInt(order.price)).toString()
    }))
  }
  // Handler for price per token change
  const changeXchgRate = (pricePerToken) => {
    setOrder((prevOrder) => ({
      ...prevOrder, 
      price: (BigInt(parseFloat(pricePerToken) * 10 ** pairedTokenDecimals)).toString()
    }))
  }
  // Send tx handler
  const sendTx = () => {

    setTxState(() => TX_PENDING)
    const web3Client = new Web3(props.metamask.provider)
    const dex = new web3Client.eth.Contract(DEX_ABI, props.dexcontract._address)

    // Create order
    dex.methods.createOrder(order.side, order.type, props.appstate.baseToken.ticker, props.appstate.pairedToken.ticker, order.price, order.amount).send({from: props.metamask.currentAccount})
    .then((txHash) => {
      setTxState(() => TX_NO)
    })
    .catch((error) => {
      setTxState(() => TX_NO)
    })
  }

  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" contentClassName='ModalDark' animation={false}>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" as={ModalTitle}>
          Create Order
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="show-grid">
        <TokenInfoParent>
          <TokenInfoVertical>
            <TokenInfoHorizontal>
              <TypeButton variant='secondary' onClick={changeType}>{ORDER_TYPE[order.type]}</TypeButton>
              <SideButton variant={order.side === BUY ? 'info' : 'danger'} onClick={changeSide}>{ORDER_SIDE[order.side]}</SideButton>
            </TokenInfoHorizontal>
            <TokenInfoHorizontal>
              <TokenLabel>{baseTokenSymbol}</TokenLabel>
              <TokenInput 
              name='baseToken' 
              value={baseTokenQuantity}
              decimals={baseTokenDecimals} 
              max={baseTokenBalance}
              onChange={changeBaseQuantity}
              />
              <TokenBalance>{` / ${formatPrice2(baseTokenBalance)}`}</TokenBalance>
            </TokenInfoHorizontal>
            <TokenInfoHorizontal>
              <TokenLabel>{pairedTokenSymbol}</TokenLabel>
              <TokenInput 
              name='pairedToken' 
              value={calculatedPairedTokenValue}
              decimals={pairedTokenDecimals}
              max={pairedTokenBalance}
              onChange={changePairedQuantity}
              />
              <TokenBalance>{` / ${formatPrice2(pairedTokenBalance)}`}</TokenBalance>
            </TokenInfoHorizontal>
            <TokenInfoHorizontal>
              <div>Exchange Rate</div>
            </TokenInfoHorizontal>
            <TokenInfoHorizontal>
              <div>{`${baseTokenSymbol} / ${pairedTokenSymbol}`}</div>
              <TokenInput 
              name='pricePerToken'
              value={pricePerToken}
              decimals={pairedTokenDecimals} 
              onChange={changeXchgRate}
              />
            </TokenInfoHorizontal>
          </TokenInfoVertical>
          <TokenInfoVertical>
          <TokenInfoHorizontal hidden={message.disabled} style={{color: message.color}}>
              {message.text}
            </TokenInfoHorizontal>
          </TokenInfoVertical>
        </TokenInfoParent>
      </Modal.Body>
      <Modal.Footer>
        <ControlButton variant='warning' onClick={sendTx} disabled={disableSubmit}>{txState === TX_PENDING ? <Spinner animation="border" variant='secondary' size='sm'/> : 'Submit'}</ControlButton>
        <ControlButton variant='secondary' onClick={props.onHide}>Close</ControlButton>
      </Modal.Footer>
    </Modal>
  )
}

export function ConnectionMessageModal(props) {
  return (
      <Modal show={props.show} onHide={props.handleClose} size='sm' contentClassName='ModalDark'>
        <Modal.Header closeButton>
          <Modal.Title as={ModalTitle}>Wrong Network</Modal.Title>
        </Modal.Header>
        <Modal.Body>Please connect to the correct network</Modal.Body>
      </Modal>
  )
}

export function TokenErrorModal(props) {
  return (
      <Modal show={props.show} onHide={props.handleClose} size='sm' contentClassName='ModalDark'>
        <Modal.Header closeButton>
          <Modal.Title as={ModalTitle}>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.text}</Modal.Body>
      </Modal>
  )
}

export function OrderCancelModal(props) {

  const text = !props.order ? '' : `Order ${props.order.id} will be flagged as cancelled. The order will remain in the active orders until it reaches the top of the order book where it will be popped off without being executed`

  return (
      <Modal show={props.show} onHide={props.handleClose} contentClassName='ModalDark'>
        <Modal.Header closeButton>
          <Modal.Title as={ModalTitle}>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>{text}</Modal.Body>
        <Modal.Footer>
          <ControlButton variant="secondary" onClick={props.handleClose}>Back</ControlButton>
          <ControlButton variant="primary" onClick={props.handleConfirmedAction}>Confirm</ControlButton>
        </Modal.Footer>
      </Modal>
  )
}

export function FundsModal(props) {

  let theme, maxValue
  switch(props.params.action) {
    case DEPOSIT:
      theme = {title: 'Deposit Funds to Dex', variant: 'info', confirm: 'Deposit'} 
      maxValue = props.params.balance.wallet
      break
    case WITHDRAW:
      theme = {title: 'Withdraw Funds from Dex', variant: 'danger', confirm: 'Withdraw'}
      maxValue = props.params.balance.dex
      break
    case MINT:
      theme = {title: 'Mint ERC20 tokens', variant: 'info', confirm: 'Mint'} 
      maxValue = '1000000'
      break
    case BURN:
      theme = {title: 'Burn ERC20 Tokens', variant: 'danger', confirm: 'Burn'}
      maxValue = props.params.balance.wallet
      break
    default:
      console.error("Wrong action parameter");
  }
  

  const [spinner, setSpinner] = useState(false)
  const [amount, setAmount] = useState('0')

  return (
      <Modal show={props.show} onHide={props.handleClose} contentClassName='ModalDark'>
        <Modal.Header closeButton>
          <Modal.Title as={ModalTitle}>{theme.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TokenInfoHorizontal>
            {`Enter ${props.params.symbol} amount:`}
          </TokenInfoHorizontal>
          <TokenInfoHorizontal>
            <TokenInput 
            name='amount'
            value=''
            max={maxValue}
            decimals={props.params.decimals} 
            onChange={(v) => (setAmount(() => (BigInt(parseFloat(v) * 10 ** props.params.decimals)).toString()))}
            />
          </TokenInfoHorizontal>
        </Modal.Body>
        <Modal.Footer>
          <ControlButton variant="secondary" onClick={props.handleClose}>Back</ControlButton>
          <ControlButton variant={theme.variant} onClick={() => {
            setSpinner(() => true)
            props.handleConfirmed({...props.params, amount: amount})
            .then(() => setSpinner(false))
            .catch(error => console.error(error))
            props.handleClose()
          }}>
            {spinner ? <Spinner animation="border" variant='secondary' size='sm'/>  : theme.confirm}
          </ControlButton>
        </Modal.Footer>
      </Modal>
  )
}  