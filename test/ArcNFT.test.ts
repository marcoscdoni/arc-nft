import { expect } from "chai";
import { ethers } from "hardhat";
import { ArcNFT, ArcMarketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ArcNFT", function () {
  let nft: ArcNFT;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const ArcNFT = await ethers.getContractFactory("ArcNFT");
    nft = await ArcNFT.deploy();
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await nft.name()).to.equal("Arc NFT Collection");
      expect(await nft.symbol()).to.equal("ARCNFT");
    });
  });

  describe("Minting", function () {
    it("Should mint NFT for free (first 5)", async function () {
      const tokenURI = "ipfs://test1";
      
      await expect(nft.connect(user1).mint(tokenURI))
        .to.emit(nft, "NFTMinted");
      
      expect(await nft.ownerOf(1)).to.equal(user1.address);
      expect(await nft.tokenURI(1)).to.equal(tokenURI);
      expect(await nft.freeMintCount(user1.address)).to.equal(1);
    });

    it("Should require payment after free mints", async function () {
      // Minta 5 NFTs grátis
      for (let i = 0; i < 5; i++) {
        await nft.connect(user1).mint(`ipfs://test${i}`);
      }

      // 6º deve requerer pagamento
      const mintPrice = await nft.mintPrice();
      await expect(
        nft.connect(user1).mint("ipfs://test6")
      ).to.be.revertedWith("Insufficient payment for mint");

      // Com pagamento deve funcionar
      await expect(
        nft.connect(user1).mint("ipfs://test6", { value: mintPrice })
      ).to.emit(nft, "NFTMinted");
    });

    it("Should batch mint correctly", async function () {
      const uris = ["ipfs://1", "ipfs://2", "ipfs://3"];
      
      await expect(nft.connect(user1).batchMint(uris))
        .to.emit(nft, "NFTMinted");
      
      expect(await nft.balanceOf(user1.address)).to.equal(3);
    });
  });

  describe("Royalties", function () {
    it("Should calculate royalties correctly", async function () {
      await nft.connect(user1).mint("ipfs://test");
      
      const salePrice = ethers.parseEther("1");
      const [creator, royaltyAmount] = await nft.calculateRoyalty(1, salePrice);
      
      expect(creator).to.equal(user1.address);
      // 2.5% de 1 ETH = 0.025 ETH
      expect(royaltyAmount).to.equal(ethers.parseEther("0.025"));
    });
  });

  describe("Token Management", function () {
    it("Should return tokens of owner", async function () {
      await nft.connect(user1).mint("ipfs://1");
      await nft.connect(user1).mint("ipfs://2");
      
      const tokens = await nft.tokensOfOwner(user1.address);
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.equal(1);
      expect(tokens[1]).to.equal(2);
    });

    it("Should track total minted", async function () {
      await nft.connect(user1).mint("ipfs://1");
      await nft.connect(user2).mint("ipfs://2");
      
      expect(await nft.totalMinted()).to.equal(2);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.02");
      await nft.setMintPrice(newPrice);
      expect(await nft.mintPrice()).to.equal(newPrice);
    });

    it("Should not allow non-owner to update mint price", async function () {
      await expect(
        nft.connect(user1).setMintPrice(ethers.parseEther("0.02"))
      ).to.be.reverted;
    });

    it("Should allow owner to withdraw funds", async function () {
      // User mints paid NFT
      for (let i = 0; i < 6; i++) {
        if (i < 5) {
          await nft.connect(user1).mint(`ipfs://${i}`);
        } else {
          const mintPrice = await nft.mintPrice();
          await nft.connect(user1).mint(`ipfs://${i}`, { value: mintPrice });
        }
      }

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await nft.withdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});
