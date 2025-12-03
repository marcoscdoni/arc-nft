'use client'

import { useState, useTransition } from 'react'
import { Globe } from 'lucide-react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
]

type LanguageCode = (typeof languages)[number]['code']

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const currentLang = useLocale()
  
  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0]

  const handleLanguageChange = (locale: LanguageCode) => {
    setIsOpen(false)
    
    startTransition(() => {
      // Use replace to change locale without adding to history
      router.replace(pathname, { locale })
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex h-10 items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/80 px-3 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:border-gray-600 disabled:opacity-50 ${
          isPending ? 'cursor-wait' : ''
        }`}
      >
        <Globe className={`h-4 w-4 transition-transform ${isPending ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <span className="text-lg">{currentLanguage.flag}</span>
      </button>

      {isOpen && !isPending && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="border-b border-gray-700 px-4 py-2">
              <p className="text-xs font-medium text-gray-400">Select language</p>
            </div>
            
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={isPending}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-800 disabled:opacity-50 ${
                    currentLang === language.code 
                      ? 'bg-gray-800/50 text-white' 
                      : 'text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{language.flag}</span>
                    <span className="font-medium">{language.name}</span>
                  </div>
                  {currentLang === language.code && (
                    <svg className="h-4 w-4 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
