import styled from 'styled-components'
import { useState, useEffect, useCallback } from 'react'
import { Table, Spinner, Button } from 'react-bootstrap'
import { ORDER_SIDE, ORDER_TYPE } from '../utils/enums'
import { formatPrice2, formatPrice, formatPriceUI } from '../utils/utils'
import { FundsModal, TokenErrorModal } from './Modals'
import React from 'react'
import Web3 from 'web3'
import { WITHDRAW, DEPOSIT, MINT, BURN } from '../utils/constants'


const ERC20_ABI = require('../../src/artifacts/TestToken.json').abi
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
const ActionButton = styled(Button)`
    border-radius: 0;
    background-color: rgba(0,0,0,0.0);
    border: none;
`
const DepositButton = styled(ActionButton)`
    color: #00abff;
`
const WithdrawButton = styled(ActionButton)`
    color: #f00;
`
const MintButton = styled(ActionButton)`
    color: #00ff21;
`
const BurnButton = styled(ActionButton)`
    color: orange;
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
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorText, setErrorText] = useState('') 

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
        
        if (props.metamask.provider.chainId != props.rpcProvider.chainId) {
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
    const handleMint = async (token) => {
        if (token.address === '0x0000000000000000000000000000000000000000') {
            setErrorText(() => `Can't mint native coin ${token.symbol}. Please use official faucet`)
            setShowErrorModal(() => true)
            return
        }
        setModalParams(() => ({...token, action: MINT}))
        setShowModal(() => true)
    }
    const handleBurn = async (token) => {
        if (token.address === '0x0000000000000000000000000000000000000000') {
            setErrorText(() => `Token ${token.symbol} can't be burned`)
            setShowErrorModal(() => true)
            return
        }
        setModalParams(() => ({...token, action: BURN}))
        setShowModal(() => true)
    }
    const handleConfirmed = async (params) => {
        
        const web3Client = new Web3(props.metamask.provider)
        const dex = new web3Client.eth.Contract(DEX_ABI, props.dexContract._address)
        const erc20 = new web3Client.eth.Contract(ERC20_ABI, params.address)
        
        if (params.address === "0x0000000000000000000000000000000000000000") {
            switch (params.action) {
                case DEPOSIT:
                    await dex.methods['deposit()']().send({from: props.metamask.currentAccount, value: params.amount })
                    break
                case WITHDRAW:
                    await dex.methods['withdraw(uint256)'](params.amount).send({from: props.metamask.currentAccount })
                    break
                case MINT:
                    break
                case BURN:
                    break
                default:
                    console.error("Wrong action paramter")
            } 
        }
        else {
            switch (params.action) {
                case DEPOSIT:
                    await erc20.methods.approve(props.dexContract._address, params.amount).send({from: props.metamask.currentAccount})
                    await dex.methods['deposit(uint256,bytes32)'](params.amount, params.ticker).send({from: props.metamask.currentAccount})
                    break
                case WITHDRAW:
                    await dex.methods['withdraw(uint256,bytes32)'](params.amount, params.ticker).send({from: props.metamask.currentAccount})
                    break
                case MINT:
                    try {
                        await erc20.methods.mint(props.metamask.currentAccount, params.amount).send({from: props.metamask.currentAccount})
                    } catch (e) {
                        setErrorText(() => `Token ${params.symbol} can't be minted. Use official ${params.symbol} faucet`)
                        setShowErrorModal(() => true)
                    }
                    break
                case BURN:
                    try {
                        await erc20.methods.burn(props.metamask.currentAccount, params.amount).send({from: props.metamask.currentAccount})
                    } catch (e) {
                        setErrorText(() => `Token ${params.symbol} can't be burned`)
                        setShowErrorModal(() => true)
                    }
                    break
                default:
                    console.error("Wrong action paramter")
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
                <DepositButton variant='primary' onClick={() => handleDeposit(token)}><i className="fas fa-arrow-left"/></DepositButton>
                <WithdrawButton variant='primary' onClick={() => handleWithdrawal(token)}><i className="fas fa-arrow-right"/></WithdrawButton>
                <MintButton variant='primary' onClick={() => handleMint(token)}><i className="fas fa-coins"/></MintButton>
                <BurnButton variant='primary' onClick={() => handleBurn(token)}><i className="fas fa-burn"/></BurnButton>
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
                <TokenErrorModal 
                    show={showErrorModal} 
                    handleShow={() => setShowErrorModal(true)} 
                    handleClose={() => setShowErrorModal(false)} 
                    text={errorText}
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
