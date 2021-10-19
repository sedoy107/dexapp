import styled from 'styled-components'
import { web3Networks } from '../config/config'

const FOOTER = styled.div`
    height: 5vh;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    color: #ccc;
`

export default function AppStatusBar(props) {

    const blockNumberString = 'Block: ' + props.appState.blockNumber
    const statusBarString = props.rpcProvider 
    ? 'Connected to: ' + web3Networks[props.rpcProvider.netId].name
    : 'Not connected'

    return (
        <FOOTER>
            <p>{statusBarString}</p>
            <p>{blockNumberString}</p>
        </FOOTER>
    )
}
