// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Token} from "./Token.sol";

contract Factory {
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

    constructor(uint256 _fee) {
        fee = _fee; //state variable = local variable
        owner = msg.sender;
    }
    function getTokenSale(uint _index)public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
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
}
