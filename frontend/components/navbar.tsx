'use client'

import { Link } from '@/i18n/routing'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu, X, Wallet, Home, Compass, PlusCircle, User } from 'lucide-react'
import { useState, useMemo } from 'react'
import { WalletBalance } from './wallet-balance'
import { LanguageSelector } from './language-selector'
import { useTranslations } from 'next-intl'
import { useNFTSync } from '@/hooks/use-nft-sync'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('navbar')
  
  // Hook para monitorar transferências de NFTs e atualizar Supabase
  useNFTSync()

  // Memoize nav items to prevent recreation
  const navItems = useMemo(() => [
    { name: t('home'), href: '/', icon: Home, key: 'home' },
    { name: t('explore'), href: '/explore', icon: Compass, key: 'explore' },
    { name: t('create'), href: '/create', icon: PlusCircle, key: 'create' },
    { name: t('profile'), href: '/profile', icon: User, key: 'profile' },
  ], [t])

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 glass-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 transition-transform group-hover:scale-105">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Arc<span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">NFT</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Connect Button & Wallet */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <WalletBalance />
            <LanguageSelector />
            <div className="h-10">
              <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 rounded-xl px-3 py-2 text-base font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="space-y-3 px-3 pt-4">
              <LanguageSelector />
              <ConnectButton showBalance={false} />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
