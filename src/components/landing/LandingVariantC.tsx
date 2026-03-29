'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { HeroSearch } from './HeroSearch'

// Clean modern Riga building / urban detail
const HERO_IMAGE = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=85&auto=format&fit=crop'

const LIVE_STATS = [
  { value: '5,700', unit: '+', label: 'Active listings' },
  { value: '960', unit: '+', label: 'Cross-matched pairs' },
  { value: '€1,100', unit: '/m²', label: 'Median deal price' },
]

const ARTICLES = [
  {
    date: 'Mar 2026',
    tag: 'Market Intel',
    headline: 'Pre-war Riga apartments: the €1,100/m² opportunity window is closing',
    excerpt: 'A structural price floor is forming in Centrs and Āgenskalns.',
  },
  {
    date: 'Feb 2026',
    tag: 'Strategy',
    headline: 'Why court auctions are the most overlooked deal source in Latvia',
    excerpt: 'Izsoles valuations are independent, legally mandated, and rarely on portals.',
  },
  {
    date: 'Jan 2026',
    tag: 'Data',
    headline: 'Cross-platform deduplication: how we catch the same property listed twice',
    excerpt: 'SS.com and City24 often list identical properties. Our matcher finds them.',
  },
]

export function LandingVariantC() {
  const [loaded, setLoaded] = useState(false)
  const [ticker, setTicker] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60)
    return () => clearTimeout(t)
  }, [])

  // Subtle ticker animation on the live count
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(v => v + 1)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="min-h-screen text-white"
      style={{
        fontFamily: 'var(--font-body-c)',
        background: '#0c1220',
      }}
    >
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8"
        style={{ background: 'rgba(12,18,32,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-base font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-heading-c)', letterSpacing: '-0.02em' }}
            >
              DealRadar
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ background: 'rgba(99,202,183,0.12)', color: '#63cab7', letterSpacing: '0.15em' }}
            >
              Beta
            </span>
          </div>
          <div className="flex items-center gap-8 text-xs font-medium text-white/40 tracking-wide uppercase">
            <Link href="/search" className="hover:text-white/80 transition-colors">Search</Link>
            <a href="#insights" className="hover:text-white/80 transition-colors">Insights</a>
            <button
              className="text-xs font-semibold tracking-widest uppercase border border-white/20 hover:border-white/40 rounded px-4 py-1.5 text-white/60 hover:text-white transition-all"
            >
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Right-side image — not full bleed, occupies right 40% */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[42%] hidden lg:block"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1.2s ease 0.4s',
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          />
          {/* Left fade */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #0c1220 0%, transparent 35%)' }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(99,202,183,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,202,183,0.15) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Left content */}
        <div
          className="relative z-10 flex flex-col justify-end flex-1 max-w-6xl mx-auto w-full px-8 pb-20 pt-40"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          {/* Live indicator */}
          <div className="flex items-center gap-2 mb-10">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#63cab7', boxShadow: '0 0 6px #63cab7', animation: 'pulse-dot 2s infinite' }}
            />
            <span
              className="text-[11px] font-mono font-semibold uppercase tracking-widest"
              style={{ color: '#63cab7', letterSpacing: '0.18em' }}
            >
              Live data · updated daily
            </span>
          </div>

          {/* Headline — typographic-led */}
          <div className="max-w-2xl mb-8">
            <h1
              className="text-[clamp(3rem,7vw,6rem)] font-bold leading-[1.0] text-white mb-0"
              style={{ fontFamily: 'var(--font-heading-c)', letterSpacing: '-0.04em' }}
            >
              Property<br />intelligence<br />
              <span style={{ color: '#63cab7' }}>for Riga.</span>
            </h1>
          </div>

          {/* Supporting */}
          <p className="text-white/45 text-base mb-12 max-w-md leading-relaxed" style={{ fontFamily: 'var(--font-body-c)' }}>
            We aggregate, deduplicate, and rank every listing across SS.com,
            City24 and court auctions. Stop scrolling portals. Start buying.
          </p>

          {/* Search */}
          <div className="max-w-2xl">
            <HeroSearch theme="dark" />
          </div>
        </div>

        {/* Live stats bar at bottom of hero */}
        <div
          className="relative z-10 border-t border-white/8"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div className="max-w-6xl mx-auto px-8 py-6 grid grid-cols-3 gap-8">
            {LIVE_STATS.map((s, i) => (
              <div key={i} className="flex items-baseline gap-1.5">
                <span
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'var(--font-heading-c)', color: '#63cab7', letterSpacing: '-0.02em' }}
                >
                  {s.value}
                  <span className="text-lg" style={{ color: '#63cab7', opacity: 0.6 }}>{s.unit}</span>
                </span>
                <span className="text-xs text-white/35 ml-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/8 max-w-6xl mx-auto px-8 py-24">
        <div className="grid lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
              style={{ color: '#63cab7' }}
            >
              Process
            </span>
            <h2
              className="text-3xl font-bold text-white mt-3 leading-tight"
              style={{ fontFamily: 'var(--font-heading-c)', letterSpacing: '-0.025em' }}
            >
              How we build the edge.
            </h2>
          </div>
          <div className="lg:col-span-3 grid sm:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Aggregate', body: 'SS.com, City24, and court auctions pulled and normalised daily — one address standard.' },
              { n: '02', title: 'Deduplicate', body: 'Cross-source matching eliminates the same property appearing at different prices on different portals.' },
              { n: '03', title: 'Rank', body: 'Each listing scored on ROI potential: estimated renovation cost vs comparable premium sale prices.' },
            ].map(step => (
              <div key={step.n}>
                <div
                  className="text-4xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-mono-c)', color: 'rgba(99,202,183,0.18)', letterSpacing: '-0.05em' }}
                >
                  {step.n}
                </div>
                <div
                  className="text-sm font-semibold text-white mb-2"
                  style={{ fontFamily: 'var(--font-heading-c)' }}
                >
                  {step.title}
                </div>
                <div className="text-sm text-white/40 leading-relaxed">{step.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Insights ─────────────────────────────────────────────────────── */}
      <section id="insights" className="border-t border-white/8 max-w-6xl mx-auto px-8 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
              style={{ color: '#63cab7' }}
            >
              Insights
            </span>
            <h2
              className="text-3xl font-bold text-white mt-3"
              style={{ fontFamily: 'var(--font-heading-c)', letterSpacing: '-0.025em' }}
            >
              Read the market.
            </h2>
          </div>
          <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono uppercase tracking-widest hidden sm:block">
            All articles →
          </a>
        </div>
        <div className="grid sm:grid-cols-3 gap-px bg-white/8">
          {ARTICLES.map((a, i) => (
            <article key={i} className="group cursor-pointer p-8 bg-[#0c1220] hover:bg-white/3 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-widest"
                  style={{ color: '#63cab7' }}
                >
                  {a.tag}
                </span>
                <span className="text-white/15">·</span>
                <span className="text-[10px] font-mono text-white/25">{a.date}</span>
              </div>
              <h3
                className="text-sm font-semibold text-white/80 group-hover:text-white mb-3 leading-snug transition-colors"
                style={{ fontFamily: 'var(--font-heading-c)' }}
              >
                {a.headline}
              </h3>
              <p className="text-xs text-white/35 leading-relaxed">{a.excerpt}</p>
              <div
                className="mt-6 text-[10px] font-mono uppercase tracking-widest transition-colors"
                style={{ color: 'rgba(99,202,183,0.5)' }}
              >
                Read →
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/8 py-24 text-center px-8">
        <div
          className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] mb-5"
          style={{ color: '#63cab7' }}
        >
          Start searching
        </div>
        <h2
          className="text-4xl font-bold text-white mb-3"
          style={{ fontFamily: 'var(--font-heading-c)', letterSpacing: '-0.03em' }}
        >
          5,700+ listings. Zero noise.
        </h2>
        <p className="text-white/35 mb-10 text-sm">Updated daily. No account required to browse.</p>
        <Link
          href="/search"
          className="inline-block font-semibold px-10 py-3.5 text-sm tracking-wide transition-colors duration-200 border"
          style={{ background: '#63cab7', borderColor: '#63cab7', color: '#0c1220', borderRadius: '4px' }}
        >
          Browse all listings →
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-xs font-mono text-white/20">© 2026 DealRadar</span>
        <span className="text-xs font-mono text-white/15">Data updated daily · Not financial advice</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500;700&display=swap');
        :root {
          --font-heading-c: 'Syne', sans-serif;
          --font-body-c: 'Inter', sans-serif;
          --font-mono-c: 'JetBrains Mono', monospace;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
