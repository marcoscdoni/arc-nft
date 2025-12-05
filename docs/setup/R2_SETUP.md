# Configuração do Cloudflare R2 Storage

Este guia mostra como configurar o Cloudflare R2 para armazenar imagens e metadados dos seus NFTs de forma **profissional, gratuita e automática**.

## Por que Cloudflare R2?

- ✅ **Gratuito**: 10GB de armazenamento + 10 milhões de requisições/mês
- ✅ **Profissional**: Infraestrutura global da Cloudflare
- ✅ **Sem taxas de saída**: Diferente do S3, não cobra por download
- ✅ **Rápido**: CDN global integrado
- ✅ **Compatível com S3**: API padrão da indústria

## Passo 1: Criar Conta no Cloudflare

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com/sign-up)
2. Crie uma conta gratuita (não precisa de cartão de crédito para começar)
3. Verifique seu email

## Passo 2: Criar Bucket R2

1. No dashboard do Cloudflare, vá em **R2** no menu lateral
2. Clique em **Create bucket**
3. Configure o bucket:
   - **Name**: `arc-nft-storage` (ou outro nome de sua preferência)
   - **Location**: Escolha a região mais próxima (ou deixe "Automatic")
4. Clique em **Create bucket**

## Passo 3: Configurar Acesso Público

1. Dentro do bucket criado, vá na aba **Settings**
2. Em **Public Access**, clique em **Allow Access**
3. Em **Custom Domains**, clique em **Connect Domain**
4. Você pode usar:
   - **Domínio próprio**: `nft.seudominio.com` (recomendado)
   - **Subdomínio R2**: `<bucket-name>.<account-id>.r2.dev`

### Opção A: Usando Domínio Próprio (Recomendado)

1. Adicione seu domínio ao Cloudflare (se ainda não tiver)
2. No R2, clique em **Connect Domain**
3. Digite `nft.seudominio.com`
4. O Cloudflare criará automaticamente o registro DNS
5. Aguarde alguns minutos para propagação

### Opção B: Usando Subdomínio R2 (Mais Rápido)

1. Na aba **Settings** do bucket
2. Em **R2.dev subdomain**, clique em **Allow Access**
3. Copie a URL gerada: `https://<bucket-name>.<account-id>.r2.dev`

## Passo 4: Criar Chaves de API

1. No menu lateral do R2, clique em **Manage R2 API Tokens**
2. Clique em **Create API token**
3. Configure o token:
   - **Token name**: `arc-nft-upload`
   - **Permissions**: **Edit** (permite upload)
   - **Bucket**: Selecione `arc-nft-storage`
   - **TTL**: Deixe vazio (não expira)
4. Clique em **Create API Token**
5. **⚠️ IMPORTANTE**: Copie as credenciais agora (você não poderá vê-las novamente):
   - `Access Key ID`
   - `Secret Access Key`
   - `Endpoint URL`

## Passo 5: Configurar Variáveis de Ambiente

Abra o arquivo `.env.local` e atualize com suas credenciais:

```bash
# Cloudflare R2 Storage Configuration
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<seu_access_key_id>
R2_SECRET_ACCESS_KEY=<seu_secret_access_key>
R2_BUCKET_NAME=arc-nft-storage
R2_PUBLIC_URL=https://nft.seudominio.com  # ou https://<bucket>.r2.dev
```

### Como preencher:

- **R2_ENDPOINT**: URL do endpoint copiada no Passo 4
- **R2_ACCESS_KEY_ID**: Access Key ID copiado no Passo 4
- **R2_SECRET_ACCESS_KEY**: Secret Access Key copiado no Passo 4
- **R2_BUCKET_NAME**: Nome do bucket criado no Passo 2
- **R2_PUBLIC_URL**: 
  - Se configurou domínio próprio: `https://nft.seudominio.com`
  - Se usa subdomínio R2: `https://<bucket-name>.<account-id>.r2.dev`

## Passo 6: Testar a Configuração

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse a página de criação de NFT: `http://localhost:3000/create`

3. Tente fazer upload de uma imagem

4. Se tudo estiver correto, você verá a imagem sendo carregada e o NFT sendo mintado

## Verificação de Arquivos

Você pode verificar os arquivos enviados:

1. No dashboard do Cloudflare, vá em **R2**
2. Clique no bucket `arc-nft-storage`
3. Você verá as pastas:
   - `images/` - Contém as imagens dos NFTs
   - `metadata/` - Contém os metadados JSON

## Solução de Problemas

### Erro: "R2 storage not configured"

- Verifique se todas as variáveis de ambiente estão preenchidas no `.env.local`
- Reinicie o servidor de desenvolvimento

### Erro: "Failed to upload image"

- Verifique se o token de API tem permissões de **Edit**
- Confirme que o bucket name está correto
- Teste as credenciais com a CLI do Cloudflare

### Arquivos não aparecem publicamente

- Verifique se configurou **Public Access** no bucket
- Confirme que o domínio ou subdomínio R2 está ativo
- Aguarde alguns minutos para propagação DNS

### Limite de uso atingido

O plano gratuito inclui:
- **10 GB** de armazenamento
- **10 milhões** de requisições de leitura por mês
- **1 milhão** de requisições de escrita por mês

Para NFTs de ~200KB, você pode armazenar ~50.000 NFTs no plano gratuito.

## Estrutura de Armazenamento

```
arc-nft-storage/
├── images/
│   ├── 1234567890-abc123.png
│   ├── 1234567891-def456.png
│   └── ...
└── metadata/
    ├── 1234567890-abc123.json
    ├── 1234567891-def456.json
    └── ...
```

Cada NFT gera:
- 1 arquivo de imagem em `images/`
- 1 arquivo de metadata JSON em `metadata/`

## URLs Geradas

Exemplo de URLs para um NFT:

```
Imagem:
https://nft.seudominio.com/images/1234567890-abc123.png

Metadata:
https://nft.seudominio.com/metadata/1234567890-abc123.json
```

## Vantagens sobre IPFS

| Característica | Cloudflare R2 | IPFS (Pinata/NFT.Storage) |
|----------------|---------------|---------------------------|
| Velocidade | ⚡ Muito rápida (CDN global) | 🐌 Pode ser lenta |
| Disponibilidade | ✅ 99.99% SLA | ❓ Depende de gateways |
| Custo | 💰 Gratuito até 10GB | 💰 Planos limitados |
| Configuração | 🎯 Simples | 😵 Complexa |
| URLs | 🔗 HTTPS normal | 🔗 ipfs:// ou gateway |

## Próximos Passos

Após configurar o R2, você pode:

1. ✅ Criar NFTs com imagens de até 10MB
2. ✅ Armazenar metadados automaticamente
3. ✅ Acessar arquivos via HTTPS rápido
4. ✅ Escalar para milhares de NFTs

## Recursos Adicionais

- [Documentação oficial do R2](https://developers.cloudflare.com/r2/)
- [Limites do plano gratuito](https://developers.cloudflare.com/r2/pricing/)
- [Workers R2 Bindings](https://developers.cloudflare.com/r2/api/workers/) (para funcionalidades avançadas)

---

**Dúvidas?** Confira a documentação oficial ou abra uma issue no repositório.
