// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArcNFT
 * @dev NFT Contract (ERC721) optimized for Arc Layer 1
 * Features: Free minting, royalties, IPFS metadata
 */
contract ArcNFT is ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    
    uint256 private _tokenIdCounter;
    
    // Royalties (in basis points, 250 = 2.5%)
    uint96 public constant ROYALTY_FEE = 250;
    
    // Free mint limit per address
    uint256 public constant MAX_FREE_MINT_PER_ADDRESS = 5;
    
    // Mint price after free limit (0.01 ETH)
    uint256 public mintPrice = 0.01 ether;
    
    // Free mints tracking
    mapping(address => uint256) public freeMintCount;
    
    // Royalties per token (creator -> royalty percentage)
    mapping(uint256 => address) public tokenCreators;
    mapping(uint256 => uint96) public tokenRoyalties;
    
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,
        uint96 royaltyFee
    );
    
    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 amount
    );
    
    constructor() ERC721("Arc NFT Collection", "ARCNFT") Ownable(msg.sender) {}
    
    /**
     * @dev Mint NFT (free up to limit)
     * @param tokenURI Metadata URI (IPFS or other)
     */
    function mint(string memory tokenURI) public payable nonReentrant returns (uint256) {
        uint256 currentFreeMints = freeMintCount[msg.sender];
        
        // Check if payment is required
        if (currentFreeMints >= MAX_FREE_MINT_PER_ADDRESS) {
            require(msg.value >= mintPrice, "Insufficient payment for mint");
        } else {
            freeMintCount[msg.sender]++;
        }
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Set up royalties
        tokenCreators[newTokenId] = msg.sender;
        tokenRoyalties[newTokenId] = ROYALTY_FEE;
        
        emit NFTMinted(newTokenId, msg.sender, tokenURI, ROYALTY_FEE);
        
        return newTokenId;
    }
    
    /**
     * @dev Batch mint (multiple NFTs)
     */
    function batchMint(string[] memory tokenURIs) public payable nonReentrant returns (uint256[] memory) {
        uint256 count = tokenURIs.length;
        require(count > 0 && count <= 20, "Invalid batch size");
        
        uint256 currentFreeMints = freeMintCount[msg.sender];
        uint256 freeMints = 0;
        uint256 paidMints = 0;
        
        if (currentFreeMints < MAX_FREE_MINT_PER_ADDRESS) {
            freeMints = MAX_FREE_MINT_PER_ADDRESS - currentFreeMints;
            if (freeMints > count) freeMints = count;
        }
        
        paidMints = count - freeMints;
        require(msg.value >= paidMints * mintPrice, "Insufficient payment");
        
        uint256[] memory tokenIds = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            _tokenIdCounter++;
            uint256 newTokenId = _tokenIdCounter;
            
            _safeMint(msg.sender, newTokenId);
            _setTokenURI(newTokenId, tokenURIs[i]);
            
            tokenCreators[newTokenId] = msg.sender;
            tokenRoyalties[newTokenId] = ROYALTY_FEE;
            tokenIds[i] = newTokenId;
            
            emit NFTMinted(newTokenId, msg.sender, tokenURIs[i], ROYALTY_FEE);
        }
        
        if (freeMints > 0) {
            freeMintCount[msg.sender] += freeMints;
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Calculate royalty for a sale
     */
    function calculateRoyalty(uint256 tokenId, uint256 salePrice) 
        public 
        view 
        returns (address creator, uint256 royaltyAmount) 
    {
        creator = tokenCreators[tokenId];
        uint96 royaltyFee = tokenRoyalties[tokenId];
        royaltyAmount = (salePrice * royaltyFee) / 10000;
        return (creator, royaltyAmount);
    }
    
    /**
     * @dev Returns all tokens of an address
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Total NFTs minted
     */
    function totalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Update mint price (owner only)
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }
    
    /**
     * @dev Withdraw funds (owner only)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // Overrides required for compatibility
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
