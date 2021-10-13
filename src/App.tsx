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

// Enums
const Pages = {
  HOME:'HOME',
  TRADE:'TRADE',
  CHARTS:'CHARTS',
  ORDER:'ORDERS'
}

// Default app state
export interface IAppState {
  accounts: string[],
  blockNumber: number,
}
const defaultAppState = {
  accounts: [],
  blockNumber: 0
}

// IHttpProvider
export interface IHttpProvider {
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
  const [httpProvider, setHttpProvider] = useState<IHttpProvider | null>(null)
  const [metamaskProvider, setMetamaskProvider] = useState<IMetamaskProvider | null>(null)
  const [dexContract, setDexContract] = useState({})
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
      if(httpProvider) {
        httpProvider.blockHeadSubscription.unsubscribe(function(error, success){
          if (success) {
              console.log('Successfully unsubscribed!');
          }
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Initial load of Web3 provider and smart contract
   * 0. Pre-checks: supported networks [5777,42]
   * 1. Metamask is not connected: load default network and load Dex contract
   * 2. Metamask is connected: load supplied network and try to load Dex contract
   * 3. Metamask changing networks: load new network and try to load Dex contract
   * 4.
   */
  const loadNetworkProvider = async (web3Network) => {
    // Connect to the primary network via WebSocket RPC provider
    const httpProvider = new Web3(web3Network.url)
    const netId = await httpProvider.eth.net.getId()
    const currentBlock = await httpProvider.eth.getBlockNumber()
    setAppState(() => ({
      blockNumber: currentBlock,
      accounts: []
    }))
    // Subscribe for network events to track block header updates
    const subscription = httpProvider.eth.subscribe('newBlockHeaders', (error, result) => {
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

    setHttpProvider((prevState) => ({
      provider: httpProvider, 
      netId: netId,
      blockHeadSubscription: subscription,
    }))
    
    // Initialize dex contract from address and abi
    const dex = require('./artifacts/Dex.json')
    const address = dex.networks[netId].address
    const abi = dex.abi;
    const dexContract = await new httpProvider.eth.Contract(abi, address)
    setDexContract(() => dexContract)
  }

  // React Render
  return (
    <HashRouter>
    <div className="App">
      <PAGE>
        <AppHeader title='DEX' appState={appState}/>
        <TokenPicker appState={appState}/>
        <DexData appState={appState}/>
        <AppStatusBar httpProvider={httpProvider} appState={appState}/>
      </PAGE>
    </div>
    </HashRouter>
  )
}

export default App;
