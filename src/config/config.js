// Web3config.json
const web3Networks = [
    {
      netId:5777,
      chainId: 0x539,
      url: 'ws://127.0.0.1:7545',
      name: 'Local Ganache Chain'
    },
    {
      netId:5777,
      chainId: 0x1691,
      url: 'ws://127.0.0.1:8545',
      name: 'Ganache Cli Chain'
    },
    {
      netId:0x2a,
      chainId: 0x2a,
      url: 'https://speedy-nodes-nyc.moralis.io/a39f3ea430eb9a2061d4596f/eth/kovan',
      name: 'Kovan Testnet'
    }
  ]
  
const defaultWeb3Network = web3Networks[1]

module.exports = {
  web3Networks,
  defaultWeb3Network,
}