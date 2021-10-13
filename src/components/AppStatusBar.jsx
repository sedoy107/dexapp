import styled from 'styled-components'
import {web3Networks, defaultWeb3Network} from '../config/config'

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
    const statusBarString = props.httpProvider ? 'Connected to: ' + web3Networks[props.httpProvider.netId].name: 'Not connected'

    return (
        <FOOTER>
            <p>{statusBarString}</p>
            <p>{blockNumberString}</p>
        </FOOTER>
    )
}
