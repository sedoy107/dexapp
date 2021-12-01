import styled from 'styled-components'
import { Modal, Container, Row, Col, Button, Dropdown, Form } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'
import { ORDER_SIDE, ORDER_TYPE } from '../utils/enums'
import { formatPriceUI, formatPrice2 } from '../utils/utils'
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'

import './Modals.css'
import TokenInput from './extra/TokenInput'
import {BUY, SELL, MARKET, LIMIT, IOC, FOK, MOC } from '../utils/constants'

const ERC20_ABI = require('../../src/artifacts/ERC20.json').abi

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
const TokenLabel = styled.div`
  width: 100px;
`
const TokenBalance = styled.div`
  width: 140px;
  margin-left: 5px;
`

export function OrderModal(props) {

  const defaultOrderState = {
    side: 0,
    type: 0,
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
  const [readyState, setReadyState] = useState<any>({
    ok: false,

  })

  /**
   * Update token balances and market prices
   */
  useEffect(() => {

    const getBalances = async () => {
      
      const Web3Client = new Web3(props.metamask.provider);
      let baseTokenBalance = props.metamask.balance
      let pairedTokenBalance = props.metamask.balance
      
      // Get base token balance
      if (props.appstate.baseToken.address !== "0x0000000000000000000000000000000000000000" ) {
        const baseTokenContract = new Web3Client.eth.Contract(ERC20_ABI, props.appstate.baseToken.address)
        baseTokenBalance = await baseTokenContract.methods.balanceOf(props.metamask.currentAccount).call()
      }
      // Get paired token balance
      if (props.appstate.pairedToken.address !== "0x0000000000000000000000000000000000000000") {
        const pairedTokenContract = new Web3Client.eth.Contract(ERC20_ABI, props.appstate.pairedToken.address)
        pairedTokenBalance = await pairedTokenContract.methods.balanceOf(props.metamask.currentAccount).call()
      }

      return {base: baseTokenBalance, paired: pairedTokenBalance}
    }

    const getMarket = async () => {

      let buyMarket = '0'
      let sellMarket = '0'
      try {
        buyMarket = await props.dexcontract.methods.getMarketPrice(BUY, props.appstate.baseToken.ticker, props.appstate.pairedToken.ticker).call()
      } catch (e) {}
      try {
        sellMarket = await props.dexcontract.methods.getMarketPrice(SELL, props.appstate.baseToken.ticker, props.appstate.pairedToken.ticker).call()
      } catch (e) {}

      return {buy: buyMarket, sell: sellMarket}
    }

    if(!props.appstate.baseToken || !props.appstate.pairedToken || !props.metamask) {
      return
    }

    getBalances().then((balances) => {
      setOrder((prevOrder) => ({...prevOrder, balances: balances}))
    })   
    getMarket().then((market) => {
      setOrder((prevOrder) => ({...prevOrder, market: market}))
    }) 


  }, [props.metamask, props.appstate.blockNumber, props.appstate.baseToken, props.appstate.pairedToken, props.show])

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
      amount: BigInt(baseTokenQuantity * 10 ** baseTokenDecimals).toString()
    }))
  }
  // Handler for base token quantity change. Changes the `order.amount` by calculating the amount base on the paired token and price
  const changePairedQuantity = (pairedTokenQuantity) => {
    if (order.price == 0) {
      return
    }
    setOrder((prevOrder) => ({
      ...prevOrder, 
      amount: (BigInt(pairedTokenQuantity * 10 ** pairedTokenDecimals) * BigInt(10 ** baseTokenDecimals) / BigInt(order.price)).toString()
    }))
  }
  // Handler for price per token change
  const changeXchgRate = (pricePerToken) => {
    setOrder((prevOrder) => ({
      ...prevOrder, 
      price: BigInt(pricePerToken * 10 ** pairedTokenDecimals).toString()
    }))
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
              <SideButton variant={order.side ? 'info' : 'danger'} onClick={changeSide}>{ORDER_SIDE[order.side]}</SideButton>
            </TokenInfoHorizontal>
            <TokenInfoHorizontal>
              <TokenLabel>{baseTokenSymbol}</TokenLabel>
              <TokenInput 
              name='baseToken' 
              value={baseTokenQuantity}
              decimals={baseTokenDecimals} 
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
        <Button variant='warning' onClick={props.onHide} disabled={disableSubmit}>Submit</Button>
        <Button variant='secondary' onClick={props.onHide}>Close</Button>
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

export function OrderCancelModal(props) {

  const text = !props.order ? '' : `Order ${props.order.id} will be flagged as cancelled. The order will remain in the active orders until it reaches the top of the order book where it will be popped off without being executed`

  return (
      <Modal show={props.show} onHide={props.handleClose} contentClassName='ModalDark'>
        <Modal.Header closeButton>
          <Modal.Title as={ModalTitle}>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>{text}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.handleClose}>Back</Button>
          <Button variant="primary" onClick={props.handleConfirmedAction}>Confirm</Button>
        </Modal.Footer>
      </Modal>
  )
}
  