// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ArcNFT.sol";

/**
 * @title ArcMarketplace
 * @dev Complete NFT Marketplace for Arc Layer 1
 * Features: Listings, Buy/Sell, Offers, Auctions, Automatic royalties
 */
contract ArcMarketplace is ReentrancyGuard, Ownable {
    
    // Marketplace fee (2.5%)
    uint256 public platformFee = 250; // basis points (250 = 2.5%)
    
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    
    struct Offer {
        address buyer;
        uint256 price;
        uint256 expiresAt;
        bool active;
    }
    
    struct Auction {
        address seller;
        uint256 startPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool active;
    }
    
    // NFT address -> Token ID -> Listing
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    // NFT address -> Token ID -> Buyer address -> Offer
    mapping(address => mapping(uint256 => mapping(address => Offer))) public offers;
    
    // NFT address -> Token ID -> Auction
    mapping(address => mapping(uint256 => Auction)) public auctions;
    
    // Sales tracking for statistics
    uint256 public totalSales;
    uint256 public totalVolume;
    
    // Events
    event ItemListed(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    
    event ItemSold(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price
    );
    
    event ListingCancelled(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller
    );
    
    event OfferMade(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price,
        uint256 expiresAt
    );
    
    event OfferAccepted(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price
    );
    
    event OfferCancelled(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed buyer
    );
    
    event AuctionCreated(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 startPrice,
        uint256 endTime
    );
    
    event BidPlaced(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionEnded(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed winner,
        uint256 amount
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev List an NFT for sale
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) public nonReentrant {
        require(price > 0, "Price must be greater than 0");
        
        IERC721 nft = IERC721(nftAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        listings[nftAddress][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });
        
        emit ItemListed(nftAddress, tokenId, msg.sender, price);
    }
    
    /**
     * @dev Buy a listed NFT
     */
    function buyItem(address nftAddress, uint256 tokenId) 
        public 
        payable 
        nonReentrant 
    {
        Listing memory listing = listings[nftAddress][tokenId];
        require(listing.active, "Item not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        
        listings[nftAddress][tokenId].active = false;
        
        // Calculate and distribute payments
        _distributeFunds(nftAddress, tokenId, listing.seller, listing.price);
        
        // Transfer NFT
        IERC721(nftAddress).safeTransferFrom(listing.seller, msg.sender, tokenId);
        
        totalSales++;
        totalVolume += listing.price;
        
        emit ItemSold(nftAddress, tokenId, listing.seller, msg.sender, listing.price);
        
        // Return excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
    }
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(address nftAddress, uint256 tokenId) public {
        Listing memory listing = listings[nftAddress][tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.active, "Listing not active");
        
        listings[nftAddress][tokenId].active = false;
        
        emit ListingCancelled(nftAddress, tokenId, msg.sender);
    }
    
    /**
     * @dev Make an offer on an NFT
     */
    function makeOffer(
        address nftAddress,
        uint256 tokenId,
        uint256 duration
    ) public payable nonReentrant {
        require(msg.value > 0, "Offer must be greater than 0");
        require(duration >= 1 hours && duration <= 30 days, "Invalid duration");
        
        // Cancel previous offer if exists
        Offer storage existingOffer = offers[nftAddress][tokenId][msg.sender];
        if (existingOffer.active) {
            existingOffer.active = false;
            payable(msg.sender).transfer(existingOffer.price);
        }
        
        uint256 expiresAt = block.timestamp + duration;
        
        offers[nftAddress][tokenId][msg.sender] = Offer({
            buyer: msg.sender,
            price: msg.value,
            expiresAt: expiresAt,
            active: true
        });
        
        emit OfferMade(nftAddress, tokenId, msg.sender, msg.value, expiresAt);
    }
    
    /**
     * @dev Accept an offer
     */
    function acceptOffer(
        address nftAddress,
        uint256 tokenId,
        address buyer
    ) public nonReentrant {
        IERC721 nft = IERC721(nftAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        
        Offer memory offer = offers[nftAddress][tokenId][buyer];
        require(offer.active, "Offer not active");
        require(block.timestamp <= offer.expiresAt, "Offer expired");
        
        offers[nftAddress][tokenId][buyer].active = false;
        
        // Distribute payments
        _distributeFunds(nftAddress, tokenId, msg.sender, offer.price);
        
        // Transfer NFT
        nft.safeTransferFrom(msg.sender, buyer, tokenId);
        
        // Cancel listing if exists
        if (listings[nftAddress][tokenId].active) {
            listings[nftAddress][tokenId].active = false;
        }
        
        totalSales++;
        totalVolume += offer.price;
        
        emit OfferAccepted(nftAddress, tokenId, msg.sender, buyer, offer.price);
    }
    
    /**
     * @dev Cancel an offer
     */
    function cancelOffer(address nftAddress, uint256 tokenId) public nonReentrant {
        Offer memory offer = offers[nftAddress][tokenId][msg.sender];
        require(offer.active, "No active offer");
        
        offers[nftAddress][tokenId][msg.sender].active = false;
        payable(msg.sender).transfer(offer.price);
        
        emit OfferCancelled(nftAddress, tokenId, msg.sender);
    }
    
    /**
     * @dev Create an auction
     */
    function createAuction(
        address nftAddress,
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration
    ) public nonReentrant {
        require(startPrice > 0, "Start price must be greater than 0");
        require(duration >= 1 hours && duration <= 7 days, "Invalid duration");
        
        IERC721 nft = IERC721(nftAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        uint256 endTime = block.timestamp + duration;
        
        auctions[nftAddress][tokenId] = Auction({
            seller: msg.sender,
            startPrice: startPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: endTime,
            active: true
        });
        
        emit AuctionCreated(nftAddress, tokenId, msg.sender, startPrice, endTime);
    }
    
    /**
     * @dev Place a bid on auction
     */
    function placeBid(address nftAddress, uint256 tokenId) 
        public 
        payable 
        nonReentrant 
    {
        Auction storage auction = auctions[nftAddress][tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value >= auction.startPrice, "Bid below start price");
        require(msg.value > auction.highestBid, "Bid not high enough");
        
        // Return previous bid
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }
        
        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;
        
        emit BidPlaced(nftAddress, tokenId, msg.sender, msg.value);
    }
    
    /**
     * @dev End an auction
     */
    function endAuction(address nftAddress, uint256 tokenId) public nonReentrant {
        Auction storage auction = auctions[nftAddress][tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        
        auction.active = false;
        
        if (auction.highestBidder != address(0)) {
            // Distribute payments
            _distributeFunds(
                nftAddress,
                tokenId,
                auction.seller,
                auction.highestBid
            );
            
            // Transfer NFT
            IERC721(nftAddress).safeTransferFrom(
                auction.seller,
                auction.highestBidder,
                tokenId
            );
            
            totalSales++;
            totalVolume += auction.highestBid;
            
            emit AuctionEnded(nftAddress, tokenId, auction.highestBidder, auction.highestBid);
        } else {
            emit AuctionEnded(nftAddress, tokenId, address(0), 0);
        }
    }
    
    /**
     * @dev Distribute payments (royalties + platform fee)
     */
    function _distributeFunds(
        address nftAddress,
        uint256 tokenId,
        address seller,
        uint256 price
    ) private {
        uint256 remaining = price;
        
        // Try to pay royalties (if ArcNFT)
        try ArcNFT(nftAddress).calculateRoyalty(tokenId, price) returns (
            address creator,
            uint256 royaltyAmount
        ) {
            if (creator != address(0) && creator != seller && royaltyAmount > 0) {
                payable(creator).transfer(royaltyAmount);
                remaining -= royaltyAmount;
            }
        } catch {
            // NFT doesn't support royalties, continue
        }
        
        // Platform fee
        uint256 fee = (price * platformFee) / 10000;
        payable(owner()).transfer(fee);
        remaining -= fee;
        
        // Seller receives the rest
        payable(seller).transfer(remaining);
    }
    
    /**
     * @dev Update platform fee (owner only)
     */
    function setPlatformFee(uint256 newFee) public onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Maximum 10%
        platformFee = newFee;
    }
    
    /**
     * @dev Returns listing information
     */
    function getListing(address nftAddress, uint256 tokenId)
        public
        view
        returns (Listing memory)
    {
        return listings[nftAddress][tokenId];
    }
    
    /**
     * @dev Returns offer information
     */
    function getOffer(address nftAddress, uint256 tokenId, address buyer)
        public
        view
        returns (Offer memory)
    {
        return offers[nftAddress][tokenId][buyer];
    }
    
    /**
     * @dev Returns auction information
     */
    function getAuction(address nftAddress, uint256 tokenId)
        public
        view
        returns (Auction memory)
    {
        return auctions[nftAddress][tokenId];
    }
}
