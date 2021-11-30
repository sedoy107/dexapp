import styled from 'styled-components'
import React, { useState, useEffect, useCallback } from 'react'
import { Table, Spinner, Button } from 'react-bootstrap'
import { ORDER_SIDE, ORDER_TYPE } from '../utils/enums'
import { formatPrice, } from '../utils/utils'
import { OrderCancelModal } from './Modals'

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
    width: '50%',
}
const sellRowStyle = {
    padding: '0 .5rem',
    width: '50%',
}
const headerStyle = {
    padding: '0 .5rem',
    width: '50%',
    textAlign: 'center' as const
}
const tableStyle = {
    fontSize: '0.75rem',
    marginBottom: '0px'
}

export interface IOrderBookDisplay {
    buy: any[],
    sell: any[],
    spread: string
}

function Orderbook(props) {

    const [orderbook, setOrderbook] = useState<IOrderBookDisplay | null>(null)

    useEffect(() => {
        //debugger
        if (!props.appState.baseToken || !props.appState.pairedToken) {
            //setOrderbook(() => ({buy: [], sell: [], spread: ''}))
            setOrderbook(() => (null))
            return
        }

        const buyOrders = props.orderBook.buy.map(({id, price, amount}) => {
            return (
                <tr key={id}>
                    <td style={buyRowStyle}>{formatPrice(price, props.appState.pairedToken.decimals)}</td>
                    <td style={buyRowStyle}>{formatPrice(amount, props.appState.baseToken.decimals)}</td>
                </tr>
            )
        })
        const sellOrders = props.orderBook.sell.map(({id, price, amount}) => {
            return (
                <tr key={id}>
                    <td style={sellRowStyle}>{formatPrice(price, props.appState.pairedToken.decimals)}</td>
                    <td style={sellRowStyle}>{formatPrice(amount, props.appState.baseToken.decimals)}</td>
                </tr>
            )
        }).reverse()

        const spread = props.orderBook.buy.length > 0 && props.orderBook.sell.length > 0 
        ? Math.abs(props.orderBook.buy.slice(-1)[0].price - props.orderBook.sell.slice(-1)[0].price) : 0

        setOrderbook(() => {
            return {
                buy: buyOrders,
                sell: sellOrders,
                spread: formatPrice(spread, props.appState.pairedToken.decimals)
            }
        })

    }, [props.orderBook])

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
            <Table striped hover style={tableStyle}>
                <thead>
                    <tr>
                        <th style={headerStyle}>Price</th>
                        <th style={headerStyle}>Quantity</th>
                    </tr>
                </thead>
            </Table>
            <BuySideDiv>
            <Table striped borderless hover style={tableStyle}>
                <tbody>
                    {orderbook.buy}
                </tbody>
            </Table>
            </BuySideDiv>
            <SpreadDiv>Spread of {!props.appState.pairedToken ? '' :`${props.appState.pairedToken.symbol ? props.appState.pairedToken.symbol : ''} ${orderbook.spread}`}</SpreadDiv>
            <SellSideDiv>
            <Table striped borderless hover style={tableStyle}>
                <tbody>
                    {orderbook.sell}
                </tbody>
            </Table>
            </SellSideDiv>
        </OrderbookDiv>
    )
}

// Orders panel
const OrderTab = styled.div`
    display: flex;
    flex-direction: column;
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
const OrdersAwaitDiv = styled(RowPanel)`
    margin-left: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
`
const CancelOrderButton = styled.button`
    height: 18px;
    width: 18px;
    color: #fff;
    background-color: rgba(0,0,0,0);
    border: none;
`
const ScrollableTable = styled.div`
    width: 100%;
    overflow-y: scroll;
    height: 100%;
`

const ordersRowStyle = {
    padding: '0 .5rem',
    textAlign: 'center' as const
}
const ordersHeaderStyle = {
    padding: '0 .5rem',
    textAlign: 'center' as const
}


function Orders(props) {

    const [activeOrders, setActiveOrders] = useState<any[]>([])
    const [completedOrders, setCompletedOrders] = useState<any[]>([])
    const [showCompleted, setShowCompleted] = useState(false)
    const [showOrderCancelModal, setShowOrderCancelModal] = useState(false)
    const [currentOrder, setCurrentOrder] = useState<any>(null)

    useEffect(() => {

        if (!props.appState.baseToken || !props.appState.pairedToken || !props.orderHistory) {
            return
        }

        const activeOrderList: any[] = []
        const completedOrderList: any[] = []

        for (let oid in props.orderHistory) {
            const order = props.orderHistory[oid]
            const {id, orderType, side, amount, price, tickerFrom, tickerTo, trader, filled, complete} = order
            if (props.appState.baseToken.ticker === tickerTo && props.appState.pairedToken.ticker === tickerFrom) {
                complete ? completedOrderList.push(order) : activeOrderList.push(order)
            }
        }

        setActiveOrders(() => activeOrderList.sort((a,b) => (a.ticker > b.ticker ? 1 : -1)))
        setCompletedOrders(() => completedOrderList.sort((a,b) => (a.ticker > b.ticker ? 1 : -1)))
        

    }, [props.appState.baseToken, props.appState.pairedToken, props.orderHistory])

    const switchOrderType = () => {
        setShowCompleted((prevState) => !prevState)
    }

    const handleOrderCancel = (order) => {
        const {id, orderType, side, amount, price, tickerFrom, tickerTo, trader, filled, complete} = order
        //console.log(`handleOrderCancel: ${id}, ${side}, ${tickerTo}, ${tickerFrom}, ${trader}`);
        setCurrentOrder(() => order)
        setShowOrderCancelModal(() => true)
    }

    const handleConfirmedOrderCancel = useCallback(() => {
        const {id, orderType, side, amount, price, tickerFrom, tickerTo, trader, filled, complete} = currentOrder
        //console.log(`handleConfirmedOrderCancel: ${id}, ${side}, ${tickerTo}, ${tickerFrom}, ${trader}`);
        props.dexContract.methods.cancelOrder(id, side, tickerTo, tickerFrom).send({from: trader})
        .then(() => {
            setShowOrderCancelModal(() => false)
        })
        .catch(error => console.error(error))
    }, [props.dexContract, currentOrder])   

    const completedOrderTableView = completedOrders.map((order) => {
        const {id, orderType, side, amount, price, tickerFrom, tickerTo, trader, filled, complete} = order
        return (
            <tr key={id}>
                <td style={ordersRowStyle}>{id}</td>
                <td style={ordersRowStyle}>{ORDER_TYPE[orderType]}</td>
                <td style={ordersRowStyle}>{ORDER_SIDE[side]}</td>
                <td style={ordersRowStyle}>
                    {`${formatPrice(filled, props.appState.baseToken.decimals)} / ${formatPrice(amount, props.appState.baseToken.decimals)}`}
                </td>
                <td style={ordersRowStyle}>{`${formatPrice(price, props.appState.pairedToken.decimals)}`}</td>
                <td style={ordersRowStyle}>{filled/amount * 100}</td>
                <td style={ordersRowStyle}></td>
            </tr>
        )
    })

    const activeOrderTableView = activeOrders.map((order) => {
        const {id, orderType, side, amount, price, tickerFrom, tickerTo, trader, filled, complete} = order
        return (
            <tr key={id}>
                <td style={ordersRowStyle}>{id}</td>
                <td style={ordersRowStyle}>{ORDER_TYPE[orderType]}</td>
                <td style={ordersRowStyle}>{ORDER_SIDE[side]}</td>
                <td style={ordersRowStyle}>
                    {`${formatPrice(filled, props.appState.baseToken.decimals)} / ${formatPrice(amount, props.appState.baseToken.decimals)}`}
                </td>
                <td style={ordersRowStyle}>{`${formatPrice(price, props.appState.pairedToken.decimals)}`}</td>
                <td style={ordersRowStyle}>{filled/amount * 100}</td>
                <td style={ordersRowStyle}>
                    <CancelOrderButton 
                    onClick={() => handleOrderCancel(order)}>
                        <i className="fas fa-window-close" />
                    </CancelOrderButton>
                </td>
            </tr>
        )
    })

    const buttonTitle = showCompleted ? "Switch to Active Orders" : "Switch to Completed Orders"

    return (
        !props.orderHistory 
        ? 
        <OrdersAwaitDiv>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </OrdersAwaitDiv>
        : (completedOrderTableView.length === 0 && showCompleted) || (activeOrderTableView.length === 0 && !showCompleted)
        ?
        <OrdersAwaitDiv>
            <p>No order history found</p>
        </OrdersAwaitDiv>    
        :
        <OrdersDiv>
            <OrderCancelModal 
                show={showOrderCancelModal} 
                handleShow={() => setShowOrderCancelModal(true)} 
                handleClose={() => setShowOrderCancelModal(false)} 
                order={currentOrder}
                handleConfirmedAction={handleConfirmedOrderCancel}
            />
            <OrderTab>
                <TabButton onClick={switchOrderType}><Title>{buttonTitle}</Title></TabButton>
                    <ScrollableTable>
                        <Table striped hover style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={ordersHeaderStyle}>Id</th>
                                <th style={ordersHeaderStyle}>Side</th>
                                <th style={ordersHeaderStyle}>Type</th>
                                <th style={ordersHeaderStyle}>{`Filled / Quantity, ${props.appState.baseToken ? props.appState.baseToken.symbol : ''}`}</th>
                                <th style={ordersHeaderStyle}>{`Price, ${props.appState.pairedToken ? props.appState.pairedToken.symbol : ''}`}</th>
                                <th style={ordersHeaderStyle}>Filled, %</th>
                                <th style={ordersHeaderStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {showCompleted ? completedOrderTableView : activeOrderTableView}
                        </tbody>
                    </Table>
                </ScrollableTable>
            </OrderTab>
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
                <Orders orderHistory={props.orderHistory} appState={props.appState} dexContract={props.dexContract}/>
            </RowPanelBase>
        </ParentContainer>
        </GrandParentContainer>
    )
}
