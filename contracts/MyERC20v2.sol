//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @dev This contract is a simple Upgradable ERC20 Token.
 */
contract MyERC20v2 is ERC20Upgradeable {
    using SafeMath for uint256;

    /**
     * @dev Called by proxy for initializing.
     *
     * Calls initialize() on the base contract.
     *
     * @param data in bytes which includes tokenName and symbol name.
     */
    fallback(bytes calldata data) external payable returns( bytes memory r) {
        (string memory name, string memory symbol) = abi.decode(
            data,
            (string, string)
        );
        initialize(name, symbol);
        return bytes(data);
    }
    receive() external payable {
    }

    /**
     * @dev Initializes ERC20 constructor.
     *
     * @param name Token Name.
     * @param symbol Token Symbol Name.
     */
    function initialize(string memory name, string memory symbol)
        public
        initializer
    {
        __ERC20_init(name, symbol);
    }

    /**
     * @dev User can call mint with ETH to get same worth of token.
     */
    function mint() public payable {
        require(msg.value > 0, "ETH <= 0");
        _mint(msg.sender, msg.value);
    }

    /**
     * @dev User can call burn token and get 90% worth of ETH back.
     */
    function burn(uint256 amount) public {
        require(amount > 0, "ETH <= 0");
        // unlock 90% worth value of ETH
        uint256 amountToUnlock = amount.mul(0.9e18).div(1e18);
        _burn(msg.sender, amount);
        (bool sent, ) = address(msg.sender).call{value: amountToUnlock}("");
        require(sent, "Failed to send Ether");
    }
}
