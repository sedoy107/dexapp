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
// import { useEthers, useEtherBalance } from "@usedapp/core";


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

const WRAPPER = styled.div`
    width: 33%;
    height: inherit;
`
const WRAPPER2 = styled(WRAPPER)`
    width: 34%;
    text-align: right;
`

const LogoTitle = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    color: white;
`

const H1 = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`

const PageControl = styled.div`
    color: black
`
function ConnectButton() {

  const Button = styled.button`
  width: 200px
  `

  //handle connect button click
  // function handleConnectWallet() {
  //   activateBrowserWallet();
  // }

  // // useDApp hooks
  // const {activateBrowserWallet, account } = useEthers();
  // const etherBalance = useEtherBalance(account);
  // const btnWalletTitle = account ? etherBalance && JSON.stringify(etherBalance) : 'Connect Wallet'
  const btnWalletTitle = 'Connect Wallet'

  return (
    <Button 
        className='btn btn-warning' 
        onClick={dummyClick}>
            {btnWalletTitle}
    </Button>
  )
  
}

const NavigationButton = styled.button`
    font-weight: bold;
    opacity: 60%;
`

const aDummyClick = async (e) => {
    console.log(e)
}

const dummyClick = (e) => {
    console.log(e);
}

export default function AppHeader(props) {

    return (
        <Header>
            <WRAPPER>
            <LogoTitle>
                <Img src={logo} alt="logo" />
                <H1>
                    {props.title}
                </H1>
            </LogoTitle>
            </WRAPPER>
            <WRAPPER>
                <button type="button" id='btn-transparent' className="btn btn-dark" >Trade</button>
                <button type="button" id='btn-transparent' className="btn btn-dark">Charts</button>
                <button type="button" id='btn-transparent' className="btn btn-dark">Orders</button>
            </WRAPPER>
            <WRAPPER2>
              <ConnectButton />
            </WRAPPER2>
        </Header>
    )
}

{/* <PageControl className="btn-group" role="group">
                <button type="button" id='btn-transparent' className="btn btn-dark" >Trade</button>
                <button type="button" id='btn-transparent' className="btn btn-dark">Charts</button>
                <button type="button" id='btn-transparent' className="btn btn-dark">Orders</button>
            </PageControl> */}