// Logo
// Page control
// Wallet connection

/** 
 * Design:The header must be transparent so that the background can be seen through.
 * 
 * */ 
import '../App.css'

import logo from '../logo.svg';
import styled from 'styled-components'
import { Button } from 'react-bootstrap';


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

const ConnectButton = styled(Button)`
  width: 200px
`

const PageButton = styled(Button)`
  width: 200px
`

export default function AppHeader(props) {

  const hrefOptions = {
    0: {title: 'Launch App', href: '#/swaps'},
    1: {title: 'Token Feed', href: '#/feed'},
    2: {title: 'Swap Tokens', href: '#/swaps'}
  }
  
  const btnWalletTitle = 'Connect Wallet'

  const handlePageButtonClick = (e, h) => {
    document.location.href = h;
  }

  return (
    <Header>
      <Logo>
        <Img src={logo} alt="logo" />
        <Title>
          {props.title}
        </Title>
      </Logo>
      <PageButton variant="info" onClick={(e) => handlePageButtonClick(e, hrefOptions[props.pageId].href)}>{hrefOptions[props.pageId].title}</PageButton>
      <ConnectButton variant="warning" hidden={props.pageId === 0}>{btnWalletTitle}</ConnectButton>{' '}
    </Header>
  )
}