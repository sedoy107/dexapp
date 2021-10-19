import styled from 'styled-components'
import React, {useState, useEffect} from 'react'
import { Dropdown } from 'react-bootstrap';

const MAIN_DIV = styled.div`
    display:flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
`

const PRICE_P = styled.p`
    font-weight: bold;
    color: #4bff52;
    font-size: 0.9rem;
`
const TOKEN_DIV = styled.div`
    text-align: left;
`
const LIST_DIV = styled.div`

`

export default function TokenPicker(props) {
    // The token price string will conditionally update based on the chosen token

    const defaultToken = props.appState.currentToken ? props.appState.currentToken.symbol: ''

    const handleDropdownItemClick = (e) => {
        props.handleTokenChange({ticker: e.currentTarget.dataset.ticker, symbol: e.currentTarget.dataset.symbol})
    }

    const dropDownMenuItems = props.appState.tokens.map((token) => {
        return (
            <Dropdown.Item 
            key={token.ticker} 
            onClick={handleDropdownItemClick} 
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
                {defaultToken}
            </Dropdown.Toggle>

            <Dropdown.Menu>
               {dropDownMenuItems}
            </Dropdown.Menu>
            </Dropdown>
            <PRICE_P>$2,522.34</PRICE_P>
        </TOKEN_DIV>
        </MAIN_DIV>
    )
}
