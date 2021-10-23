import styled from 'styled-components'
import React from 'react'

const Div = styled.div`
    border-radius: 10px;
    text-align: left;
`

export default function Welcome() {
    return (
        <Div>
            Decentralized token exchange project
        </Div>
    )
}
