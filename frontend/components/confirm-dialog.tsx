'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

/**
 * Modern confirmation dialog component
 * Glass morphism design matching the app's aesthetic
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: 'from-red-600 to-rose-600',
    warning: 'from-orange-600 to-amber-600',
    info: 'from-violet-600 to-purple-600',
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4">
        <div className="glass-card glow-violet overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-white/70">{description}</p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-white/10 p-6">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 font-medium text-white transition hover:bg-white/10"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 rounded-xl bg-gradient-to-r ${variantStyles[variant]} px-4 py-2.5 font-medium text-white transition hover:opacity-90`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Hook for using confirmation dialogs
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>>({
    title: '',
    description: '',
  })
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null)

  const confirm = (
    options: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig(options)
      setOnConfirmCallback(() => () => {
        resolve(true)
      })
      setIsOpen(true)
    })
  }

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback()
    }
    setIsOpen(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const Dialog = () => (
    <ConfirmDialog
      {...config}
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  )

  return { confirm, Dialog }
}
