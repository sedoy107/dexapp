// React tools
import React, {useState, useEffect, useCallback} from 'react'
import {HashRouter as Router, Route, Redirect} from 'react-router-dom'
// Styling libraries
import styled from 'styled-components'
import 'bootswatch/dist/darkly/bootstrap.min.css'
import '@fortawesome/fontawesome-free/js/all'
// App components
import AppHeader from './components/AppHeader'
import TokenPicker from './components/TokenPicker'
import SwapPanel from './components/SwapPanel'
import AppStatusBar from './components/AppStatusBar'
import Welcome from './components/Welcome'
import SwapModal from './components/SwapModal'
// Config
import { defaultWeb3Network } from './config/config'
// Web3 imports
import Web3 from 'web3'
import { Subscription } from 'web3-core-subscriptions'
import { BlockHeader } from 'web3-eth'
import { Contract } from 'web3-eth-contract'

declare const window: any;

// Default app state
export interface IToken {
  address: string,
  ticker: string,
  symbol: string,
}
export interface IAppState {
  tokens: IToken[],
  pairedTokenSet: IToken[],
  blockNumber: number,
  baseToken: IToken | any,
  pairedToken: IToken | any,
}
const defaultAppState = {
  tokens: [],
  pairedTokenSet: [],
  blockNumber: 0,
  baseToken: null,
  pairedToken: null,
}

export interface IMetamask {
  provider: object | null,
  chainId: number | null,
  currentAccount: string | null
}
const defaultMetamaskState = {
  provider: null,
  chainId: null,
  currentAccount: null
}

// IRpcProvider
export interface IRpcProvider {
  provider: Web3,
  netId: number,
  chainId: number,
  blockHeadSubscription: Subscription<BlockHeader>,
}

// IPage
export interface IPage {
  id: number,
  title: string
}

// Styles
const PageContainer = styled.div`
  margin: 0px 10px 0px 10px;
`

const Background = styled.div`
  text-align: center;
  height: 100vh;
  background-image:radial-gradient(circle at top,
  #004b77 0%, #222 100%);
`

function App() {
  // States
  const [rpcProvider, setRpcProvider] = useState<IRpcProvider | null>(null)
  const [metamask, setMetamask] = useState<IMetamask>(defaultMetamaskState)
  const [dexContract, setDexContract] = useState<Contract | null>(null)
  const [appState, setAppState] = useState<IAppState>(defaultAppState)
  // Swap Modal state
  const [swapModalShow, setSwapModalShow] = useState(false);

  const connectMetamask = useCallback( async (isInitialConnect: boolean) => {

    const ethereum = window.ethereum

    // Check if Metamask is not installed
    if (typeof ethereum === 'undefined') {
      setMetamask(() => (defaultMetamaskState))
      return false
    }

    const makeNewState = async () => {
      const chainId = isInitialConnect || !ethereum.isConnected() ? await ethereum.request({ method: 'eth_chainId' }) : ethereum.chainId
      const accounts = isInitialConnect|| !ethereum.isConnected() ? await ethereum.request({ method: 'eth_requestAccounts' }) : [ethereum.selectedAddress]
      const currentAccount = accounts.length === 0 ? null : accounts[0]
      setMetamask(() => {
        return {
          provider: ethereum,
          chainId: chainId,
          currentAccount: currentAccount
        }
      })
    }

    // Note that this event is emitted on page load.
    // If the array of accounts is non-empty, you're already
    // connected.
    ethereum.on('accountsChanged', (newAccounts: string[]) => {
      setMetamask((prevMetamask: IMetamask) => {
        return {
          ...prevMetamask,
          currentAccount: newAccounts.length === 0 ? null : newAccounts[0]
        }
      })
    });

    // Subscribe for events only when the application loads for the first time
    ethereum.on('chainChanged', (newChainId: number) => {
      setMetamask((prevMetamask: IMetamask) => {
        return {
          ...prevMetamask,
          chainId: newChainId
        }
      })
    })

    // ethereum.on('disconnect', () => {
    //   console.log("On Disconnect");
    //   setMetamask(() => defaultMetamaskState)
    // })

    // ethereum.on('connect', () => {
    //   console.log("On Connect");
    //   makeNewState()
    // })

    makeNewState()

    return true
  }, [])

  /**
   * @dev Initialize Metamask on page load
   * 
   * Side effect depends on: window.ethereum
   *  
   * Cleanup: ?
   * */ 
  useEffect(() => {
    /**
     * @dev React component lifecycle alias
     * */
     const componentWillMount = async () => {
      const bRes = await connectMetamask(false)
      console.log(bRes ? '[connectMetamask] - Success' : '[connectMetamask]: failure');
    }

    /**
     * @dev Call the lifecycle function
     * */
    componentWillMount()
  }, [connectMetamask])


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
      const chainId = await rpcProvider.eth.getChainId()

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
        chainId: chainId,
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
        const ethToken = {
          address: '0x0000000000000000000000000000000000000000',
          ticker: '0x4554480000000000000000000000000000000000000000000000000000000000'
        }
        const tokens = await contract.methods.getTokenList().call()
        return [ethToken].concat([...tokens]
          .sort((a,b) => (a.ticker > b.ticker ? 1 : -1))
          .filter((i,p,a) => {return !p || i.ticker !== a[p - 1].ticker})
          .map((token) => ({address: token.tokenAddress, ticker: token.ticker})))
      }
      
      // Check if any of the required states aren't ready yet
      if (!dexContract || !rpcProvider) {
        return false
      }

      // Get current block number
      const currentBlock = await rpcProvider.provider.eth.getBlockNumber()

      // Get token list from the contract
      const tokens = await getTokens(dexContract)
      const tokensWithSymbols = tokens.map((t) => ({address: t.address, ticker:t.ticker, symbol:Web3.utils.toAscii(t.ticker)}))

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Router>
      <Route exact path="/">
        <Redirect to="/welcome" />
      </Route>
      <Route exact path='/welcome'>
        <Background>
          <PageContainer>
            <AppHeader title='DEX' appState={appState} pageId={0} rpcProvider={rpcProvider} metamask={metamask} connectMetamask={connectMetamask}/>
            <Welcome />
            <AppStatusBar rpcProvider={rpcProvider} appState={appState} hidden={true}/>
          </PageContainer>
        </Background>
      </Route>
      <Route exact path='/swaps'>
        <Background>
          <PageContainer>
            <AppHeader title='DEX' appState={appState} pageId={1} rpcProvider={rpcProvider} metamask={metamask} connectMetamask={connectMetamask}/>
            <TokenPicker 
            appState={appState} 
            dexContract={dexContract} 
            handleBaseTokenChange={handleBaseTokenChange}
            handlePairedTokenChange={handlePairedTokenChange}
            showSwapModal={() => setSwapModalShow(true)}/>
            <SwapModal show={swapModalShow} onHide={() => setSwapModalShow(false)}></SwapModal>
            <SwapPanel appState={appState} dexContract={dexContract}/>
            <AppStatusBar rpcProvider={rpcProvider} appState={appState} hidden={false}/>
          </PageContainer>
        </Background>
      </Route>
      <Route exact path='/feed'>
        <Background>
          <PageContainer>
            <AppHeader title='DEX' appState={appState} pageId={2} rpcProvider={rpcProvider} metamask={metamask} connectMetamask={connectMetamask}/>
            
            <AppStatusBar rpcProvider={rpcProvider} appState={appState} hidden={false}/>
          </PageContainer>
        </Background>
      </Route>
    </Router>
  )
}

export default App;

