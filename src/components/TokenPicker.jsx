import styled from 'styled-components'
import React, {useState, useEffect} from 'react'
import { Dropdown, Button } from 'react-bootstrap';

const MAIN_DIV = styled.div`
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
`

const PRICE_P = styled.p`
    font-weight: bold;
    color: #4bff52;
    font-size: 0.9rem;
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
const SwapTokenButton = styled(Button)`
    border-radius: 0%; 
    margin: 10px, 0px, 10px, 0px;
`

export default function TokenPicker(props) {
    
    // Base Token
    const currentBaseTokenDisplayName = props.appState.baseToken ? props.appState.baseToken.symbol: ''

    const handleBaseTokenItemClick = (e) => {
        props.handleBaseTokenChange( {ticker: e.currentTarget.dataset.ticker, symbol: e.currentTarget.dataset.symbol} )
    }

    const baseTokenMenuItems = props.appState.tokens.map((token) => {
        return (
            <Dropdown.Item 
            key={token.ticker} 
            onClick={handleBaseTokenItemClick} 
            data-ticker={token.ticker} 
            data-symbol={token.symbol}>
                {token.symbol}
            </Dropdown.Item>
        )
    })

    // Paired Token
    const currentPairedTokenDisplayName = props.appState.pairedToken ? props.appState.pairedToken.symbol: 'None'
    const isDisabled = props.appState.pairedToken ? false: true

    const handlePairedTokenItemClick = (e) => {
        props.handlePairedTokenChange( {ticker: e.currentTarget.dataset.ticker, symbol: e.currentTarget.dataset.symbol} )
    }

    const pairedTokenMenuItems = props.appState.pairedTokenSet.map((token) => {
        return (
            <Dropdown.Item 
            key={token.ticker} 
            onClick={handlePairedTokenItemClick}
            data-ticker={token.ticker} 
            data-symbol={token.symbol}>
                {token.symbol}
            </Dropdown.Item>
        )
    })

    const handleSwapTokenButtonClick = (e) => {
        props.showSwapModal()
    }

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

            <SwapTokenButton 
            variant="primary" 
            hidden={isDisabled}
            onClick={handleSwapTokenButtonClick}>
                <i className="fas fa-sync-alt"></i>
            </SwapTokenButton>{' '}

            <Dropdown>
            <PairedTokenDropdownToggle variant="primary" disabled={isDisabled}>
                {currentPairedTokenDisplayName}
            </PairedTokenDropdownToggle>
            <Dropdown.Menu>
               {pairedTokenMenuItems}
            </Dropdown.Menu>
            </Dropdown>
        </TOKEN_DIV>
            <PRICE_P>$2,522.34</PRICE_P>
        </MAIN_DIV>
    )
}
