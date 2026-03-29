'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { HeroSearch } from './HeroSearch'

// Unsplash free-to-use Riga / Baltic real estate photography
const HERO_IMAGE = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1920&q=80&auto=format&fit=crop'

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

export function LandingVariantA() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // Parallax on hero
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-stone-950 text-white" style={{ fontFamily: 'var(--font-body)' }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }}
      >
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
          DealRadar
        </span>
        <div className="flex items-center gap-6 text-sm text-white/70">
          <Link href="/search" className="hover:text-white transition-colors">Search</Link>
          <a href="#insights" className="hover:text-white transition-colors">Insights</a>
          <button className="border border-white/25 hover:border-white/50 rounded-full px-5 py-1.5 text-white hover:text-white transition-all duration-200">
            Sign in
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      >
        {/* Background image with parallax */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.1)` }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          />
        </div>

        {/* Gradient overlay — dark at bottom, lighter at top */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.25) 100%)' }}
        />

        {/* Hero content */}
        <div
          className="relative z-10 max-w-4xl mx-auto w-full px-8 pb-20 pt-40"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-amber-400" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
              Riga Property Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.05]"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}
          >
            Find the deal<br />
            <span style={{ color: '#f59e0b' }}>before</span> the market does.
          </h1>

          {/* Supporting sentence */}
          <p className="text-lg text-white/65 mb-10 max-w-xl leading-relaxed">
            Real-time property intelligence across Riga. We aggregate, deduplicate and
            surface undervalued listings — so you stop browsing and start buying.
          </p>

          {/* Search widget */}
          <HeroSearch theme="dark" />
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1.2s ease 0.6s',
            animation: loaded ? 'bounce 2s infinite 1.5s' : 'none',
          }}
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────────── */}
      <section className="border-y border-white/8 bg-white/4 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-8 py-12 grid grid-cols-3 gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div
                className="text-3xl font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-heading)', color: '#f59e0b' }}
              >
                {s.value}
              </div>
              <div className="text-sm text-white/50">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-8 py-24">
        <div className="mb-14">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">How it works</span>
          <h2
            className="text-4xl font-bold text-white mt-3 leading-tight"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
          >
            We do the work.<br />You make the call.
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-10">
          {[
            {
              n: '01',
              title: 'Aggregate',
              body: 'We pull every listing from SS.com, City24 and court auction sources daily — no gaps, no manual searching.',
            },
            {
              n: '02',
              title: 'Deduplicate',
              body: 'The same property often appears on multiple portals at different prices. We identify and cluster them.',
            },
            {
              n: '03',
              title: 'Surface deals',
              body: 'Our scoring model flags listings priced below market — ranked by ROI potential for a full-gut renovation.',
            },
          ].map(step => (
            <div key={step.n}>
              <span
                className="text-5xl font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: 'rgba(245,158,11,0.2)', letterSpacing: '-0.04em' }}
              >
                {step.n}
              </span>
              <h3 className="text-lg font-semibold text-white mt-3 mb-2">{step.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Insights ─────────────────────────────────────────────────── */}
      <section id="insights" className="max-w-4xl mx-auto px-8 py-16 border-t border-white/8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">Market insights</span>
            <h2
              className="text-4xl font-bold text-white mt-3"
              style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
            >
              The data speaks.
            </h2>
          </div>
          <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors hidden sm:block">
            All articles →
          </a>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {ARTICLES.map((a, i) => (
            <article key={i} className="group cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/70">{a.tag}</span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] text-white/30">{a.date}</span>
              </div>
              <h3
                className="text-base font-semibold text-white/90 group-hover:text-white mb-2 leading-snug transition-colors"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {a.headline}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed line-clamp-3">{a.excerpt}</p>
              <div className="mt-4 text-xs text-amber-400/60 group-hover:text-amber-400 transition-colors">
                Read more →
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-t border-white/8 py-24 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.07) 0%, transparent 60%)' }}
      >
        <h2
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}
        >
          Ready to find your deal?
        </h2>
        <p className="text-white/50 mb-10 text-lg">5,700+ active listings. Updated daily.</p>
        <Link
          href="/search"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-10 py-4 rounded-full text-sm tracking-wide transition-colors duration-200"
        >
          Browse all listings →
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 px-8 py-8 text-white/25 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 DealRadar — Riga Property Intelligence</span>
        <span>Data updated daily · Not financial advice</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        :root {
          --font-heading: 'Cormorant Garamond', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </div>
  )
}
