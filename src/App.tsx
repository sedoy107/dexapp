import './App.css'
import './components/AppHeader'

import React, {useState, useEffect} from 'react'

import {HashRouter} from 'react-router-dom'

import styled from 'styled-components'

import 'bootswatch/dist/darkly/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/all'
import AppHeader from './components/AppHeader'
import TokenPicker from './components/TokenPicker'
import DexData from './components/DexData'
import AppStatusBar from './components/AppStatusBar'
import Web3 from 'web3'
import {web3Networks, defaultWeb3Network} from './config/config'
import { Subscription } from 'web3-core-subscriptions'
import { BlockHeader } from 'web3-eth'
import { Contract } from 'web3-eth-contract'

// Enums
const Pages = {
  HOME:'HOME',
  TRADE:'TRADE',
  CHARTS:'CHARTS',
  ORDER:'ORDERS'
}

// Default app state
export interface IToken {
  ticker: string,
  symbol: string,
}
export interface IAppState {
  accounts: string[],
  tokens: IToken[],
  blockNumber: number,
  currentToken: IToken | null,
}
const defaultAppState = {
  accounts: [],
  tokens: [],
  blockNumber: 0,
  currentToken: null,
}

// IRpcProvider
export interface IRpcProvider {
  provider: Web3,
  netId: number,
  blockHeadSubscription: Subscription<BlockHeader>,
}

// IMetamaskProvider
export interface IMetamaskProvider {
  provider: object,
  netId: number
}

// Styles
const PAGE = styled.div`
  margin: 0px 10px 0px 10px
`

function App() {
  // States
  const [rpcProvider, setRpcProvider] = useState<IRpcProvider | null>(null)
  const [metamaskProvider, setMetamaskProvider] = useState<IMetamaskProvider | null>(null)
  const [dexContract, setDexContract] = useState<Contract | null>(null)
  const [appState, setAppState] = useState<IAppState>(defaultAppState)

  // React component lifecycle aliases
  const componentWillMount = async () => {
    await loadNetworkProvider(defaultWeb3Network)
  }

  // useEffect hooks
  useEffect(() => {
    componentWillMount()
    console.log("Web3 init completed")
    return () => {
      if(rpcProvider) {
        rpcProvider.blockHeadSubscription.unsubscribe(function(error, success){
          if (success) {
              console.log('Successfully unsubscribed!');
          }
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadNetworkProvider = async (web3Network) => {
    // Connect to the primary network via WebSocket RPC provider
    const rpcProvider = new Web3(web3Network.url)
    const netId = await rpcProvider.eth.net.getId()
    const currentBlock = await rpcProvider.eth.getBlockNumber()
    // Subscribe for network events to track block header updates
    const subscription = rpcProvider.eth.subscribe('newBlockHeaders', (error, result) => {
      if (!error) {
        console.log("Subscribed: " + result);
        return;
      }
      console.error(error);
    })
    .on("connected", function(subscriptionId){
        console.log(subscriptionId);
    })
    .on("data", function(blockHeader){
        console.log(blockHeader);
        setAppState((prevState) => {
          return {
            ...prevState,
            blockNumber: blockHeader.number
          }
        })
    })
    .on("error", console.error);

    setRpcProvider((prevState) => ({
      provider: rpcProvider, 
      netId: netId,
      blockHeadSubscription: subscription,
    }))

    // Initialize Dex contract from address and abi
    const dex = require('./artifacts/Dex.json')
    if (!(netId in dex.networks)) {
      console.log('Dex contract is not found on the given network, netId: ' + netId);
    }
    const address = dex.networks[netId].address
    const txHash = dex.networks[netId].transactionHash
    const { blockNumber } = await rpcProvider.eth.getTransaction(txHash)
    const abi = dex.abi;
    const dexContract = await new rpcProvider.eth.Contract(abi, address)
    setDexContract(() => dexContract)
    /**
     * @TODO
     * subscribe for Dex events: OrderCreated, OrderFilled, OrderRemoved
     * 
     * ^ this needs to be done when the wallet is connected 
     */
    // Get token list from the contract
    const tokens = await getTokens(dexContract)
    const tokensWithSymbols = tokens.map((t) => ({ticker:t, symbol:Web3.utils.toAscii(t)}))
    
    setAppState(() => ({
      blockNumber: currentBlock,
      tokens: tokensWithSymbols,
      accounts: [],
      currentToken: tokensWithSymbols[0]
    }))

  }

  const getTokens = async (contract: Contract) => {
    const ethTicker = '0x4554480000000000000000000000000000000000000000000000000000000000'
    const tokens = await contract.methods.getTokenList().call()
    // Dedup the tokens
    return [ethTicker].concat([...tokens].sort().filter((i,p,a) => {return !p || i !== a[p - 1]}))
  }

  const handleTokenChange = (newCurrentToken) => {
    setAppState((prevState) => {
      return {
        ...prevState,
        currentToken: newCurrentToken
      }
    })
  }

  // React Render
  return (
    <HashRouter>
    <div className="App">
      <PAGE>
        <AppHeader title='DEX' appState={appState}/>
        <TokenPicker appState={appState} handleTokenChange={handleTokenChange}/>
        <DexData appState={appState} dexContract={dexContract}/>
        <AppStatusBar rpcProvider={rpcProvider} appState={appState}/>
      </PAGE>
    </div>
    </HashRouter>
  )
}

export default App;
