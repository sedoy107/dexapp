// Web3config.json
const web3Networks = {
    5777: {
      id:5777,
      url: 'http://127.0.0.1:7545',
      name: 'Local Ganache Chain'
    },
    42: {
      id:42,
      url: 'https://speedy-nodes-nyc.moralis.io/a39f3ea430eb9a2061d4596f/eth/kovan',
      name: 'Kovan Testnet'
    }
}
  
const defaultWeb3Network = web3Networks[5777]

module.exports = {
  web3Networks,
  defaultWeb3Network,
}