import styled from 'styled-components'
import { Dropdown, Button } from 'react-bootstrap'
import React, {useState, useEffect, useCallback} from 'react'
import { ConnectionMessageModal } from './Modals'

const MAIN_DIV = styled.div`
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
`

const TOKEN_DIV = styled.div`
    display:flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
`

const BaseTokenDropdownToggle = styled(Dropdown.Toggle)`
    border-top-left-radius: .25rem;
    border-top-right-radius: 0%;
    border-bottom-right-radius: 0%;
    border-bottom-left-radius: .25rem;
    min-width: 100px;
`
const PairedTokenDropdownToggle = styled(Dropdown.Toggle)`
    border-top-left-radius: 0%;
    border-top-right-radius: .25rem;
    border-bottom-right-radius: .25rem;
    border-bottom-left-radius: 0%;
    min-width: 100px;
`
const TradeTokensButton = styled(Button)`
    border-radius: 0%; 
    margin: 10px, 0px, 10px, 0px;
`

export default function TokenPicker(props) {

    // connectMessageModal handling
    const [showConnectionMessageModal, setShowConnectionMessageModal] = useState(false);
  
    
    // Base Token
    const currentBaseTokenDisplayName = props.appState.baseToken ? props.appState.baseToken.symbol: ''

    const handleBaseTokenItemClick = (e) => {
        props.handleBaseTokenChange( {
            ticker: e.currentTarget.dataset.ticker, 
            symbol: e.currentTarget.dataset.symbol, 
            address: e.currentTarget.dataset.address
        })
    }

    const baseTokenMenuItems = props.appState.tokens.map((token) => {
        return (
            <Dropdown.Item 
            key={token.ticker} 
            onClick={handleBaseTokenItemClick} 
            data-ticker={token.ticker} 
            data-symbol={token.symbol}
            data-address={token.address}>
                {token.symbol}
            </Dropdown.Item>
        )
    })

    // Paired Token
    const currentPairedTokenDisplayName = props.appState.pairedToken ? props.appState.pairedToken.symbol: 'None'
    const isDisabled = props.appState.pairedToken ? false: true

    const handlePairedTokenItemClick = (e) => {
        props.handlePairedTokenChange( {
            ticker: e.currentTarget.dataset.ticker, 
            symbol: e.currentTarget.dataset.symbol, 
            address: e.currentTarget.dataset.address
        })
    }

    const pairedTokenMenuItems = props.appState.pairedTokenSet.map((token) => {
        return (
            <Dropdown.Item 
            key={token.ticker} 
            onClick={handlePairedTokenItemClick}
            data-ticker={token.ticker} 
            data-symbol={token.symbol}
            data-address={token.address}>
                {token.symbol}
            </Dropdown.Item>
        )
    })

    const handleTradeTokensButtonClick = (e) => {
        props.appState.tradeEnabled ? props.showOrderModal() : setShowConnectionMessageModal(true)
    }

    // Pair label
    const pairLabelValue = props.appState.pairedToken 
    ? props.appState.baseToken.symbol+'/'+props.appState.pairedToken.symbol
    : 'No Trading Pair'
    const pairLabelColor = props.appState.pairedToken ? '#4bff52' : 'grey'

    return (
        <MAIN_DIV>
        <TOKEN_DIV>
            <Dropdown>
            <BaseTokenDropdownToggle variant="primary">
                {currentBaseTokenDisplayName}
            </BaseTokenDropdownToggle>
            <Dropdown.Menu>
               {baseTokenMenuItems}
            </Dropdown.Menu>
            </Dropdown>

            <TradeTokensButton 
            variant="primary" 
            hidden={isDisabled}
            onClick={handleTradeTokensButtonClick}>
                <i className="fas fa-sync-alt"></i>
            </TradeTokensButton>{' '}

            <Dropdown>
            <PairedTokenDropdownToggle variant="primary" disabled={isDisabled}>
                {currentPairedTokenDisplayName}
            </PairedTokenDropdownToggle>
            <Dropdown.Menu>
               {pairedTokenMenuItems}
            </Dropdown.Menu>
            </Dropdown>
        </TOKEN_DIV>
            <p style={{fontSize: '0.9rem', fontWeight: 'bold', color: pairLabelColor}}>{pairLabelValue}</p>
            <ConnectionMessageModal 
                show={showConnectionMessageModal} 
                handleShow={() => setShowConnectionMessageModal(true)} 
                handleClose={() => setShowConnectionMessageModal(false)} 
            />
        </MAIN_DIV>
    )
}
