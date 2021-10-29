import Web3 from 'web3'

import logo from '../logo.svg'
import styled from 'styled-components'
import { Button, Spinner } from 'react-bootstrap'
import { useEffect, useState } from 'react'

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
  function makeNewState() : IConnectButtonState {

    if(!props.metamask.provider || !props.rpcProvider) {
      return {
        title: <Spinner animation="border" variant='secondary' size='sm' />,
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
  }

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
  
  },[props.rpcProvider, props.metamask])
  
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
    0: {title: 'Launch App', href: '#/trade'},
    1: {title: 'Token Feed', href: '#/feed'},
    2: {title: 'Swap Tokens', href: '#/trade'}
  }

  const handlePageButtonClick = (e, href) => {
    document.location.href = href;
  }

  const balance = parseInt(props.metamask.balance) / 10 ** 18
  let balanceString = 'ETH: '
  let balanceBackground = 'rgba(0,0,0,0.6)'
  if (balance > 0 && balance < 1) {
    balanceString += '<1'
  } 
  else if (balance > 99) {
    balanceString += '99+'
  }
  else {
    balanceString += Math.floor(balance)
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
        <BalanceBlock>{balanceString}</BalanceBlock>
        <ConnectButton pageId={props.pageId} metamask={props.metamask} rpcProvider={props.rpcProvider} connectMetamask={props.connectMetamask}/>
      </BalanceButtonBlock>
    </Header>
  )
}