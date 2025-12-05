# 🎨 Sistema de Notificações e Diálogos Modernos

## Biblioteca Utilizada: **Sonner**

[Sonner](https://sonner.emilkowal.ski/) é a biblioteca de toast mais moderna do ecossistema React/Next.js, criada por Emil Kowalski (criador do Vaul e outras bibliotecas populares).

### Por que Sonner?

✅ **Design moderno** - Glassmorphism nativo  
✅ **Acessível** - ARIA compliant  
✅ **Performático** - Animações suaves com Framer Motion  
✅ **Flexível** - Suporta loading, success, error, warning, info  
✅ **TypeScript first** - Tipagem completa  
✅ **Lightweight** - ~3KB gzipped  

---

## 🍞 Toast Notifications

### Instalação
```bash
npm install sonner --legacy-peer-deps
```

### Configuração

**1. Provider Global (`frontend/app/layout.tsx`)**
```tsx
import { ToastProvider } from '@/components/toast-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>
          {children}
          <ToastProvider />  {/* ← Adicionar aqui */}
        </Web3Provider>
      </body>
    </html>
  )
}
```

**2. Componente Toast Provider (`frontend/components/toast-provider.tsx`)**
```tsx
import { Toaster as Sonner } from 'sonner'

export function ToastProvider() {
  return (
    <Sonner
      position="top-right"
      expand={true}
      richColors
      closeButton
      theme="dark"
      toastOptions={{
        style: {
          background: 'rgba(15, 23, 42, 0.8)',  // Glassmorphism
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
        },
        className: 'glass-card',
      }}
    />
  )
}
```

### Uso nos Componentes

```tsx
import { toast } from 'sonner'

// ✅ Success
toast.success('Profile updated successfully!')

// ❌ Error
toast.error('Failed to update profile')

// ⚠️ Warning
toast.warning('Please review your changes')

// ℹ️ Info
toast.info('New feature available')

// ⏳ Loading
const id = toast.loading('Saving profile...')
// ... depois atualizar:
toast.success('Saved!', { id })
// ou
toast.error('Failed', { id })

// 🎨 Custom
toast('Custom message', {
  description: 'With description',
  duration: 5000,
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
})
```

### Exemplos Implementados

#### 1. **Copiar Endereço**
```tsx
const copyAddress = () => {
  if (address) {
    navigator.clipboard.writeText(address)
    toast.success('Address copied to clipboard!')  // ← Toast moderno
  }
}
```

**Antes:** `alert('✅ Address copied!')`  
**Depois:** Toast com animação suave no canto superior direito

---

#### 2. **Salvar Perfil com Progress**
```tsx
const handleSaveProfile = async () => {
  const uploadToast = toast.loading('Saving profile...')
  
  try {
    if (avatarFile) {
      toast.loading('Uploading avatar to IPFS...', { id: uploadToast })
      avatarUrl = await uploadImage(avatarFile)
    }
    
    if (bannerFile) {
      toast.loading('Uploading banner to IPFS...', { id: uploadToast })
      bannerUrl = await uploadImage(bannerFile)
    }
    
    toast.loading('Saving to database...', { id: uploadToast })
    const updatedProfile = await upsertProfile(...)
    
    toast.success('Profile updated successfully!', { id: uploadToast })
  } catch (error) {
    toast.error('Error: ' + error.message, { id: uploadToast })
  }
}
```

**UX Melhorada:**
1. Toast inicial: "Saving profile..." ⏳
2. Atualiza: "Uploading avatar to IPFS..." ⏳
3. Atualiza: "Uploading banner to IPFS..." ⏳
4. Atualiza: "Saving to database..." ⏳
5. Final: "Profile updated successfully!" ✅

---

#### 3. **Autenticação**
```tsx
if (!isAuthenticated) {
  const signature = await signAuth();
  if (!signature) {
    toast.error('Authentication required. Please sign the message.')
    return;
  }
}
```

---

## 🪟 Confirmation Dialogs

### Componente Custom (`frontend/components/confirm-dialog.tsx`)

**Design:**
- Glassmorphism matching app aesthetic
- Backdrop com blur
- Animações suaves
- Variantes: `danger`, `warning`, `info`
- Acessível (ESC to close, click outside to close)

### Estrutura

```tsx
interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string  // Default: "Confirm"
  cancelText?: string   // Default: "Cancel"
  variant?: 'danger' | 'warning' | 'info'  // Default: "info"
}
```

### Uso Básico

```tsx
import { ConfirmDialog } from '@/components/confirm-dialog'

export default function MyPage() {
  const [showDialog, setShowDialog] = useState(false)

  const handleDelete = () => {
    setShowDialog(true)
  }

  const confirmDelete = () => {
    // Executar ação
    deleteItem()
    setShowDialog(false)
  }

  return (
    <>
      <button onClick={handleDelete}>Delete</button>

      <ConfirmDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Item?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
}
```

### Exemplo Implementado: Cancelar Edição

```tsx
const handleCancelEdit = () => {
  const hasChanges = 
    avatarFile !== null || 
    formData.username !== profile?.username
    // ... outros campos

  if (hasChanges) {
    setShowCancelDialog(true)  // ← Mostrar diálogo
    return
  }

  // Sem mudanças, apenas fecha
  cancelEditMode()
}

const cancelEditMode = () => {
  setIsEditing(false)
  setShowCancelDialog(false)
  // Reset form...
}

return (
  <>
    <button onClick={handleCancelEdit}>Cancel</button>

    <ConfirmDialog
      isOpen={showCancelDialog}
      onClose={() => setShowCancelDialog(false)}
      onConfirm={cancelEditMode}
      title="Discard Changes?"
      description="You have unsaved changes. Are you sure you want to discard them?"
      confirmText="Discard"
      cancelText="Keep Editing"
      variant="warning"
    />
  </>
)
```

---

## 🎨 Variantes Visuais

### Info (Padrão)
```tsx
variant="info"
// Botão: Gradiente violet → purple
```
![Info Dialog](https://i.imgur.com/example-info.png)

### Warning
```tsx
variant="warning"
// Botão: Gradiente orange → amber
```
![Warning Dialog](https://i.imgur.com/example-warning.png)

### Danger
```tsx
variant="danger"
// Botão: Gradiente red → rose
```
![Danger Dialog](https://i.imgur.com/example-danger.png)

---

## 🎭 Comparação: Antes vs Depois

### ❌ ANTES (Alert Nativo do Navegador)

```tsx
alert('✅ Address copied!')
alert('❌ Failed to update profile')
const confirmed = confirm('Discard changes?')
```

**Problemas:**
- Design feio e datado
- Bloqueia toda a UI
- Não customizável
- Sem animações
- Acessibilidade ruim
- Mobile UX péssima
- Não tem loading states

---

### ✅ DEPOIS (Sonner + Custom Dialogs)

```tsx
toast.success('Address copied to clipboard!')
toast.error('Failed to update profile')

<ConfirmDialog
  title="Discard Changes?"
  description="You have unsaved changes."
  variant="warning"
/>
```

**Benefícios:**
- Design moderno e bonito
- Não bloqueia UI (toasts)
- Totalmente customizável
- Animações suaves
- Acessível (ARIA)
- Mobile-friendly
- Loading states integrados
- Múltiplos toasts simultâneos
- Ações inline (undo, retry)

---

## 📱 Responsividade

### Toast
- **Desktop:** Canto superior direito
- **Mobile:** Topo centralizado (auto-ajusta)
- **Tablet:** Canto superior direito

### Dialog
- **Desktop:** Modal centralizado (max-width: 28rem)
- **Mobile:** Full-width com padding lateral
- **Tablet:** Modal centralizado

---

## ⌨️ Atalhos de Teclado

### Toast
- **ESC:** Fecha o toast ativo
- **Swipe (mobile):** Deslizar para fechar

### Dialog
- **ESC:** Fecha o dialog
- **Enter:** Confirma ação
- **Tab:** Navegação entre botões
- **Click fora:** Fecha dialog (backdrop)

---

## 🚀 Próximos Passos

### 1. **Adicionar em Outras Páginas**

**Create Page:**
```tsx
toast.loading('Uploading to IPFS...')
toast.success('NFT created successfully!')
toast.error('Minting failed: ' + error.message)
```

**NFT Detail Page:**
```tsx
<ConfirmDialog
  title="Buy this NFT?"
  description={`Price: ${price} USDC`}
  confirmText="Buy Now"
  variant="info"
/>
```

**Marketplace:**
```tsx
<ConfirmDialog
  title="Cancel Listing?"
  description="This will remove your NFT from the marketplace."
  confirmText="Cancel Listing"
  variant="warning"
/>
```

### 2. **Toast Patterns**

**Transações Blockchain:**
```tsx
const txToast = toast.loading('Waiting for wallet signature...')
toast.loading('Transaction pending...', { id: txToast })
toast.loading('Confirming on blockchain...', { id: txToast })
toast.success('Transaction confirmed!', { 
  id: txToast,
  action: {
    label: 'View on Explorer',
    onClick: () => window.open(explorerUrl)
  }
})
```

**Upload de Imagens:**
```tsx
const uploadToast = toast.loading('Uploading image...')
// Com progress (se Pinata retornar)
toast.loading(`Uploading... ${progress}%`, { id: uploadToast })
toast.success('Image uploaded!', { id: uploadToast })
```

### 3. **Dialogs Patterns**

**Transferência de NFT:**
```tsx
<ConfirmDialog
  title="Transfer NFT?"
  description={`Transfer to: ${recipientAddress}`}
  confirmText="Transfer"
  variant="warning"
/>
```

**Deletar Item:**
```tsx
<ConfirmDialog
  title="Delete Forever?"
  description="This action cannot be undone."
  confirmText="Delete"
  variant="danger"
/>
```

---

## 📊 Performance

### Bundle Size
- **Sonner:** ~3KB gzipped
- **ConfirmDialog:** <1KB (custom)
- **Total:** ~4KB adicional

### Impact
- Zero impacto no LCP (não bloqueia render)
- Animações otimizadas (GPU)
- Tree-shakeable

---

## 🎨 Customização

### Cores dos Toasts

**Editar `toast-provider.tsx`:**
```tsx
toastOptions={{
  style: {
    background: 'rgba(15, 23, 42, 0.8)',  // Alterar aqui
    border: '1px solid rgba(139, 92, 246, 0.3)',  // Violet border
  },
}}
```

### Duração

```tsx
toast.success('Message', { duration: 10000 })  // 10 segundos
toast.error('Error', { duration: Infinity })   // Não fecha automaticamente
```

### Posição

```tsx
<Sonner position="bottom-right" />  // Canto inferior direito
<Sonner position="top-center" />    // Topo centralizado
```

---

## 🐛 Debugging

### Toast não aparece?
1. Verificar se `<ToastProvider />` está no layout
2. Verificar import: `import { toast } from 'sonner'`
3. Checar z-index de outros elementos

### Dialog não fecha?
1. Verificar `isOpen={showDialog}`
2. Verificar `onClose={() => setShowDialog(false)}`
3. Testar ESC e click no backdrop

---

## ✅ Checklist de Implementação

- [x] Instalar Sonner (`npm install sonner`)
- [x] Criar `ToastProvider` component
- [x] Adicionar no layout root
- [x] Criar `ConfirmDialog` component
- [x] Substituir `alert()` por `toast.*`
- [x] Substituir `confirm()` por `<ConfirmDialog>`
- [x] Adicionar loading states
- [x] Testar responsividade
- [x] Testar acessibilidade
- [ ] Adicionar em Create page
- [ ] Adicionar em NFT detail
- [ ] Adicionar em Marketplace

---

## 🎓 Recursos

- **Sonner Docs:** https://sonner.emilkowal.ski/
- **Exemplos:** https://sonner.emilkowal.ski/examples
- **GitHub:** https://github.com/emilkowalski/sonner

---

**Última atualização:** 2025-12-03  
**Versão:** 1.0.0  
**Status:** ✅ Production Ready
