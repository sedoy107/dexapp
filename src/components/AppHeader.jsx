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

const Button = styled.button`
  width: 200px
`

const NavigationButton = styled.button`
  font-weight: bold;
  opacity: 60%;
`

export default function AppHeader(props) {

  const btnWalletTitle = 'Connect Wallet'

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
        <Button 
          className='btn btn-warning' 
          onClick={(e) => console.log(e)}>
            {btnWalletTitle}
        </Button>
      </WRAPPER2>
    </Header>
  )
}

{/* <PageControl className="btn-group" role="group">
                <button type="button" id='btn-transparent' className="btn btn-dark" >Trade</button>
                <button type="button" id='btn-transparent' className="btn btn-dark">Charts</button>
                <button type="button" id='btn-transparent' className="btn btn-dark">Orders</button>
            </PageControl> */}