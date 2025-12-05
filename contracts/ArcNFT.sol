// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArcNFT
 * @dev NFT Contract optimized for Arc Layer 1 - Part of ArcGallery
 * Main features: free minting (first 5), royalties, batch mint
 * @author Built for Arc ecosystem
 */
contract ArcNFT is ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    
    uint256 private _tokenIdCounter;
    
    // Royalty fee in basis points (250 = 2.5%)
    uint96 public constant ROYALTY_FEE = 250;
    
    // Free mint limit - first 5 NFTs are free per wallet
    uint256 public constant MAX_FREE_MINT_PER_ADDRESS = 5;
    
    // Price after free mints (0.01 ETH)
    uint256 public mintPrice = 0.01 ether;
    
    // Track how many free mints each address used
    mapping(address => uint256) public freeMintCount;
    
    // Store creator info for royalty payments
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
     * @dev Mint a single NFT - free for first 5, then costs 0.01 ETH
     * @param tokenURI The metadata URI (usually IPFS)
     */
    function mint(string memory tokenURI) public payable nonReentrant returns (uint256) {
        uint256 currentFreeMints = freeMintCount[msg.sender];
        
        // Check if user needs to pay
        if (currentFreeMints >= MAX_FREE_MINT_PER_ADDRESS) {
            require(msg.value >= mintPrice, "Insufficient payment for mint");
            
            // Refund excess payment if any
            if (msg.value > mintPrice) {
                payable(msg.sender).transfer(msg.value - mintPrice);
            }
        } else {
            // increment free mint counter
            freeMintCount[msg.sender]++;
            
            // refund if they sent ETH by mistake on free mint
            if (msg.value > 0) {
                payable(msg.sender).transfer(msg.value);
            }
        }
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Setup royalties for this token
        tokenCreators[newTokenId] = msg.sender;
        tokenRoyalties[newTokenId] = ROYALTY_FEE;
        
        emit NFTMinted(newTokenId, msg.sender, tokenURI, ROYALTY_FEE);
        
        return newTokenId;
    }
    
    /**
     * @dev Batch mint - mint multiple NFTs in one transaction (saves gas)
     * Max 20 NFTs per batch to avoid gas issues
     */
    function batchMint(string[] memory tokenURIs) public payable nonReentrant returns (uint256[] memory) {
        uint256 count = tokenURIs.length;
        require(count > 0 && count <= 20, "Invalid batch size");
        
        uint256 currentFreeMints = freeMintCount[msg.sender];
        uint256 freeMints = 0;
        uint256 paidMints = 0;
        
        // calculate how many are free vs paid
        if (currentFreeMints < MAX_FREE_MINT_PER_ADDRESS) {
            freeMints = MAX_FREE_MINT_PER_ADDRESS - currentFreeMints;
            if (freeMints > count) freeMints = count;
        }
        
        paidMints = count - freeMints;
        uint256 totalCost = paidMints * mintPrice;
        require(msg.value >= totalCost, "Insufficient payment");
        
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
        
        // update free mint counter
        if (freeMints > 0) {
            freeMintCount[msg.sender] += freeMints;
        }
        
        // refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get royalty info for a sale
     * Returns the creator address and how much they should receive
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
     * @dev Get all token IDs owned by an address
     * Useful for displaying user's NFTs in frontend
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
     * @dev Returns total number of NFTs minted so far
     */
    function totalMinted() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Update mint price - only owner can call this
     * Useful if we need to adjust pricing based on market
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        mintPrice = newPrice;
    }
    
    /**
     * @dev Withdraw accumulated funds to owner
     * This is the mint fees collected
     */
    function withdraw() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
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
