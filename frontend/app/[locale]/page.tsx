import { Link } from '@/i18n/routing'
import { Sparkles, ShoppingBag, TrendingUp, Shield } from 'lucide-react'
import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-900/20 to-black py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t('hero.title')}
              <span className="block bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
                {t('hero.subtitle')}
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              {t('hero.description')}
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/explore"
                className="rounded-lg bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/50 transition hover:bg-violet-500"
              >
                {t('hero.explore')}
              </Link>
              <Link
                href="/create"
                className="rounded-lg border border-gray-700 px-8 py-3 text-sm font-semibold text-white transition hover:border-violet-500 hover:bg-violet-500/10"
              >
                {t('hero.create')}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="mt-1 text-sm text-gray-400">{t('stats.nfts')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">5K+</div>
                <div className="mt-1 text-sm text-gray-400">{t('stats.sales')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">2K+</div>
                <div className="mt-1 text-sm text-gray-400">{t('stats.artists')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">$1M+</div>
                <div className="mt-1 text-sm text-gray-400">{t('stats.volume')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('features.title')}
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-4">
            <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600/10">
                <TrendingUp className="h-6 w-6 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t('features.low_fees.title')}</h3>
              <p className="mt-2 text-sm text-gray-400">
                {t('features.low_fees.description')}
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600/10">
                <Sparkles className="h-6 w-6 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t('features.fast.title')}</h3>
              <p className="mt-2 text-sm text-gray-400">
                {t('features.fast.description')}
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600/10">
                <Shield className="h-6 w-6 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t('features.secure.title')}</h3>
              <p className="mt-2 text-sm text-gray-400">
                {t('features.secure.description')}
              </p>
            </div>

            <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/50 p-8 backdrop-blur">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600/10">
                <ShoppingBag className="h-6 w-6 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">{t('features.royalties.title')}</h3>
              <p className="mt-2 text-sm text-gray-400">
                {t('features.royalties.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-900/20 to-purple-900/20 p-12 text-center backdrop-blur">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('cta.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              {t('cta.description')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/create"
                className="rounded-lg bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/50 transition hover:bg-violet-500"
              >
                {t('cta.button')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
