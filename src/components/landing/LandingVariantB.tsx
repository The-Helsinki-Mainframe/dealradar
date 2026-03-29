'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeroSearch } from './HeroSearch'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80&auto=format&fit=crop'

const STATS = [
  { value: '5,700+', label: 'Active listings' },
  { value: '€850–1,400', label: 'Deal price range /m²' },
  { value: '960+', label: 'Cross-source matches' },
]

const ARTICLES = [
  {
    date: 'Mar 2026',
    tag: 'Market Intel',
    headline: 'Pre-war Riga apartments: the €1,100/m² opportunity window is closing',
    excerpt: 'Our analysis of 2,400+ active listings shows a structural price floor forming in Centrs and Āgenskalns.',
  },
  {
    date: 'Feb 2026',
    tag: 'Strategy',
    headline: 'Why court auctions are the most overlooked deal source in Latvia',
    excerpt: 'Izsoles valuations are independent, legally mandated, and almost never show up on property portals.',
  },
  {
    date: 'Jan 2026',
    tag: 'Data',
    headline: 'Cross-platform deduplication: how we catch the same property listed twice',
    excerpt: 'SS.com and City24 list many of the same properties. Our matcher finds them so you don\'t overpay.',
  },
]

export function LandingVariantB() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: 'var(--font-body-b)' }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-50/90 backdrop-blur-sm border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-stone-900" style={{ fontFamily: 'var(--font-heading-b)', letterSpacing: '-0.02em' }}>
            DealRadar
          </span>
          <div className="flex items-center gap-6 text-sm text-stone-500">
            <Link href="/search" className="hover:text-stone-900 transition-colors">Search</Link>
            <a href="#insights" className="hover:text-stone-900 transition-colors">Insights</a>
            <button className="text-white rounded-full px-5 py-1.5 text-sm font-medium transition-colors"
              style={{ background: '#2d6a4f' }}
            >
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden flex items-end pt-16">
        {/* Full-bleed image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />

        {/* Warm gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(20,20,15,0.88) 0%, rgba(20,20,15,0.4) 50%, rgba(20,20,15,0.1) 100%)' }}
        />

        {/* Content */}
        <div
          className="relative z-10 w-full max-w-6xl mx-auto px-8 pb-20"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Tag line */}
          <div
            className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80 text-xs font-medium tracking-wide">Live data — updated daily</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-[5.5rem] font-bold text-white leading-[1.02] mb-6"
            style={{ fontFamily: 'var(--font-heading-b)', letterSpacing: '-0.035em' }}
          >
            Riga property.<br />
            Intelligence first.
          </h1>

          <p className="text-white/60 text-lg mb-10 max-w-lg leading-relaxed">
            We aggregate every listing, eliminate duplicates, and rank by deal quality.
            Find undervalued property before the competition.
          </p>

          <HeroSearch theme="dark" />
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-8 py-14 grid grid-cols-3 gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div
                className="text-3xl font-bold mb-1.5"
                style={{ fontFamily: 'var(--font-heading-b)', color: '#52b788' }}
              >
                {s.value}
              </div>
              <div className="text-sm text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 py-28">
        <div className="grid sm:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">How it works</span>
            <h2
              className="text-4xl font-bold text-stone-900 mt-3 mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-heading-b)', letterSpacing: '-0.025em' }}
            >
              Three sources.<br />One clean view.
            </h2>
            <p className="text-stone-500 leading-relaxed mb-8">
              Property listings are fragmented across SS.com, City24, and court auction platforms.
              We pull, normalise, and deduplicate them daily — then score each against real transaction comps.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 border-b-2 border-stone-900 hover:border-emerald-600 hover:text-emerald-700 transition-colors pb-0.5"
            >
              Start searching →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: '⬇', title: 'Aggregate', body: 'SS.com, City24 and court auction sources — all in one place.' },
              { icon: '⚡', title: 'Deduplicate', body: '960+ cross-portal pairs identified and merged so far.' },
              { icon: '🎯', title: 'Score', body: 'ROI ranked by estimated renovation cost vs comparable sale prices.' },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-5 rounded-xl bg-stone-100 border border-stone-200/60">
                <span className="text-2xl mt-0.5">{item.icon}</span>
                <div>
                  <div className="font-semibold text-stone-900 mb-1" style={{ fontFamily: 'var(--font-heading-b)' }}>
                    {item.title}
                  </div>
                  <div className="text-sm text-stone-500">{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Insights ─────────────────────────────────────────────────── */}
      <section id="insights" className="bg-stone-100 border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-8 py-24">
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Market insights</span>
              <h2
                className="text-4xl font-bold text-stone-900 mt-3"
                style={{ fontFamily: 'var(--font-heading-b)', letterSpacing: '-0.025em' }}
              >
                Read the market.
              </h2>
            </div>
            <a href="#" className="text-sm text-stone-400 hover:text-stone-700 transition-colors hidden sm:block">
              All articles →
            </a>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {ARTICLES.map((a, i) => (
              <article key={i} className="group cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">{a.tag}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-[10px] text-stone-400">{a.date}</span>
                </div>
                <h3
                  className="text-base font-semibold text-stone-800 group-hover:text-stone-900 mb-2 leading-snug transition-colors"
                  style={{ fontFamily: 'var(--font-heading-b)' }}
                >
                  {a.headline}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed line-clamp-3">{a.excerpt}</p>
                <div className="mt-4 text-xs font-semibold text-emerald-700 group-hover:text-emerald-600 transition-colors">
                  Read more →
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────── */}
      <section className="py-28 text-center px-8">
        <h2
          className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4"
          style={{ fontFamily: 'var(--font-heading-b)', letterSpacing: '-0.025em' }}
        >
          Ready to find your deal?
        </h2>
        <p className="text-stone-500 mb-10 text-lg">5,700+ active listings. Updated daily.</p>
        <Link
          href="/search"
          className="inline-block text-white font-semibold px-10 py-4 rounded-full text-sm tracking-wide transition-colors duration-200"
          style={{ background: '#2d6a4f' }}
        >
          Browse all listings →
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-stone-200 px-8 py-8 text-stone-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 DealRadar — Riga Property Intelligence</span>
        <span>Data updated daily · Not financial advice</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        :root {
          --font-heading-b: 'Playfair Display', Georgia, serif;
          --font-body-b: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>
    </div>
  )
}
