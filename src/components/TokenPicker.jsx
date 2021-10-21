import styled from 'styled-components'
import React, {useState, useEffect} from 'react'
import { Dropdown } from 'react-bootstrap';

const MAIN_DIV = styled.div`
    display:flex;
    flex-direction: column;
    align-items: flex-start;
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
const LIST_DIV = styled.div`

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
    const currentPairedTokenDisplayName = props.appState.pairedToken ? props.appState.pairedToken.symbol: ''

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

    return (
        <MAIN_DIV>
        <TOKEN_DIV>
            <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
                {currentBaseTokenDisplayName}
            </Dropdown.Toggle>
            <Dropdown.Menu>
               {baseTokenMenuItems}
            </Dropdown.Menu>
            </Dropdown>

            <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
                {currentPairedTokenDisplayName}
            </Dropdown.Toggle>
            <Dropdown.Menu>
               {pairedTokenMenuItems}
            </Dropdown.Menu>
            </Dropdown>
        </TOKEN_DIV>
            <PRICE_P>$2,522.34</PRICE_P>
        </MAIN_DIV>
    )
}
