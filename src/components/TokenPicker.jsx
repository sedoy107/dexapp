import styled from 'styled-components'
import React, {useState, useEffect} from 'react'
import {Dropdown} from 'bootstrap'

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
function TokenList(props) {
    return (
        props.isVisible ?
        props.appState.tokens.map((token) => {
            return (
                <div>
                    {token.symbol}
                </div>
            )
        })
        :
        <div></div>
    )
}


export default function TokenPicker(props) {
    // The token price string will conditionally update based on the chosen token

    const defaultToken = props.appState.tokens.length > 0 ? props.appState.tokens[0].symbol: ''

    const [displayTokenList, setDisplayTokenList] = useState(false)

    const handleTokenButton = () => {
        setDisplayTokenList((prevState) => !prevState)
    }

    return (
        <MAIN_DIV>
        <TOKEN_DIV>
            <button className='btn btn-primary' onClick={handleTokenButton}>
                <div>
                {defaultToken}
                </div>
                
            </button>
            <PRICE_P>$2,522.34</PRICE_P>
        </TOKEN_DIV>
        <TokenList appState={props.appState} isVisible={displayTokenList}/>
        </MAIN_DIV>
    )
}
