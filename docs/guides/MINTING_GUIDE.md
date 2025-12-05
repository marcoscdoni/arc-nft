# NFT Minting - Guia de Configuração

## 🚀 Como Configurar o Mint Real

### 1. Deploy dos Contratos

Primeiro, faça o deploy dos contratos na rede Arc testnet:

```bash
# No diretório raiz do projeto
cd /home/marcos/Projetos/arc-nft

# Deploy dos contratos
npx hardhat run scripts/deploy.ts --network arc_testnet
```

Anote os endereços dos contratos deployados.

### 2. Atualizar Endereços dos Contratos

Edite o arquivo `frontend/lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  NFT: '0xSEU_ENDERECO_NFT_AQUI',
  MARKETPLACE: '0xSEU_ENDERECO_MARKETPLACE_AQUI',
}
```

### 3. Configurar Cloudflare R2

Siga o guia completo em [R2_SETUP.md](../setup/R2_SETUP.md) para configurar o armazenamento de imagens e metadados.

Principais passos:
1. Criar bucket no Cloudflare R2
2. Configurar domínio público (ou usar R2.dev)
3. Gerar API tokens
4. Adicionar credenciais no `.env.local`

### 4. WalletConnect (Opcional mas Recomendado)

Para melhor suporte a carteiras móveis:

1. Crie um projeto em: https://cloud.walletconnect.com/
2. Adicione o Project ID no `.env.local`:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu_project_id
```

## 📝 Como Funciona o Processo de Mint

### Fluxo Completo

1. **Upload da Imagem**
   - Usuário seleciona uma imagem (PNG, JPG, GIF, WebP)
   - Imagem é enviada para Cloudflare R2 via API route
   - Retorna: `https://nft.arcgallery.xyz/images/...`

2. **Criação dos Metadados**
   - Nome, descrição, royalty são combinados com a URL da imagem
   - Metadados JSON são enviados para R2
   - Retorna: `https://nft.arcgallery.xyz/metadata/...`

3. **Mint do NFT**
   - Chama `ArcNFT.mint(tokenURI)`
   - Aguarda confirmação da transação
   - NFT é mintado para a carteira do usuário

4. **Indexação no Supabase**
   - NFT é automaticamente indexado no banco de dados
   - Sincronização com blockchain via eventos

5. **Listagem (Opcional)**
   - Se o usuário definiu um preço:
     - Aprova o Marketplace: `ArcNFT.approve(marketplaceAddress, tokenId)`
     - Cria a listagem: `Marketplace.createListing(nftAddress, tokenId, price)`

### Hooks Disponíveis

```typescript
// Mint NFT
const { mint, isPending, isConfirming, isSuccess } = useNFTMint()
await mint(tokenURI)

// Aprovar Marketplace
const { approve } = useNFTApprove()
await approve(tokenId)

// Criar Listagem
const { createListing } = useMarketplaceListing()
await createListing(tokenId, priceInUSDC)
```

// Comprar NFT
const { buyNFT } = useMarketplaceBuy()
await buyNFT(listingId, priceInUSDC)
```

## 🧪 Modo de Desenvolvimento (Sem IPFS)

Se você não configurar as chaves do Pinata, o sistema automaticamente usará:

- **Mock URIs**: Data URIs para testes locais
- **Funciona offline**: Não precisa de conexão com IPFS
- **Limitação**: Os metadados não persistem entre reloads

Para ativar o modo de produção, simplesmente configure as variáveis de ambiente.

## 🔍 Debugging

### Ver Transações

Todas as transações podem ser vistas em:
- **Arc Testnet Explorer**: https://testnet.arcscan.app/
- **Console do navegador**: Logs detalhados de cada etapa

### Erros Comuns

1. **"Please connect your wallet first"**
   - Solução: Conecte sua carteira usando o botão no navbar

2. **"Failed to upload to IPFS"**
   - Solução: Verifique suas chaves do Pinata no `.env.local`
   - Alternativa: O sistema usará mock URIs automaticamente

3. **"Insufficient funds"**
   - Solução: Você precisa de Arc tokens para pagar o gas
   - Faucet: https://faucet.testnet.arc.network/ (se disponível)

4. **"User rejected transaction"**
   - Solução: Aprove a transação na sua carteira

## 📋 Checklist de Deploy

- [ ] Contratos deployados na Arc testnet
- [ ] Endereços atualizados em `lib/contracts.ts`
- [ ] Conta Pinata criada (opcional)
- [ ] Variáveis de ambiente configuradas
- [ ] Carteira conectada com Arc tokens
- [ ] Teste de mint com uma imagem pequena

## 🎨 Exemplo de Uso

```typescript
// Na página de criação (/create)
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // 1. Upload da imagem
  const imageURI = await uploadToIPFS(imageFile)
  
  // 2. Upload dos metadados
  const metadata = {
    name: 'Minha Arte',
    description: 'Descrição da arte',
    image: imageURI,
  }
  const tokenURI = await uploadMetadataToIPFS(metadata)
  
  // 3. Mint
  await mint(tokenURI)
  
  // 4. Opcional: Listar
  if (price > 0) {
    await approve(tokenId)
    await createListing(tokenId, price)
  }
}
```

## 🔐 Segurança

- ✅ Nunca exponha suas chaves privadas
- ✅ Use `.env.local` (já está no .gitignore)
- ✅ As chaves do Pinata ficam apenas no frontend (seguro para uso público)
- ✅ Sempre teste na testnet primeiro
- ✅ Verifique os valores antes de confirmar transações

## 📚 Próximos Passos

1. **Integrar com Marketplace Real**
   - Ler listings do contrato
   - Exibir NFTs reais na página Explore

2. **Adicionar Galeria de NFTs**
   - Ler NFTs do usuário via `balanceOf` e `tokenOfOwnerByIndex`
   - Exibir na página Profile

3. **Implementar Ofertas**
   - Usar funções `makeOffer` e `acceptOffer` do Marketplace

4. **Adicionar Leilões**
   - Integrar sistema de leilões do contrato
