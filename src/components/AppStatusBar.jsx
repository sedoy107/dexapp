import styled from 'styled-components'
import React, { Component } from 'react'

const FOOTER = styled.div`
    height: 5vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: flex-end;
    color: #ccc;
`

export default function AppStatusBar(props) {
    return (
        <FOOTER>
            <p>Connected to: Kovan Testnet</p>
        </FOOTER>
    )
}
