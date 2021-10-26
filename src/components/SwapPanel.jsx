import styled from 'styled-components'
import React, {useState, useEffect} from 'react'

// Generic styles for the page
const ParentContainer = styled.div`
`
const RowPanelBase = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    margin-bottom: 10px;
`
const RowPanel = styled.div`
    background:rgba(0, 0, 0,0.6);
    height: 37vh;
    border-radius: 10px;
    text-align: left;
`
const ColumnPanel = styled(RowPanel)`
    width: 50%;
`
const Title = styled.p`
    font-weight: bold;
    color: #fff;
    font-size: 0.85rem;
    margin: 5px 10px;
`

// Chart panel
const ChartDiv = styled(ColumnPanel)`
    margin-right: 5px;
`
function Chart() {
    return (
        <ChartDiv><Title>Chart</Title></ChartDiv>
    )
}

// Orderbook panel
const OrderbookDiv = styled(ColumnPanel)`
    margin-left: 5px;
`
function Orderbook() {
    return (
        <OrderbookDiv><Title>Orderbook</Title></OrderbookDiv>
    )
}

// Orders panel
const OrderTabs = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: start;
`
const TabButton = styled.button`
    background-color: rgba(0,0,0,0);
    border-style: none;
    border-radius: 10px;
`
const OrdersDiv = styled(RowPanel)`
    width: 100%;
`
function Orders() {
    return (
        <OrdersDiv>
            <OrderTabs>
                <TabButton><Title>Active Orders</Title></TabButton>
                <TabButton><Title>Completed Orders</Title></TabButton>
            </OrderTabs>
        </OrdersDiv>
    )
}

export default function SwapPanel(props) {

    return (
        <ParentContainer>
            <RowPanelBase>
                <Chart />
                <Orderbook />
            </RowPanelBase>
            <RowPanelBase>
                <Orders />
            </RowPanelBase>
        </ParentContainer>
    )
}
