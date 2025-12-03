# 📝 Cheat Sheet - Comandos Úteis

## 🚀 Setup Inicial

```bash
# Instalar dependências
npm install

# Compilar contratos
npm run compile

# Rodar testes
npm test

# Testes com relatório de gas
npm run test:gas

# Limpar cache
npm run clean
```

## 🔧 Configuração

```bash
# Copiar exemplo de .env
cp .env.example .env

# Editar .env
nano .env  # ou code .env

# Verificar configuração
npm run check
```

## 🌐 Deploy

```bash
# Deploy na Arc Testnet
npm run deploy:testnet

# Deploy local (para testes)
npm run deploy:local

# Verificar contratos no explorer
npm run verify -- <CONTRACT_ADDRESS>
```

## 🎨 Interações Rápidas

```bash
# Mint e listar NFT
npm run interact

# Batch mint (múltiplos NFTs)
npm run batch-mint

# Criar leilão
npm run auction

# Ver estatísticas
npm run stats

# Console interativo
npm run console
```

## 💻 Console Hardhat

```bash
# Abrir console
npx hardhat console --network arcTestnet

# Ou use o atalho
npm run console
```

### Comandos no Console

```javascript
// Obter signers
const [signer] = await ethers.getSigners();
console.log("Endereço:", signer.address);

// Conectar ao NFT
const nft = await ethers.getContractAt("ArcNFT", "SEU_NFT_ADDRESS");

// Conectar ao Marketplace
const marketplace = await ethers.getContractAt("ArcMarketplace", "SEU_MARKETPLACE_ADDRESS");

// Mint NFT
await nft.mint("ipfs://seu_uri");

// Batch mint
await nft.batchMint(["uri1", "uri2", "uri3"]);

// Aprovar marketplace
await nft.setApprovalForAll("MARKETPLACE_ADDRESS", true);

// Listar NFT
const price = ethers.parseEther("0.1");
await marketplace.listItem("NFT_ADDRESS", 1, price);

// Comprar NFT
await marketplace.buyItem("NFT_ADDRESS", 1, { value: price });

// Fazer oferta
await marketplace.makeOffer("NFT_ADDRESS", 1, 86400, { 
  value: ethers.parseEther("0.05") 
});

// Criar leilão
await marketplace.createAuction("NFT_ADDRESS", 1, ethers.parseEther("0.01"), 86400);

// Dar lance
await marketplace.placeBid("NFT_ADDRESS", 1, { 
  value: ethers.parseEther("0.02") 
});

// Ver seus NFTs
const tokens = await nft.tokensOfOwner(signer.address);
console.log("Seus NFTs:", tokens.toString());

// Ver saldo
const balance = await nft.balanceOf(signer.address);
console.log("Total NFTs:", balance.toString());

// Ver listagem
const listing = await marketplace.getListing("NFT_ADDRESS", 1);
console.log("Preço:", ethers.formatEther(listing.price));

// Ver estatísticas
const totalSales = await marketplace.totalSales();
const totalVolume = await marketplace.totalVolume();
console.log("Vendas:", totalSales.toString());
console.log("Volume:", ethers.formatEther(totalVolume), "ETH");
```

## 🔍 Queries e Leituras

```javascript
// Total de NFTs mintados
await nft.totalMinted()

// Preço de mint
await nft.mintPrice()

// Mints gratuitos usados
await nft.freeMintCount("ENDERECO")

// Criador de um token
await nft.tokenCreators(tokenId)

// Royalties de um token
await nft.calculateRoyalty(tokenId, ethers.parseEther("1"))

// Taxa da plataforma
await marketplace.platformFee()

// Detalhes de leilão
await marketplace.getAuction("NFT_ADDRESS", tokenId)

// Detalhes de oferta
await marketplace.getOffer("NFT_ADDRESS", tokenId, "BUYER_ADDRESS")
```

## 📊 Utilities

```bash
# Ver rede atual
npx hardhat run --network arcTestnet -c "console.log(await ethers.provider.getNetwork())"

# Ver saldo
npx hardhat run scripts/check-balance.ts --network arcTestnet

# Compilar e rodar testes
npm run clean && npm run compile && npm test
```

## 🐛 Debugging

```bash
# Compilar com stack traces
npx hardhat compile --show-stack-traces

# Rodar teste específico
npx hardhat test test/ArcNFT.test.ts

# Rodar com verbosidade
npx hardhat test --verbose

# Ver eventos emitidos
# No código de teste, adicione:
const receipt = await tx.wait();
console.log("Events:", receipt.logs);
```

## 🔐 Segurança

```bash
# Verificar private key no .env
grep PRIVATE_KEY .env

# Verificar se .env está no .gitignore
cat .gitignore | grep .env

# Limpar histórico sensível (se commitou acidentalmente)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

## 📦 Package Management

```bash
# Instalar dependência
npm install <package>

# Instalar dev dependency
npm install -D <package>

# Atualizar dependências
npm update

# Audit de segurança
npm audit

# Fix vulnerabilidades
npm audit fix
```

## 🌐 Network Helpers

```javascript
// Avançar tempo (em testes)
import { time } from "@nomicfoundation/hardhat-network-helpers";
await time.increase(3600); // 1 hora

// Minar blocos
await network.provider.send("hardhat_mine", ["0x100"]); // 256 blocos

// Snapshot e revert (útil em testes)
const snapshot = await network.provider.send("evm_snapshot");
// ... fazer mudanças ...
await network.provider.send("evm_revert", [snapshot]);
```

## 🎯 Conversões Úteis

```javascript
// ETH para Wei
ethers.parseEther("1.5")  // 1.5 ETH

// Wei para ETH
ethers.formatEther(wei)

// String para bytes32
ethers.encodeBytes32String("texto")

// Bytes32 para string
ethers.decodeBytes32String(bytes)

// Formatar address
ethers.getAddress("0xabc...")  // Checksum address

// Gerar hash
ethers.keccak256(ethers.toUtf8Bytes("texto"))
```

## 📝 Git Workflow

```bash
# Status
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: adiciona funcionalidade X"

# Push
git push origin main

# Criar branch
git checkout -b feature/nova-funcionalidade

# Ver diferenças
git diff
```

## 🔗 Links Rápidos

```bash
# Abrir explorer
xdg-open "https://arcscan.net/address/SEU_ENDERECO"

# Abrir faucet
xdg-open "https://faucet.arc-testnet.circle.com"

# Ver documentação
xdg-open "https://developers.circle.com/arc"
```

## ⚡ Atalhos Personalizados

Adicione ao seu `.bashrc` ou `.zshrc`:

```bash
# Atalhos Arc
alias arc-deploy='npm run deploy:testnet'
alias arc-test='npm test'
alias arc-console='npm run console'
alias arc-check='npm run check'
alias arc-stats='npm run stats'
alias arc-mint='npm run batch-mint'
alias arc-compile='npm run compile'
```

Depois execute: `source ~/.bashrc` (ou `~/.zshrc`)

Agora pode usar:
```bash
arc-deploy
arc-test
arc-mint
```

## 💡 Dicas Rápidas

```bash
# Ver logs em tempo real (se tiver servidor rodando)
tail -f logs/hardhat.log

# Procurar por texto em contratos
grep -r "função" contracts/

# Contar linhas de código
find contracts -name "*.sol" | xargs wc -l

# Ver tamanho dos contratos compilados
du -sh artifacts/

# Backup rápido
tar -czf backup-$(date +%Y%m%d).tar.gz contracts/ scripts/ test/
```

---

**💪 Bora desenvolver na Arc! 🚀**
