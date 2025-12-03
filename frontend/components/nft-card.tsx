'use client'

import { Link } from '@/i18n/routing'
import { formatUnits } from 'viem'

interface NFTCardProps {
  id: string
  name: string
  image: string
  price: bigint
}

export function NFTCard({ id, name, image, price }: NFTCardProps) {
  const formattedPrice = formatUnits(price, 18)

  return (
    <Link
      href={`/nft/${id}`}
      className="glass-card glass-card-hover group overflow-hidden rounded-2xl border border-white/10"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-white">{name}</h3>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
          <span className="text-xs font-medium text-slate-500">Price</span>
          <span className="font-semibold text-white">{formattedPrice} <span className="text-sm text-blue-400">USDC</span></span>
        </div>
      </div>
    </Link>
  )
}
