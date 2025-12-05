# 🔐 Guia de Autenticação por Assinatura de Wallet

## Visão Geral

A autenticação por **assinatura de mensagem (message signing)** é a melhor estratégia para verificar a propriedade de uma wallet antes de ações sensíveis. Diferente de transações blockchain, assinaturas **não custam gas fees** e são instantâneas.

## Por que usar Message Signing?

✅ **Sem custos**: Não consome gas fees  
✅ **Seguro**: Prova criptográfica de propriedade da wallet  
✅ **Rápido**: Instantâneo, sem esperar confirmações  
✅ **UX melhor**: Uma única assinatura válida por 1 hora  
✅ **Previne ataques**: Mensagens incluem timestamp para prevenir replay attacks  

## Implementação

### Hook: `useWalletAuth()`

```typescript
import { useWalletAuth } from '@/hooks/use-wallet-auth'

const { signAuth, isSigningAuth, authError, isAuthenticated } = useWalletAuth()
```

#### Propriedades retornadas:

- **`signAuth()`**: Solicita assinatura do usuário
- **`isSigningAuth`**: `true` enquanto aguarda assinatura
- **`authError`**: Mensagem de erro se falhar
- **`isAuthenticated`**: `true` se usuário já autenticou (cache 1h)
- **`lastAuthTime`**: Timestamp da última autenticação

### Fluxo de Autenticação

```typescript
// 1. Verificar se precisa autenticar
if (!isAuthenticated) {
  // 2. Solicitar assinatura
  const signature = await signAuth();
  
  // 3. Validar resultado
  if (!signature) {
    alert('❌ Authentication required');
    return;
  }
}

// 4. Continuar com ação segura
await saveProfile(...);
```

### Mensagem de Assinatura

A mensagem mostrada ao usuário contém:

```
Sign this message to authenticate with ArcGallery.

Wallet: 0x1234...5678
Timestamp: 2025-12-03T10:30:00.000Z
Nonce: 1733224200000

This signature will not trigger any blockchain transaction or cost gas fees.
```

## Quando Usar?

### ✅ Obrigatório:

- **Editar perfil** (`/profile` - modo edit)
- **Criar NFT** (`/create`)
- **Listar NFT no marketplace**
- **Comprar NFT**
- **Fazer lances em leilões**
- **Adicionar/remover favoritos**

### ❌ Não necessário:

- Navegar pela plataforma
- Ver NFTs
- Ver perfis de outros usuários
- Pesquisar NFTs

## Cache de Autenticação

- **Validade**: 1 hora
- **Escopo**: Por endereço de wallet
- **Storage**: Memória local (não persiste entre reloads)
- **Limpeza**: Automática após 1h ou ao desconectar wallet

### Funções auxiliares:

```typescript
import { clearAuth, clearAllAuth } from '@/hooks/use-wallet-auth'

// Limpar autenticação de uma wallet específica
clearAuth(address)

// Limpar todas as autenticações
clearAllAuth()
```

## Exemplos de Uso

### 1. Página de Profile

```typescript
const handleSaveProfile = async () => {
  if (!address) return
  
  // Verificar autenticação
  if (!isAuthenticated) {
    const signature = await signAuth();
    if (!signature) {
      alert('❌ Authentication required');
      return;
    }
  }
  
  // Salvar profile
  await upsertProfile({ ... })
}
```

### 2. Criar NFT

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!isConnected || !address) {
    setErrorMessage('Please connect your wallet first')
    return
  }

  // Verificar autenticação antes de criar
  if (!isAuthenticated) {
    const signature = await signAuth();
    if (!signature) {
      setErrorMessage('Authentication required');
      return;
    }
  }
  
  // Continuar com upload e mint
  await uploadNFT(...)
  await mint(...)
}
```

### 3. Comprar NFT

```typescript
const handleBuyNFT = async () => {
  // Verificar autenticação antes de comprar
  if (!isAuthenticated) {
    const signature = await signAuth();
    if (!signature) {
      toast.error('Please sign the message to verify ownership')
      return;
    }
  }
  
  // Executar compra
  await buyNFT(listingId, price)
}
```

## UI/UX

### Estados visuais:

```tsx
<button 
  onClick={handleSave}
  disabled={isSaving || isSigningAuth}
>
  {isSigningAuth ? (
    <>
      <Lock className="h-4 w-4" />
      Sign to Save...
    </>
  ) : isSaving ? (
    <>
      <Spinner />
      Saving...
    </>
  ) : (
    <>
      <Save className="h-4 w-4" />
      Save
    </>
  )}
</button>
```

### Mensagens ao usuário:

- ✅ **Sucesso**: "Profile saved successfully!"
- ❌ **Cancelado**: "Authentication cancelled. Please sign the message to continue."
- 🔐 **Aguardando**: "Please sign the message in your wallet..."
- ⏱️ **Expirado**: "Authentication expired. Please sign again."

## Segurança

### Prevenção de Replay Attacks:

- Cada mensagem inclui **timestamp único**
- Mensagem inclui **endereço da wallet**
- Nonce baseado em `Date.now()`

### Verificação Backend (Opcional):

```typescript
import { verifySignature } from '@/hooks/use-wallet-auth'

// No backend/API route
const isValid = await verifySignature(address, message, signature)
if (!isValid) {
  throw new Error('Invalid signature')
}
```

## Limitações

- **Não persiste entre reloads**: Cache em memória RAM
- **Não compartilha entre devices**: Cada dispositivo precisa autenticar
- **Depende de conexão wallet**: Wallet precisa estar conectada

## Melhorias Futuras

1. **Persist cache no localStorage** - Manter autenticação entre reloads
2. **JWT tokens** - Backend pode emitir JWT após validar assinatura
3. **Refresh automático** - Re-autenticar automaticamente antes de expirar
4. **Biometria** - Integrar com wallets que suportam biometria
5. **Sessions** - Gerenciar múltiplas sessões/devices

## Comparação com Alternativas

| Método | Gas Fees | Velocidade | Segurança | UX |
|--------|----------|------------|-----------|-----|
| **Message Signing** | ✅ $0 | ⚡ Instantâneo | 🔐 Alta | ⭐⭐⭐⭐⭐ |
| Transaction Nonce | ❌ ~$0.01-0.05 | 🐌 15-30s | 🔐 Alta | ⭐⭐ |
| Email/Password | ✅ $0 | ⚡ Rápido | ⚠️ Média | ⭐⭐⭐ |
| OAuth (Google) | ✅ $0 | ⚡ Rápido | ⚠️ Média | ⭐⭐⭐⭐ |

## Conclusão

Message signing é a **melhor prática** para autenticação Web3 porque:

- ✅ Mantém soberania do usuário (não custodial)
- ✅ Sem custos de gas
- ✅ UX superior
- ✅ Segurança criptográfica
- ✅ Compatível com todas as wallets

Use em **todas as ações sensíveis** do seu dApp! 🚀
