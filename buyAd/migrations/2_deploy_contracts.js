var AdContracts = artifacts.require("./AdContracts.sol");

module.exports = function(deployer) {
  deployer.deploy(AdContracts);
};