// Logo
// Page control
// Wallet connection

/** 
 * Design:The header must be transparent so that the background can be seen through.
 * 
 * */ 
import '../App.css'

import logo from '../logo.svg'
import styled from 'styled-components'
import { Button } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'

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
  width: 200px;
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

function ConnectButton(props) {

  interface IConnectButtonState {
    title: string,
    variant: string
    pending: boolean
  }

  /**
   * @dev Compose new button state
   */
  function makeNewState() : IConnectButtonState {

    if(!props.metamask.provider || !props.rpcProvider) {
      return {
        title: '',
        variant: 'secondary',
        pending: false
      }
    }

    let title;
    let variant;
    
    // eslint-disable-next-line eqeqeq
    if (props.metamask.provider.networkVersion != props.rpcProvider.netId) {
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
      variant = 'success'
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
            title: 'Connecting...',
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
      style={{ width: "200px" }}
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
    0: {title: 'Launch App', href: '#/swaps'},
    1: {title: 'Token Feed', href: '#/feed'},
    2: {title: 'Swap Tokens', href: '#/swaps'}
  }

  const handlePageButtonClick = (e, href) => {
    document.location.href = href;
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
      <ConnectButton pageId={props.pageId} metamask={props.metamask} rpcProvider={props.rpcProvider} connectMetamask={props.connectMetamask}/>
    </Header>
  )
}