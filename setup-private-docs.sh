#!/bin/bash
# Script para configurar documentação privada como submodule

echo "🔧 Configurando documentação privada..."

# Criar pasta temporária para docs privados
mkdir -p temp-private
cd temp-private

# Inicializar git
git init
git checkout -b main

# Criar estrutura
mkdir -p ai/prompts ai/context instructions notes

# README
cat > README.md << 'README'
# Arc Gallery - Documentação Privada

Instruções de IA, prompts e notas privadas do projeto.

## Estrutura
- `ai/` - Prompts e contexto para IA
- `instructions/` - Instruções detalhadas
- `notes/` - Notas pessoais
README

# Primeiro commit
git add .
git commit -m "Initial private docs structure"

echo ""
echo "✅ Estrutura criada em temp-private/"
echo ""
echo "📝 Próximos passos:"
echo "1. Crie o repositório privado no GitHub: arc-gallery-private"
echo "2. Execute: cd temp-private"
echo "3. Execute: git remote add origin git@github.com:marcoscdoni/arc-gallery-private.git"
echo "4. Execute: git push -u origin main"
echo "5. Volte e execute: cd .."
echo "6. Execute: git submodule add git@github.com:marcoscdoni/arc-gallery-private.git docs-private"
