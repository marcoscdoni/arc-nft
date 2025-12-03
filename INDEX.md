```
 █████╗ ██████╗  ██████╗    ███╗   ██╗███████╗████████╗
██╔══██╗██╔══██╗██╔════╝    ████╗  ██║██╔════╝╚══██╔══╝
███████║██████╔╝██║         ██╔██╗ ██║█████╗     ██║   
██╔══██║██╔══██╗██║         ██║╚██╗██║██╔══╝     ██║   
██║  ██║██║  ██║╚██████╗    ██║ ╚████║██║        ██║   
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═╝  ╚═══╝╚═╝        ╚═╝   
                                                        
███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗████████╗
████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝╚══██╔══╝
██╔████╔██║███████║██████╔╝█████╔╝ █████╗     ██║   
██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝     ██║   
██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗   ██║   
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   
```

# 🎨 Marketplace de NFTs para Arc Layer 1

> Projeto completo e profissional para a testnet da Arc

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Latest-yellow)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0-purple)](https://openzeppelin.com/)
[![Tests](https://img.shields.io/badge/Tests-26%20passing-green)](./test)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)

---

## 📖 Índice de Documentação

### 🚀 Para Começar Rápido
1. **[QUICKSTART.md](QUICKSTART.md)** - Comece aqui! (5 minutos)
   - Setup rápido
   - Deploy em 3 comandos
   - Primeiras interações

2. **[SUMMARY.md](SUMMARY.md)** - Resumo Executivo
   - O que foi criado
   - Funcionalidades principais

### 📚 Documentação Completa
3. **[README.md](README.md)** - Documentação Principal
   - Instalação detalhada
   - Configuração completa
   - Todas as funcionalidades
   - Troubleshooting

4. **[METAMASK-SETUP.md](METAMASK-SETUP.md)** - Configuração de Wallet
   - Como adicionar Arc Testnet
   - Obter tokens do faucet
   - Exportar private key com segurança

### 🛠️ Referências Técnicas
5. **[CHEATSHEET.md](CHEATSHEET.md)** - Comandos Úteis
   - Todos os comandos npm
   - Console Hardhat
   - Queries e utilities
   - Atalhos

6. **[PROJECT-STRUCTURE.txt](PROJECT-STRUCTURE.txt)** - Estrutura do Projeto
   - Organização de pastas
   - Arquivos e suas funções

### 📂 Diretórios Importantes
- **[contracts/](contracts/)** - Contratos Solidity
- **[scripts/](scripts/)** - Scripts de deploy e interação
- **[test/](test/)** - Suite de testes completa

---

## ⚡ Quick Commands

```bash
# Primeiro uso
npm install                    # Instalar dependências
npm run check                  # Verificar configuração
npm run deploy:testnet         # Deploy na Arc

# Uso diário
npm run interact               # Mint + List NFT
npm run batch-mint             # Mint múltiplos
npm run auction                # Criar leilão
npm run stats                  # Ver estatísticas

# Desenvolvimento
npm test                       # Rodar testes
npm run compile                # Compilar contratos
npm run console                # Console interativo
```

---

## 🎯 O Que Você Tem

### ✅ Contratos (100% Testados)
- **ArcNFT** - NFT ERC721 com mint gratuito e royalties
- **ArcMarketplace** - Marketplace completo (listagens, ofertas, leilões)

### ✅ Scripts Automatizados
- Deploy automático
- Batch minting
- Criação de leilões
- Estatísticas em tempo real
- 6+ scripts prontos para usar

### ✅ Testes (26 passing)
- Cobertura completa
- Testes de segurança
- Edge cases cobertos

### ✅ Documentação Profissional
- 6 guias detalhados
- Exemplos práticos
- Troubleshooting completo

---

## 🚀 Começar em 3 Passos

### 1. Configure (2 min)
```bash
cp .env.example .env
nano .env  # Adicione sua PRIVATE_KEY
npm run check
```

### 2. Deploy (1 min)
```bash
npm run deploy:testnet
# Copie os endereços para .env
```

### 3. Interaja (1 min)
```bash
npm run interact
npm run stats
```

**Pronto! Você está participando da Arc Testnet! 🎉**

---

## 📊 Funcionalidades do Marketplace

### Para Criadores
- ✅ Mint gratuito (5 NFTs)
- ✅ Batch minting eficiente
- ✅ Royalties automáticos (2.5%)
- ✅ Metadata IPFS

### Para Traders
- ✅ Compra instantânea
- ✅ Sistema de ofertas
- ✅ Leilões com prazo
- ✅ Gas otimizado

### Analytics
- ✅ Volume total
- ✅ Total de vendas
- ✅ Estatísticas pessoais
- ✅ Histórico completo

---

## 👤 Suporte

### 🎯 Atividades Diárias (5-10 min)
- Mint 1-3 NFTs
- Liste 1-2 NFTs
- Faça ofertas
- Participe de leilões

### 🏆 Estratégia
1. **Consistência** > Volume único
2. **Varie** as atividades
3. **Documente** transações importantes
4. **Participe** da comunidade

---

## 🔗 Links Importantes

| Recurso | Link |
|---------|------|
| 🌐 Arc RPC | https://rpc.arc-testnet.circle.com |
| 🔍 Explorer | https://arcscan.net |
| 💧 Faucet | https://faucet.arc-testnet.circle.com |
| 📚 Docs Arc | https://developers.circle.com/arc |
| 🛠️ Hardhat | https://hardhat.org/docs |

---

## 📈 Status do Projeto

```
✅ Contratos: 2/2 implementados
✅ Testes: 26/26 passando
✅ Scripts: 6/6 funcionais
✅ Documentação: 100% completa
✅ Pronto para deploy!
```

---

## 🎓 Próximos Passos

1. ✅ **Agora**: Leia [QUICKSTART.md](QUICKSTART.md)
2. ⏭️ **Depois**: Configure e faça deploy
3. 🔄 **Diariamente**: Interaja na testnet
4. 🚀 **Opcional**: Adicione frontend web

---

## 🆘 Precisa de Ajuda?

1. 📖 Consulte [README.md](README.md) - Troubleshooting
2. 💬 Verifique [CHEATSHEET.md](CHEATSHEET.md) - Comandos
3. 🔍 Execute `npm run check` - Diagnóstico
4. 💭 Pergunte no Discord da Arc

---

## 🏗️ Arquitetura

```
Usuario -> MetaMask -> Arc Testnet -> Contratos
                                      ├── ArcNFT
                                      └── ArcMarketplace
```

---

## 🔐 Segurança

⚠️ **IMPORTANTE**:
- NUNCA compartilhe sua private key
- Use wallet separada para testnet
- Verifique transações antes de assinar
- Mantenha .env fora do Git

---

## 📝 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes

---

## 🙏 Agradecimentos

- Circle Team pela Arc Layer 1
- OpenZeppelin pelos contratos seguros
- Hardhat pela excelente DX
- Comunidade Ethereum

---

<div align="center">

**🚀 Desenvolvido para a Arc Layer 1 🚀**

---

**Desenvolvido para Arc Layer 1** 🚀

[⭐ Star este projeto](.) | [🐛 Report Bug](.) | [💡 Request Feature](.)

</div>
