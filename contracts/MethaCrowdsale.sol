pragma solidity ^0.5.2;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract MethaCrowdsale is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 private _token;
    address private _wallet;
    uint private _start_time_of_first_period;
    uint256 private _start_time_of_next_period;
    uint private _tokens_created_per_period;
    uint256 private _wei_raised;
    uint256 private _current_period;
    uint256 private _init_period_duration;

    constructor (IERC20 token, address wallet, uint start_time_of_first_period, uint tokens_created_per_period, uint256 init_period_duration) public {
        _token = token;
        _wallet = wallet;
        _start_time_of_first_period = start_time_of_first_period;
        _tokens_created_per_period = tokens_created_per_period;
        _init_period_duration = init_period_duration;
        _start_time_of_next_period = start_time_of_first_period.add(init_period_duration);
        _current_period = 0;
        wallets_authorized_to_claim[msg.sender] = true;
    }

    struct contributor_data_per_period {
        address user_address;
        uint256 token_balance;
        uint256 wei_contribution;
        bool claimed;
    }

    mapping ( uint => contributor_data_per_period[] ) public contributors_data_per_period;
    
    uint256 private _amount_tokens_to_claimed;
    address[] public wallets_authorized_addresses;
    mapping ( address => bool ) public wallets_authorized_to_claim;
    mapping ( address => uint ) public wallets_authorized_percent;
    mapping ( address => uint256 ) public wallets_authorized_total;
    mapping ( address => uint256 ) public wallets_authorized_total_claimed;

    function wei_raised_per_period(uint256 period_id) view public returns (uint256) {
        contributor_data_per_period[] memory data = contributors_data_per_period[period_id];
        uint256 _wei_raised_per_period;
        for (uint i=0; i<data.length; i++) {
            _wei_raised_per_period = _wei_raised_per_period.add(data[i].wei_contribution);
        }
        return _wei_raised_per_period;
    }

    function current_period() view external returns (uint256) {
        return _current_period;
    }

    function wei_raised() view external returns (uint256) {
        return _wei_raised;
    }

    function increment_period(uint256 _now) internal {
        _current_period = _current_period.add(1);
        _start_time_of_next_period = _now.add(_init_period_duration);
        _amount_tokens_to_claimed = _amount_tokens_to_claimed.add(_tokens_created_per_period.mul(1e18).div(10));
    }

    function start_time_of_next_period() view external returns (uint256) {
        return _start_time_of_next_period;
    }

    function contributors_length_per_period(uint period_id) view external returns (uint) {
        return contributors_data_per_period[period_id].length;
    }

    function if_address_has_contributed_in(uint period_id, address user_address) view public returns (bool) {
        contributor_data_per_period[] memory data = contributors_data_per_period[period_id];
        for (uint i=0; i<data.length; i++) {
            if(data[i].user_address == user_address && data[i].wei_contribution > 0) {
                return true;
            }
        }
        return false;
    }

    function has_claimed_for_period(uint period_id, address user_address) view internal returns (bool) {
        contributor_data_per_period[] memory data = contributors_data_per_period[period_id];
        for (uint i=0; i<data.length; i++) {
            if(data[i].user_address == user_address && data[i].claimed) {
                return true;
            }
        }
        return false;
    }

    function set_wei_contribution(uint period_id, address user_address, uint256 wei_contribution) internal {
        contributor_data_per_period[] memory data = contributors_data_per_period[period_id];
        for (uint i=0; i<data.length; i++) {
            if(data[i].user_address == user_address) {
                contributors_data_per_period[period_id][i].wei_contribution = data[i].wei_contribution.add(wei_contribution);
            }
        }
    }

    function set_token_balance(uint period_id, address user_address, uint256 token_balance) internal {
        contributor_data_per_period[] memory data = contributors_data_per_period[period_id];
        for (uint i=0; i<data.length; i++) {
            if(data[i].user_address == user_address) {
                contributors_data_per_period[period_id][i].token_balance = data[i].token_balance.add(token_balance);
            }
        }
    }

    function set_claimed(uint period_id, address user_address, bool claimed) internal {
        contributor_data_per_period[] memory data = contributors_data_per_period[period_id];
        for (uint i=0; i<data.length; i++) {
            if(data[i].user_address == user_address) {
                contributors_data_per_period[period_id][i].claimed = claimed;
            }
        }
    }

    function set_new_period_duration(uint256 new_period_duration) public onlyOwner {
        require(new_period_duration > 0);
        _init_period_duration = new_period_duration;
    }

    function add_authorized_address(address _address, uint _percent, uint256 _total) public onlyOwner {
        require(_address != address(0));
        require(!wallets_authorized_to_claim[_address]);
        require(_percent > 0);
        require(_percent < 101);
        wallets_authorized_to_claim[_address] = true;
        wallets_authorized_percent[_address] = _percent;
        wallets_authorized_total[_address] = _total;
        wallets_authorized_total_claimed[_address] = 0;
        wallets_authorized_addresses.push(_address);
    }

    function update_authorized_address(address _address, uint _percent, uint256 _total, bool _status) public onlyOwner {
        require(_address != address(0));
        require(_percent > 0);
        require(_percent < 101);
        wallets_authorized_to_claim[_address] = _status;
        wallets_authorized_percent[_address] = _percent;
        wallets_authorized_total[_address] = _total;
    }

    function get_wallets_authorized_count() public view returns(uint) {
        return wallets_authorized_addresses.length;
    }

    function delete_authorized_address(address _address, uint _index) public onlyOwner {
        require(_address != address(0));
        wallets_authorized_to_claim[_address] = false;
        delete wallets_authorized_addresses[_index];
    }

    function get_wei_wei_contribution_per_period(uint256 period_id, address user_address) view internal returns (uint256) {
        contributor_data_per_period[] memory data = contributors_data_per_period[period_id];
        for (uint i=0; i<data.length; i++) {
            if(data[i].user_address == user_address) {
                return data[i].wei_contribution;
            }
        }
    }

    function get_contributor_data_per_period(uint256 period_id, address user_address) view external returns (address, uint256, uint256, bool) {
        contributor_data_per_period[] memory data = contributors_data_per_period[period_id];
        for (uint i=0; i<data.length; i++) {
            if(data[i].user_address == user_address) {
                return (data[i].user_address, data[i].token_balance, data[i].wei_contribution, data[i].claimed);
            }
        }
    }

    function () payable external {
        buy();
    }

    function buy() payable public {
        require(now >= _start_time_of_first_period);
        require(msg.sender != address(0));
        require(msg.value >= 0.01 ether);
        uint _now = now;

        if (if_address_has_contributed_in(_current_period, msg.sender) && _start_time_of_next_period > _now) {
            set_wei_contribution(_current_period, msg.sender, msg.value);
        }
        else if (!if_address_has_contributed_in(_current_period, msg.sender) && _start_time_of_next_period > _now) {
            contributors_data_per_period[_current_period].push(
                contributor_data_per_period(msg.sender, 0, msg.value, false)
            );
        }
        else {
            increment_period(_now);
            contributors_data_per_period[_current_period].push(
                contributor_data_per_period(msg.sender, 0, msg.value, false)
            );
        }

        _wei_raised = _wei_raised.add(msg.value);
    }

    function claim_period(uint256 period_id) public {
        require(msg.sender != address(0));
        uint256 _now = now;

        if (_now > _start_time_of_next_period) {
            increment_period(_now);
        }

        require(period_id < _current_period);

        if (if_address_has_contributed_in(period_id, msg.sender) && !has_claimed_for_period(period_id, msg.sender)) {
            uint256 _wei_raised_per_period = wei_raised_per_period(period_id);
            uint256 tokensAmount = _tokens_created_per_period.mul(1e18);
            uint256 tokensAmountDividedBy10 = tokensAmount.div(10);
            tokensAmount = tokensAmount.sub(tokensAmountDividedBy10);
            uint256 wei_contribution = get_wei_wei_contribution_per_period(period_id, msg.sender);
            uint256 token_balance = wei_contribution.mul(tokensAmount).div(_wei_raised_per_period);
            require(ERC20Mintable(address(_token)).mint(msg.sender, token_balance));
            set_token_balance(period_id, msg.sender, 10);
            set_claimed(period_id, msg.sender, true);
        }
    }

    function claim_all() public {
        for(uint i=0; i<_current_period; i++) {
            claim_period(i);
        }
    }

    function claim_range(uint from, uint to) public {
        for(uint i=from; i<=to; i++) {
            claim_period(i);
        }
    }

    function claim_authorized_address(uint256 amount) onlyOwner public {
        require(msg.sender != address(0));
        //require(_wallets_authorized_to_claim[msg.sender]);
        require(_amount_tokens_to_claimed >= amount);
        _amount_tokens_to_claimed = _amount_tokens_to_claimed.sub(amount);
        require(ERC20Mintable(address(_token)).mint(msg.sender, amount));
    }

    function claim_eth_authorized_address(uint256 amount) public {
        require(msg.sender != address(0));
        require(amount > 0);
        require(wallets_authorized_to_claim[msg.sender]);
        uint256 new_balance_of_wallet = wallets_authorized_total_claimed[msg.sender].add(amount);
        uint256 authorized_amount = address(this).balance.div(100).mul(wallets_authorized_percent[msg.sender]);
        require(authorized_amount >= new_balance_of_wallet);
        require(wallets_authorized_total[msg.sender]  >= new_balance_of_wallet);
        msg.sender.transfer(amount);
        wallets_authorized_total_claimed[msg.sender] = new_balance_of_wallet;
    }
}