export const formatPrice = (quantity, decimals) => {
    return new Intl.NumberFormat('en-EN', {minimumFractionDigits: 9,}).format(quantity / 10 ** decimals)
}