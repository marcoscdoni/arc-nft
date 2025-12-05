'use client'

import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTranslations } from 'next-intl'

interface TransactionStatusProps {
  hash?: `0x${string}`
  isLoading?: boolean
  isSuccess?: boolean
  isError?: boolean
  error?: Error | null
  successMessage?: string
  errorMessage?: string
  explorerUrl?: string
}

export function TransactionStatus({
  hash,
  isLoading,
  isSuccess,
  isError,
  error,
  successMessage = 'Transaction successful!',
  errorMessage = 'Transaction failed',
  explorerUrl = 'https://testnet.arcscan.app',
}: TransactionStatusProps) {
  const t = useTranslations('wallet')
  
  if (!isLoading && !isSuccess && !isError) {
    return null
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      {isLoading && (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
          <div>
            <p className="font-medium text-white">Processing transaction...</p>
            {hash && (
              <a
                href={`${explorerUrl}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-violet-400 hover:text-violet-300"
              >
                {t('viewOnExplorer')} →
              </a>
            )}
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <div>
            <p className="font-medium text-white">{successMessage}</p>
            {hash && (
              <a
                href={`${explorerUrl}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-violet-400 hover:text-violet-300"
              >
                {t('viewOnExplorer')} →
              </a>
            )}
          </div>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-400" />
          <div>
            <p className="font-medium text-white">{errorMessage}</p>
            {error && (
              <p className="mt-1 text-sm text-red-400">
                {error.message || 'Unknown error occurred'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
