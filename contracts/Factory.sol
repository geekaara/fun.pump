// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Token} from "./Token.sol";

contract Factory {
    uint256 public constant TARGET = 3 ether;
    uint256 public constant TOKEN_LIMIT = 500_000 ether;
    uint256 public immutable fee;
    address public owner;

    address[] public tokens;
    uint256 public totalSupply;
    mapping (address => TokenSale) public tokenToSale;

    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    event TokenCreated(address token);
    event Buy(address indexed token, uint256 amount);

    constructor(uint256 _fee) {
        fee = _fee; //state variable = local variable
        owner = msg.sender;
    }
    function getTokenSale(uint _index)public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }
    function getCost(uint256 _sold)public pure returns (uint256) {
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }
    //Arbitrary function
    // Token launchpad is called a factory contract because it can create new smart contracts
    function create(string memory _name, string memory _symbol)external payable {
        require(msg.value >= fee, "Factory: Creatro fee not paid");
        // Create new token
        Token token = new Token(msg.sender, _name, _symbol,  1_000_000 ether);
        // Save token
        tokens.push(address(token));
        totalSupply++;
        // List tolens for sale
        TokenSale memory sale = TokenSale(
            address(token),
            _name,
            msg.sender,
            0,
            0,
            true
        );
        tokenToSale[address(token)] = sale;

        // Tell its live
        emit TokenCreated(address(token));
    }
    function buy(address _token, uint256 _amount)external payable {
        TokenSale storage sale = tokenToSale[_token];
        // Check conditions
        require(sale.isOpen == true, "Factory: Sale is closed");
        require(_amount >= 1 ether, "Factory: Amount too low");
        require(_amount <= 10000 ether, "Factory: Amount exceeded");
        //Calculate price of a token upon total sold
        uint256 cost = getCost(sale.sold);
        uint256 price = cost * (_amount/ 10 ** 18);
        // Make sure enough eth is send
        require(msg.value >= price, "Factory: Not enough ETH");
        //Update sales
        sale.sold += _amount;
        sale.raised += price;
        // Check if sale is over
        if(sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET) {
            sale.isOpen = false;
        }
        Token(_token).transfer(msg.sender, _amount);
        // Emit an event
        emit Buy(_token, _amount);
    }
}
