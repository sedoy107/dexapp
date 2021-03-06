import Web3 from 'web3'

import logo from '../logo.svg'
import styled from 'styled-components'
import { Button, Spinner } from 'react-bootstrap'
import { useEffect, useState, useCallback } from 'react'
import { formatEthAmount } from '../utils/utils'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

declare const window: any;

const Img = styled.img`
  height: 4rem;
  pointer-events: none;
  
  @media (prefers-reduced-motion: no-preference) {
    animation: App-logo-spin infinite 20s linear;
  }
  
  @keyframes App-logo-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const Header = styled.header`
  min-height: 10vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`

const Logo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  color: white;
  width: 280px;
`

const PageButton = styled(Button)`
  width: 200px;
`

const JazzTitle = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const BalanceButtonBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: .25rem;
  font-weight: bold;
  color: #999;
  width: 280px;
`
const BalanceBlock = styled.div`
  width: 80px;
  display: flex:
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

function ConnectButton(props) {

  interface IConnectButtonState {
    title: any,
    variant: string
    pending: boolean
  }

  /**
   * @dev Compose new button state
   */
  const makeNewState = useCallback(() : IConnectButtonState => {
    if(!props.rpcProvider) {
      return {
        title: <Spinner animation="border" variant='secondary' size='sm' />,
        variant: 'warning',
        pending: false
      }
    }

    if(!props.metamask.provider) {
      return {
        title: 'Install Metamask',
        variant: 'warning',
        pending: false
      }
    }

    let title;
    let variant;
    
    // eslint-disable-next-line eqeqeq
    if (props.metamask.provider.chainId != props.rpcProvider.chainId) {
      // Wrong network
      title = 'Wrong Network'
      variant = 'danger'
    }
    else if (props.metamask.currentAccount) {
      // Connected
      title = <JazzTitle>
        {<Jazzicon diameter={24} seed={jsNumberForAddress(props.metamask.currentAccount)} />} 
        <label style={{ marginLeft : '5px' }}>{props.metamask.currentAccount.slice(0,6) + '...' + props.metamask.currentAccount.slice(-4)}</label>
        </JazzTitle>
      variant = 'primary'
    }
    else {
      // Connect Wallet
      title = 'Connect Wallet'
      variant = 'warning'
    }

    return {
      title: title,
      variant: variant,
      pending: false
    }
  }, [props.rpcProvider, props.metamask.provider, props.metamask.currentAccount])

  const [buttonState, setButtonState] = useState<IConnectButtonState>(() => {return makeNewState()})

  const handleButtonClick = () => {
    // Check if Metamask is not installed
    if (typeof window.ethereum !== 'undefined') {
      props.connectMetamask(true)
      if (!props.metamask.currentAccount) {
        setButtonState((prevState) => {
          return {
            ...prevState,
            title: <Spinner animation="border" variant='secondary' size='sm'/>,
            pending: true
          }
        })
      }
    } 
    else {
      window.open('https://metamask.io/', '_blank').focus();
    }
  }

  useEffect(() => {

    setButtonState(() => {return makeNewState()})
  
  },[makeNewState])
  
  return (
    <Button
      style={{ width: "200px", marginRight: '0px' }}
      variant={buttonState.variant} 
      hidden={props.pageId === 0}
      disabled={buttonState.pending}
      onClick={handleButtonClick}>
        {buttonState.title}
    </Button>
  )
}


export default function AppHeader(props) {

  const hrefOptions = {
    0: {title: 'Click to Start', href: '#/trade'},
    1: {title: 'Token List', href: '#/tokens'},
    2: {title: 'Trade Tokens', href: '#/trade'}
  }

  const handlePageButtonClick = (e, href) => {
    document.location.href = href;
  }

  const [balance, setBalance] = useState(parseFloat(props.metamask.balance) / (10 ** 18))
  useEffect(() => {

    if (!props.metamask.provider || !props.metamask.currentAccount) {
      return
    }
    
    const timer = setTimeout(() => {
      const web3Client = new Web3(props.metamask.provider)
      web3Client.eth.getBalance(props.metamask.currentAccount)
      .then(bal => {
        setBalance(parseFloat(bal) / (10 ** 18))
      })
    }, 1000);
    return () => clearTimeout(timer);

  }, [props.appState.blockNumber, props.metamask.provider, props.metamask.currentAccount])

  let balanceString = 'ETH: '
  let balanceBackground = 'rgba(0,0,0,0.6)'
  if (balance > 0 && balance < 0.1) {
    balanceString += '<0.1'
  } 
  else if (balance > 99) {
    balanceString += '99+'
  }
  else {
    balanceString += formatEthAmount(balance)
  } 
  
  if (!props.metamask.currentAccount) {
    balanceString = ''
    balanceBackground = 'rgba(0,0,0,0.0)'
  }

  return (
    <Header>
      <Logo>
        <Img src={logo} alt="logo" />
        <Title>
          {props.title}
        </Title>
      </Logo>
      <PageButton 
        variant="info" 
        onClick={(e) => handlePageButtonClick(e, hrefOptions[props.pageId].href)}>
          {hrefOptions[props.pageId].title}
      </PageButton>
      <BalanceButtonBlock style={{backgroundColor: balanceBackground}}>
        <BalanceBlock hidden={props.pageId === 0}>{balanceString}</BalanceBlock>
        <ConnectButton pageId={props.pageId} metamask={props.metamask} rpcProvider={props.rpcProvider} connectMetamask={props.connectMetamask}/>
      </BalanceButtonBlock>
    </Header>
  )
}