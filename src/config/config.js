// Web3config.json
const web3Networks = {
    5777: {
      id:5777,
      url: 'ws://127.0.0.1:8545',
      name: 'Local Ganache Chain'
    },
    0x2a: {
      id:0x2a,
      url: 'https://speedy-nodes-nyc.moralis.io/a39f3ea430eb9a2061d4596f/eth/kovan',
      name: 'Kovan Testnet'
    }
}
  
const defaultWeb3Network = web3Networks[5777]

module.exports = {
  web3Networks,
  defaultWeb3Network,
}