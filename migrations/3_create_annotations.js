const CIDRegistry = artifacts.require('./CIDRegistry.sol');

module.exports = async function(deployer) {
  let accounts = await web3.eth.getAccounts();
  
  const cidRegistry = await CIDRegistry.deployed();

  const tx = await cidRegistry.storeCID(web3.utils.toHex('TEST'), {
    from: accounts[0]
  });

  console.log(tx);
}
