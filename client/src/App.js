import React, { Component } from "react";
import MethaToken from "./contracts/MethaToken.json";
import MethaCrowdsale from "./contracts/MethaCrowdsale.json";
import getWeb3 from "./utils/getWeb3";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      accounts: null,
      MethaTokenInstance: null,
      MethaCrowdsaleInstance: null,
      current_period: 0,
      token_balance: 0,
      wei_contribution: 0,
      wei_raised_per_period: 0,
      start_time_of_next_period: null,
      eth_to_send: 0,
      period_id: 0,
      claim_range_from: 0,
      claim_range_to: 0,
      wei_raised: 0,
      periods: [],
      amount_to_claim: '0',
      address_to_add: '',
      eth_to_claim: '0.01',
      address_percent: 1,
      address_total: '0.01',
      wallets_authorized_count: 0,
      wallets_authorized: []
    };
  }

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      
      const deployedNetworkToken = MethaToken.networks[networkId];
      const MethaTokenInstance = new web3.eth.Contract(MethaToken.abi, deployedNetworkToken && deployedNetworkToken.address);

      const deployedNetworkCrowdsale = MethaCrowdsale.networks[networkId];
      const MethaCrowdsaleInstance = new web3.eth.Contract(MethaCrowdsale.abi, deployedNetworkCrowdsale && deployedNetworkCrowdsale.address);
      
      this.setState({
        web3,
        accounts,
        MethaTokenInstance,
        MethaCrowdsaleInstance 
      }, this.Init);
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  Init = async () => {
    const { web3, accounts, MethaTokenInstance, MethaCrowdsaleInstance } = this.state;

    const current_period = await MethaCrowdsaleInstance
            .methods
            .current_period()
            .call();

    const contributor_data_per_period = await MethaCrowdsaleInstance
            .methods
            .get_contributor_data_per_period(current_period, accounts[0])
            .call();

    const wei_contribution = contributor_data_per_period[2];

    const token_balance = await MethaTokenInstance
            .methods
            .balanceOf(accounts[0])
            .call()

    const wei_raised_per_period = await MethaCrowdsaleInstance
            .methods
            .wei_raised_per_period(current_period)
            .call();

    const start_time_of_next_period = await MethaCrowdsaleInstance
            .methods
            .start_time_of_next_period()
            .call();

    const wei_raised = await MethaCrowdsaleInstance
            .methods
            .wei_raised()
            .call()
    const wallets_authorized_count = await MethaCrowdsaleInstance
            .methods
            .get_wallets_authorized_count()
            .call() 

    /*await MethaTokenInstance.methods.addMinter(MethaCrowdsaleInstance._address).send({from: accounts[0]});
    const res = await MethaTokenInstance.methods.isMinter(MethaCrowdsaleInstance._address).call();
    console.log(res);*/

    this.setState({
      current_period,
      token_balance: web3.utils.fromWei(token_balance, 'ether'),
      wei_contribution: web3.utils.fromWei(wei_contribution.toString(), 'ether'),
      wei_raised_per_period: web3.utils.fromWei(wei_raised_per_period.toString(), 'ether'),
      start_time_of_next_period,
      eth_to_send: '0.01',
      wei_raised : web3.utils.fromWei(wei_raised.toString(), 'ether'),
      amount_to_claim: '0.01',
      address_to_add: '',
      eth_to_claim: '0.01',
      address_percent: 1,
      address_total: '0.01',
      wallets_authorized_count
    }, this.get_all_periods);
  };

  get_all_periods = async () => {
    const { accounts, MethaCrowdsaleInstance, current_period } = this.state;
    var periods = [];
    for (var i=0; i<=current_period; i++) {
      const res = await MethaCrowdsaleInstance.methods.if_address_has_contributed_in(i, accounts[0]).call();
      if (res) {
        const data = await MethaCrowdsaleInstance.methods.get_contributor_data_per_period(i, accounts[0]).call();
        if (!data[3]) {
          periods.push(i);
        }
      }
    }
    this.setState({
      periods: periods.join(', ') 
    }, this.get_wallets_authorized_datails);
  }

  get_wallets_authorized_datails = async () => {
    const { MethaCrowdsaleInstance, wallets_authorized_count } = this.state;
    var wallets_authorized = [];
    var j = 0;
    for (var i=0; i<=wallets_authorized_count; i++) {
      const address = await MethaCrowdsaleInstance.methods.wallets_authorized_addresses(i).call();
      const status = await MethaCrowdsaleInstance.methods.wallets_authorized_to_claim(address).call();
      const percent = await MethaCrowdsaleInstance.methods.wallets_authorized_percent(address).call();
      const total = await MethaCrowdsaleInstance.methods.wallets_authorized_total(address).call();
      const total_claimed = await MethaCrowdsaleInstance.methods.wallets_authorized_total_claimed(address).call();
      if (status) {
        wallets_authorized.push([address, percent, total, total_claimed, i]);
      }
      j = i + 1;
      if (j == wallets_authorized_count) {
        this.setState({
          wallets_authorized
        });
      }
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.name] : e.target.value });
  }

  buy = async () => {
    const { web3, accounts, MethaCrowdsaleInstance, eth_to_send } = this.state;
    if (eth_to_send >= 0.01) {
      await MethaCrowdsaleInstance.methods.buy().send({from: accounts[0], value: web3.utils.toWei(eth_to_send, 'ether') });
      this.Init();
    }
  }

  claim_period = async () => {
    const { accounts, MethaCrowdsaleInstance, period_id } = this.state;
    await MethaCrowdsaleInstance.methods.claim_period(period_id).send({ from: accounts[0] });
    this.Init();
  }

  claim_all = async () => {
    const { accounts, MethaCrowdsaleInstance } = this.state;
    await MethaCrowdsaleInstance.methods.claim_all().send({ from: accounts[0] });
    this.Init();
  }

  claim_range = async () => {
    const { accounts, MethaCrowdsaleInstance, claim_range_from, claim_range_to } = this.state;
    await MethaCrowdsaleInstance.methods.claim_range(claim_range_from, claim_range_to).send({ from: accounts[0] });
    this.Init();
  }

  claim_authorized_address = async () => {
    const { web3, accounts, MethaCrowdsaleInstance, amount_to_claim } = this.state;
    await MethaCrowdsaleInstance.methods.claim_authorized_address(web3.utils.toWei(amount_to_claim, 'ether')).send({ from: accounts[0] });
    this.Init(); 
  }

  claim_eth_authorized_address = async () => {
    const { web3, accounts, MethaCrowdsaleInstance, eth_to_claim } = this.state;
    await MethaCrowdsaleInstance.methods.claim_eth_authorized_address(web3.utils.toWei(eth_to_claim, 'ether')).send({ from: accounts[0] });
    this.Init(); 
  }

  add_authorized_address = async () => {
    const { web3, accounts, MethaCrowdsaleInstance, address_to_add, address_percent, address_total } = this.state;
    await MethaCrowdsaleInstance.methods.add_authorized_address(address_to_add, address_percent, web3.utils.toWei(address_total, 'ether'))
    .send({ from: accounts[0] });
    this.Init(); 
  }

  delete_authorized_address = async (e) => {
    const { accounts, MethaCrowdsaleInstance } = this.state;
    await MethaCrowdsaleInstance.methods.delete_authorized_address(e.target.dataset["address"], e.target.dataset["index"])
    .send({ from: accounts[0] });
    this.Init(); 
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contracts...</div>;
    }
  
    return (
      <div className="container">
        <br/>
        <p>
          ETH contribution : {this.state.wei_contribution} | 
          METHA balance : {this.state.token_balance} | 
          Current period ID : {this.state.current_period} | 
          Current ETH raised : {this.state.wei_raised_per_period} | 
          Total ETH raised : {this.state.wei_raised} |
          Next Period : {new Date(this.state.start_time_of_next_period * 1000).toLocaleString()}
        </p>
        <p>
          Periods : {this.state.periods}
        </p>
        <h2>Buy</h2>
        <input 
          className="u-full-width" 
          type="text" 
          name="eth_to_send" 
          placeholder="0.01 ETH" 
          value={this.state.eth_to_send} 
          onChange={this.onChange}
        />
        <button className="u-full-width button-primary" onClick={this.buy}>buy</button>
        <h2>Claim per period</h2>
        <input 
          className="u-full-width" 
          type="text" 
          name="period_id"
          value={this.state.period_id} 
          onChange={this.onChange}
        />
        <button className="u-full-width button-primary" onClick={this.claim_period}>claim</button>
        <h2>Claim All</h2>
        <button className="u-full-width button-primary" onClick={this.claim_all}>claim all</button>
        <h2>Claim Range</h2>
        From:
        <input 
          className="u-full-width" 
          type="text" 
          name="claim_range_from"
          value={this.state.claim_range_from} 
          onChange={this.onChange}
        />
        To:
        <input 
          className="u-full-width" 
          type="text" 
          name="claim_range_to"
          value={this.state.claim_range_to} 
          onChange={this.onChange}
        />
        <button className="u-full-width button-primary" onClick={this.claim_range}>claim all</button>
        <h2>Claim for Admin</h2>
        <input 
          className="u-full-width" 
          type="text" 
          name="amount_to_claim"
          value={this.state.amount_to_claim} 
          onChange={this.onChange}
        />
        <button className="u-full-width button-primary" onClick={this.claim_authorized_address}>claim</button>
        <h2>Claim ETH for Admins</h2>
        <input 
          className="u-full-width" 
          type="text" 
          name="eth_to_claim"
          value={this.state.eth_to_claim} 
          onChange={this.onChange}
        />
        <button className="u-full-width button-primary" onClick={this.claim_eth_authorized_address}>claim</button>
        <h2>Add authorized address</h2>
        Address:
        <input 
          className="u-full-width" 
          type="text" 
          name="address_to_add"
          value={this.state.address_to_add} 
          onChange={this.onChange}
        />
        Percent:
        <input 
          className="u-full-width" 
          type="text" 
          name="address_percent"
          value={this.state.address_percent} 
          onChange={this.onChange}
        />
        Total:
        <input 
          className="u-full-width" 
          type="text" 
          name="address_total"
          value={this.state.address_total} 
          onChange={this.onChange}
        />
        <button className="u-full-width button-primary" onClick={this.add_authorized_address}>add</button>
        <h2>Authorized Addresses</h2>
        <table className="u-full-width">
          <thead>
            <tr>
              <th>Address</th>
              <th>Percent</th>
              <th>Total</th>
              <th>Tatal Claimed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.wallets_authorized.map(item => (
            <tr key={item[0]}>
              <td>{item[0]}</td>
              <td>{item[1]}%</td>
              <td>{this.state.web3.utils.fromWei(item[2], 'ether')} ETH</td>
              <td>{this.state.web3.utils.fromWei(item[3], 'ether')} ETH</td>
              <td><span data-index={item[4]} data-address={item[0]} style={{cursor: "pointer"}} onClick={this.delete_authorized_address}>delete</span></td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
