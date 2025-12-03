import { expect } from "chai";
import { ethers } from "hardhat";
import { ArcNFT, ArcMarketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ArcMarketplace", function () {
  let nft: ArcNFT;
  let marketplace: ArcMarketplace;
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  let creator: SignerWithAddress;

  beforeEach(async function () {
    [owner, seller, buyer, creator] = await ethers.getSigners();
    
    const ArcNFT = await ethers.getContractFactory("ArcNFT");
    nft = await ArcNFT.deploy();
    await nft.waitForDeployment();

    const ArcMarketplace = await ethers.getContractFactory("ArcMarketplace");
    marketplace = await ArcMarketplace.deploy();
    await marketplace.waitForDeployment();

    // Mint NFT para seller
    await nft.connect(seller).mint("ipfs://test");
    await nft.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);
  });

  describe("Listings", function () {
    it("Should list an NFT", async function () {
      const price = ethers.parseEther("1");
      
      await expect(marketplace.connect(seller).listItem(await nft.getAddress(), 1, price))
        .to.emit(marketplace, "ItemListed")
        .withArgs(await nft.getAddress(), 1, seller.address, price);
      
      const listing = await marketplace.getListing(await nft.getAddress(), 1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.be.true;
    });

    it("Should not allow listing without ownership", async function () {
      await expect(
        marketplace.connect(buyer).listItem(await nft.getAddress(), 1, ethers.parseEther("1"))
      ).to.be.revertedWith("Not the owner");
    });

    it("Should buy a listed NFT", async function () {
      const price = ethers.parseEther("1");
      await marketplace.connect(seller).listItem(await nft.getAddress(), 1, price);
      
      await expect(
        marketplace.connect(buyer).buyItem(await nft.getAddress(), 1, { value: price })
      ).to.emit(marketplace, "ItemSold");
      
      expect(await nft.ownerOf(1)).to.equal(buyer.address);
    });

    it("Should cancel a listing", async function () {
      const price = ethers.parseEther("1");
      await marketplace.connect(seller).listItem(await nft.getAddress(), 1, price);
      
      await expect(marketplace.connect(seller).cancelListing(await nft.getAddress(), 1))
        .to.emit(marketplace, "ListingCancelled");
      
      const listing = await marketplace.getListing(await nft.getAddress(), 1);
      expect(listing.active).to.be.false;
    });
  });

  describe("Offers", function () {
    it("Should make an offer", async function () {
      const offerPrice = ethers.parseEther("0.5");
      const duration = 24 * 60 * 60; // 24 hours
      
      await expect(
        marketplace.connect(buyer).makeOffer(await nft.getAddress(), 1, duration, { value: offerPrice })
      ).to.emit(marketplace, "OfferMade");
      
      const offer = await marketplace.getOffer(await nft.getAddress(), 1, buyer.address);
      expect(offer.buyer).to.equal(buyer.address);
      expect(offer.price).to.equal(offerPrice);
      expect(offer.active).to.be.true;
    });

    it("Should accept an offer", async function () {
      const offerPrice = ethers.parseEther("0.5");
      const duration = 24 * 60 * 60;
      
      await marketplace.connect(buyer).makeOffer(await nft.getAddress(), 1, duration, { value: offerPrice });
      
      await expect(
        marketplace.connect(seller).acceptOffer(await nft.getAddress(), 1, buyer.address)
      ).to.emit(marketplace, "OfferAccepted");
      
      expect(await nft.ownerOf(1)).to.equal(buyer.address);
    });

    it("Should cancel an offer and refund", async function () {
      const offerPrice = ethers.parseEther("0.5");
      const duration = 24 * 60 * 60;
      
      await marketplace.connect(buyer).makeOffer(await nft.getAddress(), 1, duration, { value: offerPrice });
      
      const balanceBefore = await ethers.provider.getBalance(buyer.address);
      await marketplace.connect(buyer).cancelOffer(await nft.getAddress(), 1);
      const balanceAfter = await ethers.provider.getBalance(buyer.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should not accept expired offer", async function () {
      const offerPrice = ethers.parseEther("0.5");
      const duration = 1 * 60 * 60; // 1 hour
      
      await marketplace.connect(buyer).makeOffer(await nft.getAddress(), 1, duration, { value: offerPrice });
      
      // Avança o tempo 2 horas
      await time.increase(2 * 60 * 60);
      
      await expect(
        marketplace.connect(seller).acceptOffer(await nft.getAddress(), 1, buyer.address)
      ).to.be.revertedWith("Offer expired");
    });
  });

  describe("Auctions", function () {
    it("Should create an auction", async function () {
      const startPrice = ethers.parseEther("0.5");
      const duration = 24 * 60 * 60;
      
      await expect(
        marketplace.connect(seller).createAuction(await nft.getAddress(), 1, startPrice, duration)
      ).to.emit(marketplace, "AuctionCreated");
      
      const auction = await marketplace.getAuction(await nft.getAddress(), 1);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.startPrice).to.equal(startPrice);
      expect(auction.active).to.be.true;
    });

    it("Should place a bid", async function () {
      const startPrice = ethers.parseEther("0.5");
      const duration = 24 * 60 * 60;
      
      await marketplace.connect(seller).createAuction(await nft.getAddress(), 1, startPrice, duration);
      
      const bidAmount = ethers.parseEther("1");
      await expect(
        marketplace.connect(buyer).placeBid(await nft.getAddress(), 1, { value: bidAmount })
      ).to.emit(marketplace, "BidPlaced");
      
      const auction = await marketplace.getAuction(await nft.getAddress(), 1);
      expect(auction.highestBidder).to.equal(buyer.address);
      expect(auction.highestBid).to.equal(bidAmount);
    });

    it("Should end auction and transfer NFT to highest bidder", async function () {
      const startPrice = ethers.parseEther("0.5");
      const duration = 1 * 60 * 60; // 1 hour
      
      await marketplace.connect(seller).createAuction(await nft.getAddress(), 1, startPrice, duration);
      await marketplace.connect(buyer).placeBid(await nft.getAddress(), 1, { value: ethers.parseEther("1") });
      
      // Avança o tempo
      await time.increase(2 * 60 * 60);
      
      await expect(marketplace.endAuction(await nft.getAddress(), 1))
        .to.emit(marketplace, "AuctionEnded");
      
      expect(await nft.ownerOf(1)).to.equal(buyer.address);
    });
  });

  describe("Royalties and Fees", function () {
    it("Should distribute royalties on sale", async function () {
      const price = ethers.parseEther("1");
      await marketplace.connect(seller).listItem(await nft.getAddress(), 1, price);
      
      const creatorBalanceBefore = await ethers.provider.getBalance(seller.address);
      
      await marketplace.connect(buyer).buyItem(await nft.getAddress(), 1, { value: price });
      
      // Creator (seller neste caso) deve receber menos que o preço total devido a fees
      const creatorBalanceAfter = await ethers.provider.getBalance(seller.address);
      const received = creatorBalanceAfter - creatorBalanceBefore;
      
      // Deve receber menos que 1 ETH devido a platform fee
      expect(received).to.be.lt(price);
    });

    it("Should update platform fee", async function () {
      const newFee = 500; // 5%
      await marketplace.setPlatformFee(newFee);
      expect(await marketplace.platformFee()).to.equal(newFee);
    });

    it("Should not allow platform fee > 10%", async function () {
      await expect(marketplace.setPlatformFee(1001)).to.be.revertedWith("Fee too high");
    });
  });

  describe("Statistics", function () {
    it("Should track total sales and volume", async function () {
      const price = ethers.parseEther("1");
      await marketplace.connect(seller).listItem(await nft.getAddress(), 1, price);
      await marketplace.connect(buyer).buyItem(await nft.getAddress(), 1, { value: price });
      
      expect(await marketplace.totalSales()).to.equal(1);
      expect(await marketplace.totalVolume()).to.equal(price);
    });
  });
});
