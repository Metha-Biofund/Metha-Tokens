require('dotenv').config();

const path = require("path");
const HDWalletProvider = require ("truffle-hdwallet-provider");

console.log(process.env.MNEMONIC);

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
	networks: {
		ropsten: {
			provider: function(){
				return new HDWalletProvider(process.env.MNEMONIC,process.env.INFURA_API_KEY)
			},
			gasPrice: 25000000000,
			network_id: 3
		},
		development: {
			host: "127.0.0.1",
			port: "7545",
			network_id: "*"
		}
	},
	compilers: {
		solc: {
			version: '0.5.7'
		}
	},
	plugins: [
		'truffle-plugin-verify'
	],
	api_keys: {
		etherscan: process.env.ETHSCAN_KEY
	}
};