import styled from 'styled-components'
import React, {useState, useEffect} from 'react'
import { Table, Spinner } from 'react-bootstrap'

// Generic styles for the page
const GrandParentContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`

const ParentContainer = styled.div`
    width: 1200px;
    min-width: 1000px;
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
function Chart(props) {
    return (
        <ChartDiv><Title>Chart</Title></ChartDiv>
    )
}

// Orderbook panel
const OrderbookDiv = styled(ColumnPanel)`
    margin-left: 5px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
`
const OrderbookAwaitDiv = styled(ColumnPanel)`
    margin-left: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const BuySideDiv = styled.div`
    overflow-y: scroll;
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
    background-color: rgba(0,0,255,0.2);
`
const SellSideDiv = styled.div`
    overflow-y: scroll;
    width: 100%;
    border-radius: 0 0 10px 10px;
    background-color: rgba(255,0,0,0.2);
    padding-bottom: .5rem;
`
const SpreadDiv = styled.div`
    font-size: 0.75rem;
    margin-bottom: 0px;
    padding: 0 .5rem;
    width: 100%;
    background-color: rgba(255,0,255,0.1);
`
const buyRowStyle = {
    padding: '0 .5rem',
}
const sellRowStyle = {
    padding: '0 .5rem',
}
const headerStyle = {
    padding: '0 .5rem'
}
export interface IOrderBookDisplay {
    buy: any[],
    sell: any[],
    spread: number
}

function Orderbook(props) {

    const [orderbook, setOrderbook] = useState<IOrderBookDisplay | null>(null)

    useEffect(() => {

        const buyOrders = props.orderBook.buy.map(({id, price, amount}) => {
            return (
                <tr key={id}>
                    <td style={buyRowStyle}>{price}</td>
                    <td style={buyRowStyle}>{amount}</td>
                </tr>
            )
        })
        const sellOrders = props.orderBook.sell.map(({id, price, amount}) => {
            return (
                <tr key={id}>
                    <td style={sellRowStyle}>{price}</td>
                    <td style={sellRowStyle}>{amount}</td>
                </tr>
            )
        }).reverse()

        const spread = props.orderBook.buy.length > 0 && props.orderBook.sell.length > 0 
        ? Math.abs(props.orderBook.buy.slice(-1)[0].price - props.orderBook.sell.slice(-1)[0].price) : 0

        setOrderbook(() => {
            return {
                buy: buyOrders,
                sell: sellOrders,
                spread: spread
            }
        })

    }, [props.appState.baseToken, props.orderBook])

    return (
        !orderbook 
        ? 
        <OrderbookAwaitDiv>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </OrderbookAwaitDiv>
        : orderbook.buy.length === 0 && orderbook.sell.length === 0
        ?
        <OrderbookAwaitDiv>
            <p>No orders found</p>
        </OrderbookAwaitDiv>
        :
        <OrderbookDiv>
            <Table striped hover style={{fontSize: '0.75rem', marginBottom: '0px'}}>
                <thead>
                    <tr>
                        <th style={headerStyle}>Price</th>
                        <th style={headerStyle}>Quantity</th>
                    </tr>
                </thead>
            </Table>
            <BuySideDiv>
            <Table striped borderless hover style={{fontSize: '0.75rem', marginBottom: '0px'}}>
                <tbody>
                    {orderbook.buy}
                </tbody>
            </Table>
            </BuySideDiv>
            <SpreadDiv>Spread: {orderbook.spread}</SpreadDiv>
            <SellSideDiv>
            <Table striped borderless hover style={{fontSize: '0.75rem', marginBottom: '0px'}}>
                <tbody>
                    {orderbook.sell}
                </tbody>
            </Table>
            </SellSideDiv>
        </OrderbookDiv>
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
function Orders(props) {
    return (
        <OrdersDiv>
            <OrderTabs>
                <TabButton><Title>Active Orders</Title></TabButton>
                <TabButton><Title>Completed Orders</Title></TabButton>
            </OrderTabs>
        </OrdersDiv>
    )
}

export default function DexTradeInfo(props) {

    return (
        <GrandParentContainer>
        <ParentContainer>
            <RowPanelBase>
                <Chart />
                <Orderbook orderBook={props.orderBook} appState={props.appState}/>
            </RowPanelBase>
            <RowPanelBase>
                <Orders />
            </RowPanelBase>
        </ParentContainer>
        </GrandParentContainer>
    )
}
