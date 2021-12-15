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
import DexDataPanel from './components/DexDataPanel'
import AppStatusBar from './components/AppStatusBar'
import TokenList from './components/TokenList'
import Welcome from './components/Welcome'
import { OrderModal } from './components/Modals'
// Config
import { defaultWeb3Network } from './config/config'
// Web3 imports
import Web3 from 'web3'
import { Subscription } from 'web3-core-subscriptions'
import { BlockHeader } from 'web3-eth'
import { Contract } from 'web3-eth-contract'
// Constants
import { START_BLOCK } from './utils/constants'

const ERC20_ABI = require('../src/artifacts/ERC20.json').abi

declare const window: any;

// Default app state
export interface IToken {
  address: string,
  ticker: string,
  symbol: string,
  decimals: number
}
export interface IAppState {
  tokens: IToken[],
  pairedTokenSet: IToken[],
  blockNumber: number,
  baseToken: IToken | any,
  pairedToken: IToken | any,
  tradeEnabled: boolean
}
const defaultAppState = {
  tokens: [],
  pairedTokenSet: [],
  blockNumber: 0,
  baseToken: null,
  pairedToken: null,
  tradeEnabled: false
}

export interface IMetamask {
  provider: object | null,
  chainId: number | null,
  currentAccount: string | null,
  balance: string
}

const defaultMetamaskState = {
  provider: null,
  chainId: null,
  currentAccount: null,
  balance: '0'
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

// IOrderbookItem
export interface IOrderBookItem {
  id: number,
  price: number,
  amount: number
}

// IOrderbook
export interface IOrderBook {
  buy: IOrderBookItem[],
  sell: IOrderBookItem[]
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
  const [orderModalShow, setOrderModalShow] = useState(false)
  const [orderBook, setOrderBook] = useState<IOrderBook>({buy: [], sell: []})
  const [orderHistory, setOrderHistory] = useState<any>(null)

  const connectMetamask = useCallback( async (isInitialConnect: boolean) => {

    const ethereum = window.ethereum

    // Check if Metamask is not installed
    if (typeof ethereum === 'undefined') {
      setMetamask(() => (defaultMetamaskState))
      return false
    }
    
    const makeNewState = async (_isInitialConnect : boolean) => {
      
      // Initialize metamask rpc provider
      const metamaskRpcProvider = new Web3(ethereum)
      const chainId = _isInitialConnect || !ethereum.isConnected() ? await ethereum.request({ method: 'eth_chainId' }) : ethereum.chainId
      const accounts = _isInitialConnect || !ethereum.isConnected() ? await ethereum.request({ method: 'eth_requestAccounts' }) : [ethereum.selectedAddress]
      const currentAccount = accounts.length === 0 ? null : accounts[0]
      const balance = currentAccount === null ? '0' : await metamaskRpcProvider.eth.getBalance(currentAccount)
      setMetamask(() : IMetamask => {
        return {
          provider: ethereum,
          chainId: chainId,
          currentAccount: currentAccount,
          balance: balance
        }
      })
      setAppState((prevState) => {
        return {
          ...prevState,
          // eslint-disable-next-line eqeqeq
          tradeEnabled: chainId == defaultWeb3Network.chainId && currentAccount !== null
        }
      })
    }

    // Note that this event is emitted on page load.
    // If the array of accounts is non-empty, you're already
    // connected.
    ethereum.on('accountsChanged', (newAccounts: string[]) => {
      makeNewState(false)
    });

    // Subscribe for events only when the application loads for the first time
    ethereum.on('chainChanged', (newChainId: number) => {
      //makeNewState(false)
      window.location.reload()
    })

    makeNewState(isInitialConnect)

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

  const updateOrderBook = useCallback(() => {

    if(!appState.pairedToken || !dexContract) {
      setOrderBook(() => ({buy: [], sell: []}))
      return
    }

    const BUY = 0
    const SELL = 1

    dexContract.methods.getOrderBook(BUY, appState.baseToken.ticker, appState.pairedToken.ticker).call()
    .then(orderbook => {
      setOrderBook((prevOrderBook) => {
        console.log("Update BUY orderbook");
        return {
          ...prevOrderBook,
          buy: orderbook.map(({id, price, amount, filled}) => ({id: id, price: price, amount: amount - filled}))
        }
      })
    })
    .catch(err => {
        console.error(err);
    })

    dexContract.methods.getOrderBook(SELL, appState.baseToken.ticker, appState.pairedToken.ticker).call()
    .then(orderbook => {
      setOrderBook((prevOrderBook) => {
        console.log("Update SELL orderbook");
        return {
          ...prevOrderBook,
          sell: orderbook.map(({id, price, amount, filled}) => ({id: id, price: price, amount: amount - filled}))
        }
      })
    })
    .catch(err => {
        console.error(err);
    })

  }, [dexContract, appState.pairedToken])

  const updateChartData = () => {

    if(!appState.baseToken) {
      return
    }

    console.log("Placeholder for fetching chart data");

  }

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
      const chainId = netId === defaultWeb3Network.netId ? defaultWeb3Network.chainId : await rpcProvider.eth.getChainId()

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
        console.error('Contract hasn\'t been deployed on the given network')
        return false
      }

      // Initialize Dex contract from address and abi
      const address = dexBuildObject.networks[rpcProvider.netId].address
      const abi = dexBuildObject.abi;
      const dexContract = new rpcProvider.provider.eth.Contract(abi, address)
      
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
        //debugger
        const tokens = await contract.methods.getTokenList().call()
        //debugger
        return [...tokens]
          .sort((a,b) => (a.ticker > b.ticker ? 1 : -1))
          .filter((i,p,a) => {return !p || i.ticker !== a[p - 1].ticker})
          .map((token) => ({address: token.tokenAddress, ticker: token.ticker, decimals: token.decimals, symbol:Web3.utils.toUtf8(token.ticker)}))
      }
      
      // Check if any of the required states aren't ready yet
      if (!dexContract || !rpcProvider) {
        return false
      }
      
      // Get current block number
      const currentBlock = await rpcProvider.provider.eth.getBlockNumber()

      // Get token list from the contract
      const tokens = await getTokens(dexContract)

      setAppState((prevState) => ({
        ...prevState,
        blockNumber: currentBlock,
        tokens: tokens,
        baseToken: tokens[0]
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
   * @dev Update Dex on baseToken change
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
          
        const pairedTokenSet = pairs.filter((item,pos,arr) => (item.isValid === true))
        .map((token) : IToken => ({address: token.address, ticker: token.ticker, symbol: token.symbol, decimals: token.decimals}))

        const pairedToken = pairedTokenSet.length > 0 ? pairedTokenSet[0] : null
        setAppState((prevState) : IAppState => {
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

  /**
   * @dev Update Dex on when pairedToken changes
   * 
   * Side effect depends on: updateOrderBook and updateChartData callbacks
   *  
   * Cleanup: n/a
   * */ 
  useEffect (() => {

    /**
     * @dev React component lifecycle alias
     * */
    const componentWillMount = async () => {
      updateOrderBook()
      updateChartData()
    }

    /**
     * @dev Call the lifecycle function
     * */
     componentWillMount()

     //useEffect cleanup:
     //return clean up callback

  }, [dexContract, appState.pairedToken, appState.baseToken, appState.blockNumber])

  /**
   * @dev Update Dex on pairedToken and currentAccount change
   * 
   * Side effect depends on: pairedToken and currentAccount
   *  
   * Cleanup: unsubscribe from DEX events for the particular account
   * */ 
  useEffect (() => {

    if(!dexContract || !metamask.currentAccount) {
      return
    }

    const subscriptions = {
      OrderCreated: null,
      OrderFilled: null,
      OrderRemoved: null
    }
    
    const unsubscribe = () => {
      for (let eventName in subscriptions) {
        if (subscriptions[eventName]) {
          subscriptions[eventName].unsubscribe()
          console.log(`Unsubscribed from DEX ${eventName} events for trader ${metamask.currentAccount}`);
        }
      }
    }

    const subscribe = () => {
      subscriptions.OrderCreated = dexContract.events.OrderCreated({
        filter: {trader: metamask.currentAccount ? metamask.currentAccount : ''},
        fromBlock: "latest"
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
          console.log(`Subscribed for OrderCreated events for ${metamask.currentAccount}. SubscriptionId: ${subscriptionId}`);
      })
      .on('data', ({returnValues}) => {
        setOrderHistory((prevOrderHistory) => {
          const newOrderHistory = {...prevOrderHistory} 
          const {id, orderType, side, amount, price, tickerFrom, tickerTo, trader} = returnValues
          newOrderHistory[id] = {
            id:id,
            orderType:orderType,
            side:side,
            amount:amount,
            price:price,
            tickerFrom:tickerFrom,
            tickerTo:tickerTo,
            trader:trader,
            filled:0,
            complete:false
          }
          
          return newOrderHistory
        })
      })
      .on('changed', (event) => {
          // remove event from local database
      })
      .on('error', (error, receipt) => { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error(error)
      })

      subscriptions.OrderFilled = dexContract.events.OrderFilled({
        filter: {trader: metamask.currentAccount ? metamask.currentAccount : ''},
        fromBlock: "latest"
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
          console.log(`Subscribed for OrderFilled events for ${metamask.currentAccount}. SubscriptionId: ${subscriptionId}`);
      })
      .on('data', ({returnValues}) => {
        setOrderHistory((prevOrderHistory) => {
          const newOrderHistory = {...prevOrderHistory} 
          const {id, trader, price, filled} = returnValues
          newOrderHistory[id].filled = Web3.utils.toBN(newOrderHistory[id].filled).lt(Web3.utils.toBN(filled)) ? filled : newOrderHistory[id].filled
          return newOrderHistory
        })
    })
      .on('changed', (event) => {
          // remove event from local database
      })
      .on('error', (error, receipt) => { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error(error)
      })

      subscriptions.OrderRemoved = dexContract.events.OrderRemoved({
        filter: {trader: metamask.currentAccount ? metamask.currentAccount : ''},
        fromBlock: "latest"
      }, function(error, event){ console.log(event); })
      .on("connected", function(subscriptionId){
          console.log(`Subscribed for OrderFilled events for ${metamask.currentAccount}. SubscriptionId: ${subscriptionId}`);
      })
      .on('data', ({returnValues}) => {
          setOrderHistory((prevOrderHistory) => {
            const newOrderHistory = {...prevOrderHistory} 
            const {id, trader, filled} = returnValues
            newOrderHistory[id].complete = true
            return newOrderHistory
          })

          /**
           * TODO: withdraw funds to the wallet owned by `metamask.currentAccount`
           * 
           * Buy order: withdraw the amount filled
           * Sell order: withdraw the amount filled * price / pairedToken.decimals
           * 
           * 
           */
      })
      .on('changed', (event) => {
          // remove event from local database
      })
      .on('error', (error, receipt) => { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          console.error(error)
      })
    }

    const processPastEvents = async () => {
      
      const evtOrderCreated = await dexContract.getPastEvents('OrderCreated', {
        filter: {trader: metamask.currentAccount ? metamask.currentAccount : ''},
        fromBlock: START_BLOCK,
        toBlock: 'latest'
      })

      const evtOrderFilled = await dexContract.getPastEvents('OrderFilled', {
        filter: {trader: metamask.currentAccount ? metamask.currentAccount : ''},
        fromBlock: START_BLOCK,
        toBlock: 'latest'
      })

      const evtOrderRemoved = await dexContract.getPastEvents('OrderRemoved', {
        filter: {trader: metamask.currentAccount ? metamask.currentAccount : ''},
        fromBlock: START_BLOCK,
        toBlock: 'latest'
      })

      let orderHashTable = evtOrderCreated
      .map(({returnValues}) => returnValues)
      .reduce((obj, item) =>  (obj[item['id']] = {
        id: item.id, 
        orderType: item.orderType, 
        side: item.side, 
        amount: item.amount, 
        price: item.price, 
        tickerFrom: item.tickerFrom, 
        tickerTo: item.tickerTo, 
        trader: item.trader,
        filled: 0,
        complete: false
      }, obj), {})
      
      evtOrderFilled.forEach(({returnValues}) => {
        const {id, trader, price, filled} = returnValues
        orderHashTable[id].filled = Web3.utils.toBN(orderHashTable[id].filled).lt(Web3.utils.toBN(filled)) ? filled : orderHashTable[id].filled
      })

      evtOrderRemoved.forEach(({returnValues}) => {
        const {id, trader, filled} = returnValues
        orderHashTable[id].complete = true
      })

      setOrderHistory(() => orderHashTable)
    }

    /**
     * @dev React component lifecycle alias
     * */
    const componentWillMount = async () => {
      
      processPastEvents()
      subscribe()
    }

    /**
     * @dev Call the lifecycle function
     * */
     componentWillMount()

     //useEffect cleanup:
     return unsubscribe

  }, [metamask.currentAccount, dexContract])


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
            <AppHeader title='ERC20 DEX' appState={appState} pageId={0} rpcProvider={rpcProvider} metamask={metamask} connectMetamask={connectMetamask}/>
            <Welcome />
            <AppStatusBar rpcProvider={rpcProvider} appState={appState} hidden={true}/>
          </PageContainer>
        </Background>
      </Route>
      <Route exact path='/trade'>
        <Background>
          <PageContainer>
            <AppHeader title='ERC20 DEX' appState={appState} pageId={1} rpcProvider={rpcProvider} metamask={metamask} connectMetamask={connectMetamask}/>
            <TokenPicker 
              appState={appState} 
              dexContract={dexContract} 
              handleBaseTokenChange={handleBaseTokenChange}
              handlePairedTokenChange={handlePairedTokenChange}
              showOrderModal={() => setOrderModalShow(true)}
            />
            <OrderModal 
              show={orderModalShow} 
              onHide={() => setOrderModalShow(false)} 
              metamask={metamask} 
              appstate={appState}
              dexcontract={dexContract}
            />
            <DexDataPanel orderBook={orderBook} orderHistory={orderHistory} appState={appState} dexContract={dexContract} metamask={metamask}/>
            <AppStatusBar rpcProvider={rpcProvider} appState={appState} hidden={false}/>
          </PageContainer>
        </Background>
      </Route>
      <Route exact path='/tokens'>
        <Background>
          <PageContainer>
            <AppHeader title='DEX' appState={appState} pageId={2} rpcProvider={rpcProvider} metamask={metamask} connectMetamask={connectMetamask}/>
              <TokenList appState={appState} rpcProvider={rpcProvider} metamask={metamask} dexContract={dexContract}/>
            <AppStatusBar rpcProvider={rpcProvider} appState={appState} hidden={false}/>
          </PageContainer>
        </Background>
      </Route>
    </Router>
  )
}

export default App;

