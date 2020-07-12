require('babel-register')
require('babel-polyfill')

const HDWalletProvider = require('truffle-hdwallet-provider')

const { MNEMONIC, INFURA_API_KEY } = require('./env.js');

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          MNEMONIC,
          `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`
        )
      },
      network_id: '4',
      skipDryRun: true
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          MNEMONIC,
          `https://ropsten.infura.io/v3/${INFURA_API_KEY}`
        )
      },
      network_id: '3',
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: '0.6.11'
    }
  }
}
