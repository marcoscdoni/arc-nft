# 🔍 Como Verificar Contratos no Arc Testnet Explorer

## ✅ Informações dos Contratos Deployados

### ArcNFT
- **Endereço**: `0x88FEB9dcDbAbE6f3e2fEdCC643B183Ea061f6402`
- **URL Verificação**: https://testnet.arcscan.app/address/0x88FEB9dcDbAbE6f3e2fEdCC643B183Ea061f6402/contract-verification
- **Tx Deploy**: `0x46b5e5a32a1199ec401accae9995a24e2d850f69d19cb1c69a67853ee5d4e450`

### ArcMarketplace
- **Endereço**: `0xb79A0cd345EDbaF64e2a0a41c0b6BFA32388253b`
- **URL Verificação**: https://testnet.arcscan.app/address/0xb79A0cd345EDbaF64e2a0a41c0b6BFA32388253b/contract-verification
- **Tx Deploy**: `0x4500f061f6b29dd00e5afb36271333cef840dcd6ed58d53aca1a2526d0247b5b`

## 📋 Passo a Passo para Verificação

### 1. Acessar página de verificação
Clique em uma das URLs acima ou:
1. Vá em https://testnet.arcscan.app
2. Cole o endereço do contrato na busca
3. Clique em "Contract" → "Verify & Publish"

### 2. Preencher formulário de verificação

#### Opções a selecionar:
- **Contract license**: `No License (None)` ou `MIT` (se preferir)
- **Verification method**: `Solidity (Single file)` ✅
- **Compiler**: Selecione a versão correta
- **EVM Version**: `default` (ou `paris` se disponível)
- **Optimization enabled**: ✅ Marcar checkbox
- **Optimization runs**: `200`

#### Informações do Compilador:
Baseado no seu `hardhat.config.ts`:
```
Solidity Version: 0.8.24
Optimizer: Enabled
Runs: 200
EVM Version: paris
```

### 3. Colar código do contrato

#### Para ArcNFT:
Use o arquivo gerado: `ArcNFT-flattened.sol`

```bash
# Copiar conteúdo para área de transferência
cat /home/marcos/Projetos/arc-nft/ArcNFT-flattened.sol | xclip -selection clipboard
```

Ou abra o arquivo e copie todo o conteúdo:
```bash
code ArcNFT-flattened.sol
```

#### Para ArcMarketplace:
Primeiro gere o arquivo flattened:
```bash
npx hardhat flatten contracts/ArcMarketplace.sol > ArcMarketplace-flattened.sol
```

### 4. Constructor Arguments (se necessário)

**ArcNFT**: Não precisa (constructor vazio)

**ArcMarketplace**: 
```
Constructor: constructor(address initialOwner)
Parâmetro: 0xee185ffc78C918c51f77c5aF613FC7633cE85497
```

Para ABI encode (se necessário):
```javascript
// Em formato ABI encoded:
000000000000000000000000ee185ffc78c918c51f77c5af613fc7633ce85497
```

### 5. Submeter verificação

Clique em "Verify & Publish" e aguarde processamento (~30 segundos)

## 🎯 Benefícios da Verificação

✅ **Transparência**: Qualquer pessoa pode ver o código-fonte
✅ **Interação**: Usuários podem chamar funções diretamente no explorer
✅ **Confiança**: Prova que o código deployado corresponde ao código-fonte
✅ **Debugging**: Facilita encontrar erros e entender transações
✅ **ABI Público**: Frontend pode importar ABI direto do explorer

## 🔧 Alternativa: Verificação via Hardhat (futura)

Se o explorer suportar API de verificação, você pode usar:

```bash
npx hardhat verify --network arc-testnet 0x88FEB9dcDbAbE6f3e2fEdCC643B183Ea061f6402
```

Mas primeiro precisa configurar no `hardhat.config.ts`:
```typescript
etherscan: {
  apiKey: {
    'arc-testnet': 'seu-api-key-aqui' // Se disponível
  },
  customChains: [
    {
      network: "arc-testnet",
      chainId: 5042002,
      urls: {
        apiURL: "https://testnet.arcscan.app/api",
        browserURL: "https://testnet.arcscan.app"
      }
    }
  ]
}
```

## 📝 Checklist

- [ ] Gerar ArcNFT-flattened.sol (✅ Já feito)
- [ ] Gerar ArcMarketplace-flattened.sol
- [ ] Acessar página de verificação ArcNFT
- [ ] Preencher formulário com configurações corretas
- [ ] Colar código do ArcNFT-flattened.sol
- [ ] Submeter e aguardar confirmação
- [ ] Repetir processo para ArcMarketplace
- [ ] Testar interação no explorer após verificação

## 🆘 Troubleshooting

### Erro: "Bytecode doesn't match"
- Verifique versão do compilador (deve ser exatamente 0.8.24)
- Confirme otimização habilitada com 200 runs
- Certifique-se que o código flattened está completo

### Erro: "Constructor arguments invalid"
- Use apenas o endereço sem 0x para ABI encode
- Ou deixe vazio se o constructor não tiver parâmetros

### Código muito grande
- O explorer pode ter limite de caracteres
- Use método "Solidity (Standard JSON Input)" se disponível
- Ou verifique via API do Hardhat

## 🔗 Links Úteis

- Explorer: https://testnet.arcscan.app
- Documentação Arc: https://developers.circle.com/stablecoins/docs/arc-network-getting-started
- OpenZeppelin (bibliotecas usadas): https://docs.openzeppelin.com/contracts/5.x/
