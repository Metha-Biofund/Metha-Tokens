var MethaToken = artifacts.require("./MethaToken.sol");
var MethaCrowdsale = artifacts.require("./MethaCrowdsale.sol");

module.exports = async function(deployer, network, accounts) {
  const _name = "Metha Token";
  const _symbol = "MET";
  const _decimals = 18;

  await deployer.deploy(MethaToken, _name, _symbol, _decimals);
  const deployedToken = await MethaToken.deployed();

  const token = deployedToken.address;
  const wallet = accounts[0];
  const start_time_of_first_period = parseInt(new Date().getTime() / 1000);
  const tokens_created_per_period = 1000;
  //const init_period_duration = 40; /////////////////////////////////////
  const init_period_duration = 600; /////////////////////////////////////

  await deployer.deploy(
    MethaCrowdsale,
    token,
    wallet,
    start_time_of_first_period,
    tokens_created_per_period,
    init_period_duration
  );
  const deployedCrowdsale = await MethaCrowdsale.deployed();
  //await deployedToken.addMinter(deployedCrowdsale.address);
};
