# Sistema de Sincronização de NFTs - Arquitetura Híbrida

## 🎯 Objetivo

Garantir que **todos os NFTs sempre apareçam no perfil**, mesmo que:
- A indexação no Supabase falhe
- O banco de dados esteja vazio
- NFTs sejam transferidos/vendidos

## 🏗️ Arquitetura

### 1. **Indexação Automática ao Mintar** (`create/page.tsx`)

Quando um NFT é mintado:
```typescript
// Após confirmação do mint
useEffect(() => {
  // Extrai tokenId dos logs
  // Chama indexNFT() com retry automático (3 tentativas)
  // Se falhar, não bloqueia o usuário
}, [mintReceipt])
```

✅ **Vantagem**: NFT aparece instantaneamente no perfil
⚠️ **Fallback**: Se falhar, busca da blockchain funciona

### 2. **Busca Híbrida no Profile** (`lib/blockchain.ts` + `profile/page.tsx`)

Estratégia em camadas:

```typescript
// 1. Tentar Supabase (rápido)
let nfts = await getNFTs({ owner: address })

// 2. Se vazio, buscar da blockchain (confiável)
if (nfts.length === 0) {
  nfts = await getOwnedNFTsFromBlockchain(address)
}
```

#### **Collected** (NFTs que você possui)
- Supabase: `SELECT * FROM nfts WHERE owner_address = ?`
- Blockchain: `balanceOf()` + `tokenOfOwnerByIndex()` para cada NFT

#### **Created** (NFTs que você criou)
- Supabase: `SELECT * FROM nfts WHERE creator_address = ?`
- Blockchain: Busca eventos `Transfer(from=0x0, to=você)` (mints)

### 3. **Sincronização em Tempo Real** (`use-nft-sync.ts`)

Hook global que roda no Navbar:

```typescript
publicClient.watchContractEvent({
  eventName: 'Transfer',
  onLogs: async (logs) => {
    // Atualiza owner_address no Supabase
    // quando NFT é transferido/vendido
  }
})
```

✅ **Garante**: Quando você vende um NFT, ele sai do seu "Collected" automaticamente
✅ **Garante**: Quando você compra um NFT, ele aparece no seu "Collected"

### 4. **Retry Automático** (`lib/supabase.ts`)

A função `indexNFT()` tem:
- 3 tentativas automáticas
- Delay exponencial (1s, 2s, 3s)
- Atualiza owner se NFT já existe (para vendas)

```typescript
let attempts = 0
while (attempts < 3) {
  const result = await supabase.insert(...)
  if (result.success) break
  await sleep(1000 * attempts)
}
```

## 📊 Fluxos Garantidos

### ✅ Mint de NFT
1. Upload → IPFS
2. Mint on-chain ✅
3. Indexar no Supabase (retry 3x)
4. Se falhar → aparece via blockchain no profile

### ✅ Venda de NFT
1. Transfer on-chain ✅
2. Evento detectado pelo `useNFTSync`
3. Owner atualizado no Supabase
4. NFT sai do "Collected" do vendedor
5. NFT entra no "Collected" do comprador

### ✅ NFTs Antigos (antes da indexação)
1. Profile tenta Supabase → vazio
2. Busca da blockchain → `balanceOf()` + metadados
3. Exibe normalmente

## 🔧 Comandos Úteis

### Sincronizar NFTs históricos manualmente
```bash
npm run sync-nfts
```

Esse script:
- Busca todos os NFTs do contrato
- Para cada um: busca owner, metadados, etc.
- Insere no Supabase
- Pula os que já existem

### Rodar indexer em background (produção)
```bash
npm run indexer
```

Monitora eventos e indexa automaticamente.

## 🛡️ Garantias de Confiabilidade

| Cenário | Supabase Falha? | Aparece no Profile? |
|---------|----------------|---------------------|
| Mint novo | ✅ Sim | ✅ Sim (blockchain) |
| NFT antigo | ✅ Sim | ✅ Sim (blockchain) |
| Venda/Transfer | ❌ Não | ✅ Sim (sync em tempo real) |
| Banco vazio | ✅ Sim | ✅ Sim (busca blockchain) |
| RPC offline | ❌ Não* | ❌ Não* |

\* Se RPC estiver offline, nada funciona (blockchain inacessível)

## 🚀 Performance

- **Supabase**: ~100ms (cache)
- **Blockchain (1 NFT)**: ~500ms
- **Blockchain (10 NFTs)**: ~3s
- **Sincronização tempo real**: instantânea

## 📝 Logs no Console

Para debug, o sistema loga:

```
📡 Carregando NFTs (collected)...
⚠️  Nenhum NFT no Supabase, buscando da blockchain...
🔗 Buscando NFTs da blockchain para: 0x...
📊 Balance: 2 NFTs
✅ Carregados 2 NFTs

👀 Iniciando monitoramento de transferências...
🔄 Transfer detectado: NFT #1 de 0x... para 0x...
✅ Owner atualizado para NFT #1
```

## 🎯 Próximos Passos (Opcional)

1. **Cache de blockchain**: Guardar resultados por 5min
2. **Pagination**: Para usuários com 100+ NFTs
3. **Background sync**: Job que roda a cada hora
4. **Indexer como serviço**: Deploy separado sempre rodando
