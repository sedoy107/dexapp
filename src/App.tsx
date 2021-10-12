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

// Enums
const Pages = {
  HOME:'HOME',
  TRADE:'TRADE',
  CHARTS:'CHARTS',
  ORDER:'ORDERS'
}

// Default app state
const defaultAppState = {
  page: Pages.HOME,
  networkId: -1,
  walletAddress: 0x0,
}

// Styles
const PAGE = styled.div`
  margin: 0px 10px 0px 10px
`

function App() {
  // States
  const [network, setNetwork] = useState({})
  const [contract, setContract] = useState({})
  const [appState, setAppState] = useState(defaultAppState)

  // React component lifecycle aliases
  const componentWillMount = async () => {
    await loadWeb3Network(defaultWeb3Network)
  }

  // useEffect hooks
  useEffect(() => {
    componentWillMount()
    console.log("Web3 init completed")
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
  const loadWeb3Network = async (web3Network) => {
    // connect to blockchain
    const web3 = new Web3(Web3.givenProvider || web3Network.url)
    const netId = await web3.eth.net.getId()
    setNetwork(network => web3)

    // import contract json
    const dex = require('./artifacts/Dex.json')
    try {
      // Get smart contract if it is deployed to a given network
      const address = dex.networks[netId].address
      const abi = dex.abi;
      const dexContract = await new web3.eth.Contract(abi, address)
      setContract(contract => dexContract)
      setAppState((appState) => ({
        netId,
        ...defaultAppState,
      }))
    } catch (error) {
        // The contract wasn't found on the given network. Setting default state
        if(error instanceof TypeError) {
          setContract(contract => {})
          setAppState(appState => defaultAppState)
        }
        else {
          throw error
        }
    }
    
  }

  // React Render
  return (
    <HashRouter>
    <div className="App">
      <PAGE>
        <AppHeader title='DEX' appState={appState}/>
        <TokenPicker appState={appState}/>
        <DexData appState={appState}/>
        <AppStatusBar appState={appState} network={network}/>
      </PAGE>
    </div>
    </HashRouter>
  )
}

export default App;
