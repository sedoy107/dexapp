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

    const blockNumberString = 'Last synched block: ' + props.appState.blockNumber
    const networkConfig = props.rpcProvider ? web3Networks.find((network) => (network.chainId === props.rpcProvider.chainId)) : undefined
    const statusBarString = networkConfig !== undefined ? 'Connected to: ' + networkConfig.name : 'Not connected'

    return (
        <FOOTER hidden={props.hidden}>
            <p>{statusBarString}</p>
            <p>{blockNumberString}</p>
        </FOOTER>
    )
}
