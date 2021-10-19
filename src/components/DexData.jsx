import styled from 'styled-components'
import React, {useState, useEffect} from 'react'

const MAIN = styled.div`
`
const SUB1 = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    margin-bottom: 10px;
`

const SUB11Base = styled.div`
    background:rgba(0, 0, 0,0.6);
    height: 37vh;
    border-radius: 10px;
    text-align: left;
`

const SUB11 = styled(SUB11Base)`
    width: 50%;
`
const SUB111 = styled(SUB11)`
    margin-right: 5px;
`
const SUB112 = styled(SUB11)`
    margin-left: 5px;
`

const SUB12 = styled(SUB11Base)`
    width: 100%;
`

const P = styled.p`
    font-weight: bold;
    color: #fff;
    font-size: 0.85rem;
`

const TITLE = styled.div`
    margin: 5px 10px;
`
const TABS = styled(TITLE)`
    display: flex;
    flex-direction: row;
    justify-content: start;
`
const TAB_BUTTON = styled.button`
    background-color: rgba(0,0,0,0);
    border-style: none;
    border-radius: 10px;
`

export default function DexData(props) {

    const [pairs, setPairs] = useState([])

    useEffect(() => {

        const getTokenPairs = async () => {

            if (!props.appState.currentToken || !props.appState.tokens.length || !props.dexContract) {
                return false
            }

            const pairPromises = props.appState.tokens
            .filter((item,pos,arr) => (item.ticker !== props.appState.currentToken.ticker))
            .map(async (token) => {

                //debugger
                
                return ({
                    ...token,
                    isValid: await props.dexContract.methods.pairs(props.appState.currentToken.ticker, token.ticker).call()
                })
            })
            await Promise.all(pairPromises)
            .then((pairs) => {
                setPairs(() => pairs)
            })

            return true
        }

        const componentWillMount = async () => {
            const bRes = await getTokenPairs()
            console.log(bRes ? '[getTokenPairs] - success' : '[getTokenPairs] - failure');
        }

        componentWillMount()
    }, [props.appState.currentToken, props.appState.tokens, props.dexContract])

    return (
        <MAIN>
            <SUB1>
                <SUB111>
                    <TITLE>
                        <P>Pairs</P>
                    </TITLE>
                </SUB111>
                <SUB112>
                <TITLE>
                    <P>Order Book</P>
                </TITLE>
                </SUB112>
            </SUB1>
            <SUB1>
                <SUB12>
                    <TABS>
                        <TAB_BUTTON><P>Active Orders</P></TAB_BUTTON>
                        <TAB_BUTTON><P>Completed Orders</P></TAB_BUTTON>
                    </TABS>
                </SUB12>
            </SUB1>
        </MAIN>
    )
}
