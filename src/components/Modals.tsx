import styled from 'styled-components'
import { Modal, Container, Row, Col, Button, Dropdown, Form } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'

import './Modals.css'

const ModalTitle = styled.p`
  font-size: 1rem;
  font-weight: bold;
`

export function OrderModal(props) {
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
    );
  }

  export function ConnectionMessageModal(props) {
    return (
        <Modal show={props.show} onHide={props.handleClose} size='sm' contentClassName='ModalDark'>
          <Modal.Header closeButton>
            <Modal.Title as={ModalTitle}>Wrong Network</Modal.Title>
          </Modal.Header>
          <Modal.Body>Please connect to the correct network</Modal.Body>
        </Modal>
    );
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
    );
  }
  