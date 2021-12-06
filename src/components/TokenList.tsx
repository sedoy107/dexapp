import styled from 'styled-components'
import { useState, useEffect, useCallback } from 'react'
import { Table, Spinner, Button } from 'react-bootstrap'
import { ORDER_SIDE, ORDER_TYPE } from '../utils/enums'
import { formatPrice2, formatPrice, formatPriceUI } from '../utils/utils'
import { FundsModal } from './Modals'
import React from 'react'
import Web3 from 'web3'

const ERC20_ABI = require('../../src/artifacts/ERC20.json').abi
const DEX_ABI = require('../../src/artifacts/Dex.json').abi


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
const Panel = styled.div`
    background:rgba(0, 0, 0,0.6);
    height: 84.5vh;
    border-radius: 10px;
    text-align: left;
    font-size: .75rem;
    padding: 10px 0px 10px 0px;
`

const ScrollableTable = styled.div`
    width: 100%;
    overflow-y: scroll;
    height: 100%;
`

const rowStyle = {
    padding: '0 .5rem',
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const
}
const headerStyle = {
    padding: '0 .5rem',
    textAlign: 'center' as const
}
export default function TokenList(props) {

    const WITHDRAW = 0
    const DEPOSIT = 1

    const title = 'Tokens'
    const [tokens, setTokens] = useState<any>([])
    const [showModal, setShowModal] = useState(false)
    const [modalParams, setModalParams] = useState<any>({
        symbol: 'Dummy', 
        amount: '0', 
        decimals: '1',
        ticker: '',
        balance: {dex: '0', wallet: '0'},
        action: 0
    })

    /**
     * get tokens here. Kicks in on blockNumber, dexContract and metamask state changes
     */
     const getWalletBalance = useCallback(async (token) => {
      
        const web3Client = new Web3(props.metamask.provider);
        let balance = await web3Client.eth.getBalance(props.metamask.currentAccount)
        
        // Get base token balance
        if (token.address !== "0x0000000000000000000000000000000000000000" ) {
          const baseTokenContract = new web3Client.eth.Contract(ERC20_ABI, token.address)
          balance = await baseTokenContract.methods.balanceOf(props.metamask.currentAccount).call()
        }
        
        return balance
    }, [props.metamask.currentAccount, props.metamask.provider])

    const getDexBalance = useCallback(async (token) => {
        return await props.dexContract.methods.balances(props.metamask.currentAccount, token.ticker).call({from: props.metamask.currentAccount})
    }, [props.metamask.currentAccount, props.dexContract])
    
    const updateBalances = useCallback(() => {

        const tokenListPromise = props.appState.tokens.map(async (token) => {
            return {
                ...token,
                balance: {
                    dex: await getDexBalance(token),
                    wallet: await getWalletBalance(token)
                }
            }
        })

        Promise.all(tokenListPromise)
        .then((tokenList) => setTokens(() => tokenList))

    }, [props.appState.blockNumber, props.appState.tokens, props.dexContract, props.metamask.currentAccount, props.rpcProvider, getWalletBalance, getDexBalance])

    useEffect(() => {
        
        if (!props.dexContract || !props.metamask.currentAccount || !props.rpcProvider || !props.metamask.provider) {
            return
        }
        
        updateBalances()

    }, [updateBalances, getWalletBalance, getDexBalance])

    const handleDeposit = async (token) => {
        setModalParams(() => ({...token, action: DEPOSIT}))
        setShowModal(() => true)
    }
    const handleWithdrawal = async (token) => {
        setModalParams(() => ({...token, action: WITHDRAW}))
        setShowModal(() => true)
    }
    const handleConfirmed = async (params) => {
        
        const web3Client = new Web3(props.metamask.provider);
        const dex = new web3Client.eth.Contract(DEX_ABI, props.dexContract._address)
        
        if (params.address === "0x0000000000000000000000000000000000000000") {
            params.action === DEPOSIT
            ? await dex.methods['deposit()']().send({from: props.metamask.currentAccount, value: params.amount })
            : await dex.methods['withdraw(uint256)'](params.amount).send({from: props.metamask.currentAccount })
        }
        else {
            if (params.action === DEPOSIT) {
                const erc20 = new web3Client.eth.Contract(ERC20_ABI, params.address)
                await erc20.methods.approve(props.dexContract._address, params.amount).send({from: props.metamask.currentAccount})
                await dex.methods['deposit(uint256,bytes32)'](params.amount, params.ticker).send({from: props.metamask.currentAccount})
            }
            else {
                await dex.methods['withdraw(uint256,bytes32)'](params.amount, params.ticker).send({from: props.metamask.currentAccount})
            }
        }
        updateBalances()
    }
    const rows = tokens.map((token) => {
        const {symbol, ticker, address, decimals, balance} = token
        return (<tr key={ticker}>
            <td style={rowStyle}>{symbol}</td>
            <td style={rowStyle}>{address}</td>
            <td style={rowStyle}>{formatPriceUI(balance.dex, decimals)}</td>
            <td style={rowStyle}>{formatPriceUI(balance.wallet, decimals)}</td>
            <td style={rowStyle}>{decimals}</td>
            <td style={rowStyle}>
                <Button variant='info' onClick={() => handleDeposit(token)}><i className="fas fa-plus"/></Button>
                <Button variant='danger' onClick={() => handleWithdrawal(token)}><i className="fas fa-minus"/></Button>
            </td>
        </tr>
    )})

    return (
        <GrandParentContainer>
        <ParentContainer>
            <Panel>
                <FundsModal 
                    show={showModal} 
                    handleShow={() => setShowModal(true)} 
                    handleClose={() => setShowModal(false)} 
                    params={modalParams}
                    handleConfirmed={handleConfirmed}
                />
                <ScrollableTable>
                    <Table striped hover borderless>
                    <thead>
                        <tr>
                            <th style={headerStyle}>Symbol</th>
                            <th style={headerStyle}>Address</th>
                            <th style={headerStyle}>Dex Balance</th>
                            <th style={headerStyle}>Wallet Balance</th>
                            <th style={headerStyle}>Decimals</th>
                            <th style={headerStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </Table>
                    </ScrollableTable>
            </Panel>
        </ParentContainer>
        </GrandParentContainer>
    )
}
