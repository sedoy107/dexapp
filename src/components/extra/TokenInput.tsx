import React from 'react'
import PropTypes from "prop-types"
import { useCallback, useEffect, useState } from 'react'
import { formatPriceUI, formatPrice2 } from '../../utils/utils'
import styled from 'styled-components'

const Input = styled.input`
  text-align: end;
  background-color: rgba(255,255,255,0.1);
  color: #ccc;
  border: none;
  &:focus-visible {
    outline: none
  }
`

export default function TokenInput(props) {

    const [state, setState] = useState({isEditing: false})
    const [value, setValue] = useState(props.value)

    const toggleEditing = () => {
        setState(({isEditing}) => ({isEditing: !isEditing}) )
    }

    // Update on change within the text field
    const handleInputChange = (e) => {
      if (e.target.value < 0) {
        return
      }
      setValue(() => e.target.value)  
    } 

    // Update on `props.value` change
    useEffect(() => {
      setValue(() => props.value)
    }, [props.value])

    return (
        state.isEditing ? (
          <Input
            type="number"
            name={props.name}
            value={value}
            onChange={handleInputChange}
            onBlur={() => {
              props.onChange(value)
              toggleEditing()
            }}
          />
        ) : (
          <Input
            type="text"
            name={props.name}
            value={formatPrice2(value)}
            onFocus={toggleEditing}
            readOnly
          />
        )
    )
}

TokenInput.propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    decimals: PropTypes.string,
    onChange: PropTypes.func
};