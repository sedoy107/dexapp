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
      url: 'wss://kovan.infura.io/ws/v3/ef7d535d2fae48ab9e620c46dbd8788a',
      name: 'Kovan Testnet'
    }
  ]
  
const defaultWeb3Network = web3Networks[2]

module.exports = {
  web3Networks,
  defaultWeb3Network,
}