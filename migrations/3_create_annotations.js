const CIDRegistry = artifacts.require('./CIDRegistry.sol');

module.exports = async function(deployer) {
  let accounts = await web3.eth.getAccounts();
  
  const cidRegistry = await CIDRegistry.deployed();

  const tx = await cidRegistry.storeCID('QmQusfC3i7jaJzw7D3mabfe6Zdc8bMZ6cTTns7UC4Fstvw', {
    from: accounts[0]
  });

  console.log(tx);
}
