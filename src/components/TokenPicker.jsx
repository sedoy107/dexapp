import styled from 'styled-components'

const P = styled.p`
    font-weight: bold;
    color: #4bff52;
    font-size: 0.9rem;
`
const DIV = styled.div`
    text-align: left;
`
export default function TokenPicker(props) {
    // The token price string will conditionally update based on the chosen token
    return (
        <DIV>
            <button className='btn btn-primary'>
                <div>
                ETH
                </div>
            </button>
            <P>$2,522.34</P>
        </DIV>
    )
}
