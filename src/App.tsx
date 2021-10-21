import './App.css'
import './components/AppHeader'

import React, {useState, useEffect, useCallback} from 'react'
import {HashRouter} from 'react-router-dom'

import styled from 'styled-components'

import 'bootswatch/dist/darkly/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/all'
import AppHeader from './components/AppHeader'
import TokenPicker from './components/TokenPicker'
import DexData from './components/DexData'
import AppStatusBar from './components/AppStatusBar'
import Web3 from 'web3'
import { defaultWeb3Network } from './config/config'
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
  pairedTokenSet: IToken[],
  blockNumber: number,
  baseToken: IToken | null,
  pairedToken: IToken | null,
}
const defaultAppState = {
  accounts: [],
  tokens: [],
  pairedTokenSet: [],
  blockNumber: 0,
  baseToken: null,
  pairedToken: null,
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

  /**
   * @dev Initialize Network
   * 
   * Side effect depends on: none (should run only once)
   *  
   * Cleanup: remove the subscription for network events
   * */ 
  useEffect(() => {

    /**
     * - Initialize network
     * - Subscribe for network events
     * - Set rpcProvider state
     */
    const initNetwork = async () => {
      // Connect to the primary network via WebSocket RPC provider
      const rpcProvider = new Web3(defaultWeb3Network.url)
      const netId = await rpcProvider.eth.net.getId()
      // Subscribe for newBlockHeaders events to track block updates
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
          setAppState((prevState) => ({...prevState, blockNumber: blockHeader.number}))
      })
      .on("error", console.error);
  
      setRpcProvider((prevState) => ({
        provider: rpcProvider, 
        netId: netId,
        blockHeadSubscription: subscription,
      }))

      return true
    }

    /**
     * @dev React component lifecycle alias
     * */
    const componentWillMount = async () => {
      const bRes = await initNetwork()
      console.log(bRes ? '[initNetwork] - Success' : '[initNetwork]: failure');
    }

    /**
     * @dev Call the lifecycle function
     * */
    componentWillMount()

    // useEffect cleanup:
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

  /**
   * @dev Initialize Smart Contract
   * 
   * Side effect depends on: rpcProvider state
   *  
   * Cleanup: remove the subscription for contract events
   * */ 
  useEffect(() => {

    /**
     * - Initialize smart contract
     * - Subscribe for smart contract events
     * - Set dexContract state
     */
    const initContract = async () => {
      // Do nothing if the rpcProvider is not initialized
      if (!rpcProvider) {
        return false
      }

      // Read contract build JSON
      const dexBuildObject = require('./artifacts/Dex.json')
      
      // Check if the contract was deployed to the given network
      if (!dexBuildObject.networks.hasOwnProperty(rpcProvider.netId)) {
        console.error('Contract hasn\'t been deployed to the given network')
        return false
      }

      // Initialize Dex contract from address and abi
      const address = dexBuildObject.networks[rpcProvider.netId].address
      const abi = dexBuildObject.abi;
      const dexContract = await new rpcProvider.provider.eth.Contract(abi, address)
      
      /**
       * @TODO
       * subscribe for Dex events: OrderCreated, OrderFilled, OrderRemoved
       * 
       * ^ this needs to be done when the wallet is connected 
       * 
       * Use tx hash:
       * const txHash = dexBuildObject.networks[rpcProvider.netId].transactionHash
       */
      setDexContract(() => dexContract)

      return true
    }

    /**
     * @dev React component lifecycle alias
     * */
    const componentWillMount = async () => {
      const bRes = await initContract()
      console.log(bRes ? '[initContract] - Success' : '[initContract]: failure');
    }

    /**
     * @dev Call the lifecycle function
     * */
    componentWillMount()

    // useEffect cleanup:
    // return the cleanup here

  }, [rpcProvider])

  /**
   * @dev Initialize App State
   * 
   * Side effect depends on: dexContract state
   *  
   * Cleanup: n/a
   * */ 
  useEffect (() => {

    /**
     * - Initialize smart contract
     * - Subscribe for smart contract events
     * - Set dexContract and appState states
     */
    const initApp = async () => {

      // Aux function to get tokens from the contract 
      const getTokens = async (contract: Contract) => {
        const ethTicker = '0x4554480000000000000000000000000000000000000000000000000000000000'
        const tokens = await contract.methods.getTokenList().call()
        return [ethTicker].concat([...tokens].sort().filter((i,p,a) => {return !p || i !== a[p - 1]}))
      }
      
      // Check if any of the required states aren't ready yet
      if (!dexContract || !rpcProvider) {
        return false
      }

      // Get current block number
      const currentBlock = await rpcProvider.provider.eth.getBlockNumber()

      // Get token list from the contract
      const tokens = await getTokens(dexContract)
      const tokensWithSymbols = tokens.map((t) => ({ticker:t, symbol:Web3.utils.toAscii(t)}))

      setAppState((prevState) => ({
        ...prevState,
        blockNumber: currentBlock,
        tokens: tokensWithSymbols,
        baseToken: tokensWithSymbols[0]
      }))

      return true
    }

    /**
     * @dev React component lifecycle alias
     * */
    const componentWillMount = async () => {
      const bRes = await initApp()
      console.log(bRes ? '[initApp] - Success' : '[initApp]: failure');
    }

    /**
     * @dev Call the lifecycle function
     * */
    componentWillMount()

    // useEffect cleanup:
    // return the cleanup callback

  }, [dexContract, rpcProvider])

  /**
   * @dev Update Dex
   * 
   * Side effect depends on: baseToken
   *  
   * Cleanup: n/a
   * */ 
  useEffect (() => {

    const getPairedTokens = async () => {

      if (!appState.baseToken || !dexContract) {
          return false
      }

      const pairPromises = appState.tokens
      .filter((item,pos,arr) => (item.ticker !== appState.baseToken.ticker))
      .map(async (token) => {
          
          return ({
              ...token,
              isValid: await dexContract.methods.pairs(appState.baseToken.ticker, token.ticker).call()
          })
      })
      await Promise.all(pairPromises)
      .then((pairs) => {
          const pairedTokenSet = pairs.filter((item,pos,arr) => (item.isValid === true)).map((token) => ({ticker: token.ticker, symbol: token.symbol}))
          const pairedToken = pairedTokenSet.length > 0 ? pairedTokenSet[0] : null
          setAppState((prevState) => {
            return {
              ...prevState,
              pairedTokenSet: pairedTokenSet,
              pairedToken: pairedToken
            }
          })
      })
      
      return true
  }
    
    /**
     * @dev React component lifecycle alias
     * */
    const componentWillMount = async () => {
      const bRes = await getPairedTokens()
      console.log(bRes ? '[getPairedTokens] - Success' : '[getPairedTokens]: failure');
    }

    /**
     * @dev Call the lifecycle function
     * */
    componentWillMount()

    //useEffect cleanup:
    // return the cleanup callback

  }, [appState.baseToken])

  const handleBaseTokenChange = (newBaseToken) => {
    setAppState((prevState) => {
      return {
        ...prevState,
        baseToken: newBaseToken
      }
    })
  }

  const handlePairedTokenChange = (newPairedToken) => {
    setAppState((prevState) => {
      return {
        ...prevState,
        pairedToken: newPairedToken
      }
    })
  }

  // React Render
  return (
    <HashRouter>
    <div className="App">
      <PAGE>
        <AppHeader title='DEX' appState={appState}/>
        <TokenPicker 
        appState={appState} 
        dexContract={dexContract} 
        handleBaseTokenChange={handleBaseTokenChange}
        handlePairedTokenChange={handlePairedTokenChange}/>
        <DexData appState={appState} dexContract={dexContract}/>
        <AppStatusBar rpcProvider={rpcProvider} appState={appState}/>
      </PAGE>
    </div>
    </HashRouter>
  )
}

export default App;
