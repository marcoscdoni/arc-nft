# 🚀 Guia Rápido de Deploy

## 1️⃣ Setup Inicial (5 minutos)

### Obtenha tokens testnet da Arc
1. Acesse: https://faucet.arc-testnet.circle.com
2. Cole seu endereço da MetaMask
3. Solicite tokens de teste

### Configure seu .env
```bash
cp .env.example .env
nano .env  # ou use seu editor favorito
```

Adicione sua private key:
```env
PRIVATE_KEY=0x_sua_private_key_aqui_SEM_COMPARTILHAR
ARC_TESTNET_RPC_URL=https://rpc.arc-testnet.circle.com
```

**⚠️ IMPORTANTE**: NUNCA compartilhe ou commite sua private key!

## 2️⃣ Deploy (2 minutos)

```bash
npm run deploy:testnet
```

Você verá algo como:
```
🚀 Iniciando deploy na Arc Testnet...
📍 Deploying com a conta: 0x742d...
💰 Saldo da conta: 1.5 ETH

📦 Deploying ArcNFT...
✅ ArcNFT deployed to: 0xABC123...

📦 Deploying ArcMarketplace...
✅ ArcMarketplace deployed to: 0xDEF456...

✨ Deploy concluído com sucesso!
```

Copie os endereços e atualize seu .env:
```env
NFT_CONTRACT_ADDRESS=0xABC123...
MARKETPLACE_CONTRACT_ADDRESS=0xDEF456...
```

## 3️⃣ Interaja e Acumule Atividades (Diariamente)

### Opção A: Script Automatizado
```bash
npm run interact
```

### Opção B: Console Interativo
```bash
npx hardhat console --network arcTestnet
```

```javascript
// Conecta aos contratos
const nft = await ethers.getContractAt("ArcNFT", process.env.NFT_CONTRACT_ADDRESS);
const marketplace = await ethers.getContractAt("ArcMarketplace", process.env.MARKETPLACE_CONTRACT_ADDRESS);

// 1. Mint NFT (primeiros 5 são grátis!)
await nft.mint("https://nft.arcgallery.xyz/metadata/1234567890-abc123.json");

// 2. Mint em batch (mais eficiente)
const uris = [
  "https://nft.arcgallery.xyz/metadata/1.json",
  "https://nft.arcgallery.xyz/metadata/2.json",
  "https://nft.arcgallery.xyz/metadata/3.json"
];
await nft.batchMint(uris);

// 3. Ver seus NFTs
const myTokens = await nft.tokensOfOwner("SEU_ENDERECO");
console.log("Meus NFTs:", myTokens.toString());

// 4. Aprovar marketplace
await nft.setApprovalForAll(process.env.MARKETPLACE_CONTRACT_ADDRESS, true);

// 5. Listar NFT para venda
const price = ethers.parseEther("0.1"); // 0.1 ETH
await marketplace.listItem(process.env.NFT_CONTRACT_ADDRESS, 1, price);

// 6. Fazer oferta em um NFT
await marketplace.makeOffer(
  process.env.NFT_CONTRACT_ADDRESS,
  2,
  86400, // 24 horas
  { value: ethers.parseEther("0.05") }
);

// 7. Criar leilão
await marketplace.createAuction(
  process.env.NFT_CONTRACT_ADDRESS,
  3,
  ethers.parseEther("0.01"), // preço inicial
  86400 // duração: 24h
);

// 8. Ver estatísticas
const totalSales = await marketplace.totalSales();
const totalVolume = await marketplace.totalVolume();
console.log(`Vendas: ${totalSales}, Volume: ${ethers.formatEther(totalVolume)} ETH`);
```

## 4️⃣ Atividades para Maximizar Elegibilidade

### 🎯 Checklist Diário (5-10 minutos)
- [ ] Mint 1-3 NFTs
- [ ] Liste 1-2 NFTs no marketplace
- [ ] Faça 1 oferta em NFTs de outros
- [ ] Participe de 1 leilão (se houver)
- [ ] Atualize preços de listagens

### 🏆 Atividades Semanais
- [ ] Mint batch de 5-10 NFTs
- [ ] Crie 2-3 leilões
- [ ] Compre NFTs de outros usuários
- [ ] Teste cancelamentos e modificações

### 💡 Dicas Pro
1. **Varie os horários**: Interaja em diferentes momentos do dia
2. **Use valores realistas**: Não liste por 0.00001 ETH
3. **Seja consistente**: Atividade regular > grande volume pontual
4. **Documente**: Salve hashes de transações importantes
5. **Participe da comunidade**: Discord, Twitter, fóruns

## 5️⃣ Verificação de Contratos (Opcional)

```bash
npx hardhat verify --network arcTestnet 0xABC123... # NFT
npx hardhat verify --network arcTestnet 0xDEF456... # Marketplace
```

## 📊 Monitoramento

### Ver suas transações
- Explorer: https://arcscan.net
- Cole seu endereço para ver histórico completo

### Verificar Gas Usado
```bash
npx hardhat test
# Veja o relatório de gas no final
```

## 🆘 Problemas Comuns

### "Insufficient funds"
→ Pegue mais tokens no faucet

### "Transaction underpriced"
→ Espere alguns minutos e tente novamente

### "Nonce too low"
→ Limpe histórico no MetaMask ou use outro endereço

### "Contract not deployed"
→ Verifique se copiou os endereços corretos no .env

## 📈 Métricas para Acompanhar

Crie um arquivo para registrar suas atividades:

```markdown
# Minhas Atividades na Arc Testnet

## Contratos Deployed
- NFT: 0xABC123...
- Marketplace: 0xDEF456...

## Estatísticas
- Total NFTs mintados: XX
- Total listados: XX
- Total vendas: XX
- Volume total: XX ETH
- Ofertas feitas: XX
- Leilões criados: XX

## Transações Importantes
- First mint: 0xHash1...
- First sale: 0xHash2...
- Maior venda: 0xHash3...
```

## 🎁 Extras

### Criar Metadata JSON (para R2/Cloudflare)
```json
{
  "name": "Arc Collection #1",
  "description": "Meu primeiro NFT na Arc Layer 1",
  "image": "https://nft.arcgallery.xyz/images/1234567890-abc123.png",
  "attributes": [
    {
      "trait_type": "Color",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Rare"
    }
  ]
}
```

### Storage de Arquivos
O projeto usa **Cloudflare R2** para armazenar imagens e metadados dos NFTs.
- Veja [R2_SETUP.md](../setup/R2_SETUP.md) para configuração completa
- Upload automático via frontend (`/create`)
- URLs públicas via domínio personalizado

---

**Divirta-se construindo na Arc Layer 1! 🚀**
