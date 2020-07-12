const CIDRegistry = artifacts.require('./CIDRegistry.sol');

module.exports = async function(deployer) {
  let accounts = await web3.eth.getAccounts();
  
  const cidRegistry = await CIDRegistry.deployed();

  const tx = await cidRegistry.storeCID('QmY7Yh4UquoXHLPFo2XbhXkhBvFoPwmQUSa92pxnxjQuPU', {
    from: accounts[0]
  });

  console.log(tx);
}
