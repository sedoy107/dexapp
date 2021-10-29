import styled from 'styled-components'
import { Modal, Container, Row, Col, Button } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'

import './OrderModal.css'

export default function OrderModal(props) {
    return (
      <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered contentClassName='OrderModalTransparent' animation={false}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
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