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

const PAGE = styled.div`
  margin: 0px 10px 0px 10px
`
const Pages = {
  HOME:'HOME',
  TRADE:'TRADE',
  CHARTS:'CHARTS',
  ORDER:'ORDERS'
}

function App() {

  /**
   * State brainstorm:
   * Pages: Trade, Charts, Order History
   * 
   */

  // const [page, setBalance] = useState(10000)
  // const [balanceHidden, setBalanceHidden] = useState(false)
  // const [coinData, setCoinData] = useState([])
/*
  const [network, setNetwork] = useState(null)
  const [contract, setContract] = useState(null)

  const componentWillMount = async () => {
    await loadBlockchainData()
  }

  const loadBlockchainData = async () => {
    const web3 = new Web3("http://127.0.0.1:7545")
    const accounts = await web3.eth.getAccounts()
    const netId = await web3.eth.net.getId()

    const dex = require('./artifacts/Dex.json')
    const abi = dex.abi;
    const address = dex.networks[netId].address

    const dexContract = await new web3.eth.Contract(abi, address)
    setNetwork((network) => ({accounts, netId}))
    setContract(contract => dexContract)
  }

  useEffect(() => {
    componentWillMount()
    console.log("Web3 init completed")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
*/
  return (
    <HashRouter>
    <div className="App">
      <PAGE>
        <AppHeader title='DEX'/>
        <TokenPicker />
        <DexData />
        <AppStatusBar />
      </PAGE>
    </div>
    </HashRouter>
  )
}

export default App;
