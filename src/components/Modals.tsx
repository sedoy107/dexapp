import styled from 'styled-components'
import { Modal, Container, Row, Col, Button } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'

import './Modals.css'

const ModalTitle = styled.p`
  font-size: 1rem;
  font-weight: bold;
`

export function OrderModal(props) {
    return (
      <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered contentClassName='ModalTransparent' animation={false}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter" as={ModalTitle}>
            Create Order
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          <Container>
            <Row>
              <Col xs={12} md={8}>
                .col-xs-12 .col-md-8
              </Col>
              <Col xs={6} md={4}>
                .col-xs-6 .col-md-4
              </Col>
            </Row>
  
            <Row>
              <Col xs={6} md={4}>
                .col-xs-6 .col-md-4
              </Col>
              <Col xs={6} md={4}>
                .col-xs-6 .col-md-4
              </Col>
              <Col xs={6} md={4}>
                .col-xs-6 .col-md-4
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  export function WrongNetworkModal(props) {
    return (
        <Modal show={props.show} onHide={props.handleClose} size='sm' contentClassName='ModalDark'>
          <Modal.Header closeButton>
            <Modal.Title as={ModalTitle}>Wrong Network</Modal.Title>
          </Modal.Header>
          <Modal.Body>Please connect to the correct network</Modal.Body>
        </Modal>
    );
  }
