import styled from 'styled-components'
import {web3Networks, defaultWeb3Network} from '../config/config'

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

    const StatusBarString = props.appState.netId in web3Networks ? 'Connected to: ' + web3Networks[props.appState.netId].name : 'Not connected'

    return (
        <FOOTER>
            <p>{StatusBarString}</p>
        </FOOTER>
    )
}
