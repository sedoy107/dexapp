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
      <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered contentClassName='ModalTransparent' animation={false} size='sm'>
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
  