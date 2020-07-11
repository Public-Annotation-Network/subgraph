const fs = require('fs');
const path = require('path');

const CIDRegistry = artifacts.require('./CIDRegistry.sol')

module.exports = async function(deployer) {
  console.log(await web3.eth.getAccounts());
  await deployer.deploy(CIDRegistry)

  console.log(`
    Deployments:
    
      CIDRegistry: ${CIDRegistry.address}
  `);

  // update address for ap-chain or goerli deployment
  const deployments = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'deployments.json'), 'utf8'));
  deployments[await web3.eth.net.getId()] = {
    "CIDRegistry": CIDRegistry.address,
  }
  fs.writeFileSync(path.resolve(__dirname, '../', 'deployments.json'), JSON.stringify(deployments, null, 2), 'utf8');
}
