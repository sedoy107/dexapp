import styled from 'styled-components'
import React from 'react'
import { SocialIcon } from 'react-social-icons'

// Generic styles for the page
const GrandParentContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background:rgba(0, 0, 0,0.5);
`

const ParentContainer = styled.div`
    width: 90%;
    min-width: 1000px;
`
const TextDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 84.5vh;
    border-radius: 10px;
    text-align: left;
    font-size: 1.25rem;
    padding: 10px 0px 10px 0px;
`

const Description = styled.div`
    margin-top: 1rem;
    margin-bottom: 1rem;
`
const Footer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
`

export default function Welcome() {
    return (
        <GrandParentContainer>
        <ParentContainer>
        <TextDiv>
        <Description>
        <h1>
            DECENTRALIZED ERC20 TOKEN EXCHANGE
        </h1>
        <p style={{marginLeft: '3rem', marginBottom: '0'}}>
            Powered by Solidity and ReactJS
        </p>
        </Description>
        <Footer>
            <SocialIcon fgColor="#ffffff" url="https://github.com/sedoy107/dexapp" />
            <SocialIcon url="https://www.linkedin.com/in/sergey-gorbov-97536959/" />
            <SocialIcon fgColor="#ffffff" url="https://github.com/sedoy107/iot_dex" />
        </Footer>

        </TextDiv>
        </ParentContainer>
        </GrandParentContainer>
    )
}
