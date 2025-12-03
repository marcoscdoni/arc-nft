#!/bin/bash

# Script para copiar ABIs dos contratos compilados para o frontend

echo "📦 Copiando ABIs dos contratos..."

# Diretórios
ARTIFACTS_DIR="artifacts/contracts"
FRONTEND_ABI_DIR="frontend/lib/abis"

# Criar diretório de ABIs se não existir
mkdir -p "$FRONTEND_ABI_DIR"

# Copiar ABI do NFT
if [ -f "$ARTIFACTS_DIR/ArcNFT.sol/ArcNFT.json" ]; then
  jq '.abi' "$ARTIFACTS_DIR/ArcNFT.sol/ArcNFT.json" > "$FRONTEND_ABI_DIR/ArcNFT.json"
  echo "✅ ArcNFT ABI copiado"
else
  echo "❌ ArcNFT.json não encontrado. Execute 'npx hardhat compile' primeiro."
fi

# Copiar ABI do Marketplace
if [ -f "$ARTIFACTS_DIR/ArcMarketplace.sol/ArcMarketplace.json" ]; then
  jq '.abi' "$ARTIFACTS_DIR/ArcMarketplace.sol/ArcMarketplace.json" > "$FRONTEND_ABI_DIR/ArcMarketplace.json"
  echo "✅ ArcMarketplace ABI copiado"
else
  echo "❌ ArcMarketplace.json não encontrado. Execute 'npx hardhat compile' primeiro."
fi

echo ""
echo "🎉 ABIs atualizados com sucesso!"
echo "📁 Localização: $FRONTEND_ABI_DIR"
