import styled from 'styled-components'
import { Modal, Container, Row, Col, Button, Dropdown, Form } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'
import { ORDER_SIDE, ORDER_TYPE } from '../utils/enums'
import { formatPrice, } from '../utils/utils'
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'

import './Modals.css'

const ERC20_ABI = require('../../src/artifacts/ERC20.json')

const ModalTitle = styled.p`
  font-size: 1rem;
  font-weight: bold;
`

export function OrderModal(props) {

  const defaultOrderState = {
    side: 0,
    type: 0,
    amount: '0',
    price: '0',
    valid: false,
    balances: {base:'0', paired:'0'}
  }

  const [order, setOrder] = useState<any>(defaultOrderState)

  useEffect(() => {

    const getBalances = async () => {
      
      
      const Web3Client = new Web3(props.metamask.provider);
      let baseTokenBalance = props.metamask.balance
      let pairedTokenBalance = props.metamask.balance
      
      // Get base token balance
      if (props.appstate.baseToken.address !== "0x0000000000000000000000000000000000000000" ) {
        const baseTokenContract = new Web3Client.eth.Contract(ERC20_ABI.abi, props.appstate.baseToken.address)
        baseTokenBalance = await baseTokenContract.methods.balanceOf(props.metamask.currentAccount).call()
      }
      // Get paired token balance
      if (props.appstate.pairedToken.address !== "0x0000000000000000000000000000000000000000") {
        const pairedTokenContract = new Web3Client.eth.Contract(ERC20_ABI.abi, props.appstate.pairedToken.address)
        pairedTokenBalance = await pairedTokenContract.methods.balanceOf(props.metamask.currentAccount).call()
      }

      return {base: baseTokenBalance, paired: pairedTokenBalance}
    }

    if(!props.appstate.baseToken || !props.appstate.pairedToken || !props.metamask || !props.show) {
      return
    }

    getBalances().then((balances) => {
      setOrder((prevOrder) => ({...prevOrder, balances: balances}))
    })    


  }, [props.appstate.baseToken, props.appstate.pairedToken, props.metamask, props.show])

  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" contentClassName='ModalDark' animation={false} size='sm'>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" as={ModalTitle}>
          Create Order
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="show-grid">
        <div>
          <div>{props.appstate.baseToken ? props.appstate.baseToken.symbol : ''}</div>
          <div>{props.appstate.pairedToken ? props.appstate.pairedToken.symbol : ''}</div>
        </div>
        
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
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
  