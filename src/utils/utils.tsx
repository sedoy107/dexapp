import Web3 from 'web3'

export const formatPrice = (quantity, decimals) => {
    return new Intl.NumberFormat('en-EN', {minimumFractionDigits: 9,}).format(quantity / 10 ** decimals)
}

export const formatPriceUI = (quantity, decimals) => {
    return new Intl.NumberFormat('en-EN', {maximumSignificantDigits: 9, }).format(quantity / 10 ** decimals)
}

export const formatPrice2 = (quantity) => {
    return new Intl.NumberFormat('en-EN', {maximumSignificantDigits: 9, }).format(quantity)
}

export const formatEthAmount = (quantity) => {
    return new Intl.NumberFormat('en-EN', {maximumSignificantDigits: 2, maximumFractionDigits: 2}).format(quantity)
}