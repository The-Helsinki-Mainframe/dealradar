'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeroSearch } from './HeroSearch'

// Premium Riga residential — warm interior or pre-war facade
const HERO_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85&auto=format&fit=crop'

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
    headline: 'Cross-platform deduplication: how we catch the same property twice',
    excerpt: 'SS.com and City24 often list identical properties. Our matcher finds them.',
  },
]

export function LandingVariantD() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Parchment + bordeaux palette
  const cream = '#f6f1ea'
  const parchment = '#ede6d8'
  const bordeaux = '#6b1f2a'
  const bordeauxLight = '#8b3040'
  const text = '#1a1208'
  const textMuted = '#7a6b55'

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: 'var(--font-body-d)', background: cream, color: text }}
    >
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: cream, borderColor: 'rgba(26,18,8,0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-10 h-16 flex items-center justify-between">
          <span
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-heading-d)', letterSpacing: '-0.01em', color: text }}
          >
            DealRadar
          </span>
          <div className="flex items-center gap-8 text-sm" style={{ color: textMuted }}>
            <Link href="/search" className="hover:text-stone-900 transition-colors">Search</Link>
            <a href="#insights" className="hover:text-stone-900 transition-colors">Insights</a>
            <button
              className="font-semibold px-6 py-2 text-sm transition-opacity hover:opacity-80"
              style={{ background: bordeaux, color: cream, borderRadius: '2px' }}
            >
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero — split layout ───────────────────────────────────────────── */}
      <section className="min-h-screen pt-16 flex flex-col lg:flex-row">

        {/* Left — content */}
        <div
          className="flex-1 flex flex-col justify-center px-10 lg:px-16 py-20 lg:py-0 max-w-2xl"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-12" style={{ background: bordeaux }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: bordeaux }}
            >
              Riga Property Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl lg:text-[3.8rem] font-bold leading-[1.05] mb-6"
            style={{
              fontFamily: 'var(--font-heading-d)',
              letterSpacing: '-0.02em',
              color: text,
            }}
          >
            The Riga property market,<br />
            <em style={{ fontStyle: 'italic', color: bordeaux }}>intelligently</em> filtered.
          </h1>

          {/* Body */}
          <p className="text-base leading-relaxed mb-10" style={{ color: textMuted, maxWidth: '36ch' }}>
            We aggregate every listing from SS.com, City24 and court auctions,
            eliminate duplicates, and surface undervalued properties — ranked by
            renovation ROI.
          </p>

          {/* Search */}
          <HeroSearch theme="light" />

          {/* Trust signals */}
          <div className="flex items-center gap-8 mt-10">
            {[
              { n: '5,700+', l: 'Listings' },
              { n: '960+', l: 'Matched pairs' },
              { n: 'Daily', l: 'Updates' },
            ].map(s => (
              <div key={s.l}>
                <div
                  className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-heading-d)', color: text, letterSpacing: '-0.02em' }}
                >
                  {s.n}
                </div>
                <div className="text-xs" style={{ color: textMuted }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — full-height image */}
        <div
          className="hidden lg:block relative flex-1"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1.2s ease 0.3s',
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          />
          {/* Subtle left vignette for blending */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to right, ${cream} 0%, transparent 12%)` }}
          />
          {/* Bottom caption */}
          <div
            className="absolute bottom-8 right-8 text-right"
            style={{
              opacity: loaded ? 0.6 : 0,
              transition: 'opacity 1.5s ease 1s',
            }}
          >
            <div className="text-xs" style={{ color: cream, fontFamily: 'var(--font-body-d)' }}>
              Centrs district, Rīga
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section
        className="border-t"
        style={{ background: parchment, borderColor: 'rgba(26,18,8,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-10 lg:px-16 py-24">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <div className="h-px w-12 mb-6" style={{ background: bordeaux }} />
              <h2
                className="text-3xl font-bold leading-tight"
                style={{ fontFamily: 'var(--font-heading-d)', letterSpacing: '-0.02em', color: text }}
              >
                We do the work.<br />You make the call.
              </h2>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-3 gap-10">
              {[
                { n: 'I', title: 'Aggregate', body: 'Every listing from every source, normalised to a single address standard.' },
                { n: 'II', title: 'Deduplicate', body: 'The same property often appears twice at different prices. We find and merge them.' },
                { n: 'III', title: 'Rank by ROI', body: 'Deal scores based on buy price, estimated full-gut cost, and comparable sale prices.' },
              ].map(step => (
                <div key={step.n}>
                  <div
                    className="text-3xl font-bold mb-5"
                    style={{ fontFamily: 'var(--font-heading-d)', color: `rgba(107,31,42,0.2)`, fontStyle: 'italic' }}
                  >
                    {step.n}
                  </div>
                  <div
                    className="text-sm font-semibold mb-2"
                    style={{ fontFamily: 'var(--font-heading-d)', color: text }}
                  >
                    {step.title}
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: textMuted }}>{step.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Insights ─────────────────────────────────────────────────────── */}
      <section id="insights" className="max-w-7xl mx-auto px-10 lg:px-16 py-24">
        <div className="flex items-end justify-between mb-14">
          <div>
            <div className="h-px w-12 mb-5" style={{ background: bordeaux }} />
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: 'var(--font-heading-d)', letterSpacing: '-0.02em', color: text }}
            >
              Market insights.
            </h2>
          </div>
          <a href="#" className="text-sm hidden sm:block transition-colors" style={{ color: textMuted }}>
            All articles →
          </a>
        </div>
        <div className="grid sm:grid-cols-3 gap-10">
          {ARTICLES.map((a, i) => (
            <article key={i} className="group cursor-pointer border-t pt-6" style={{ borderColor: 'rgba(26,18,8,0.12)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: bordeaux }}
                >
                  {a.tag}
                </span>
                <span style={{ color: 'rgba(26,18,8,0.2)' }}>·</span>
                <span className="text-[10px]" style={{ color: textMuted }}>{a.date}</span>
              </div>
              <h3
                className="text-sm font-semibold mb-2 leading-snug group-hover:underline"
                style={{ fontFamily: 'var(--font-heading-d)', color: text }}
              >
                {a.headline}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{a.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section
        className="border-t py-24 text-center px-8"
        style={{ background: parchment, borderColor: 'rgba(26,18,8,0.1)' }}
      >
        <div className="h-px w-16 mx-auto mb-10" style={{ background: bordeaux }} />
        <h2
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading-d)', letterSpacing: '-0.02em', color: text }}
        >
          Ready to find your deal?
        </h2>
        <p className="text-base mb-10" style={{ color: textMuted }}>5,700+ active listings. Updated daily.</p>
        <Link
          href="/search"
          className="inline-block font-semibold px-10 py-3.5 text-sm transition-opacity hover:opacity-85"
          style={{ background: bordeaux, color: cream, borderRadius: '2px' }}
        >
          Browse all listings →
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="border-t px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
        style={{ borderColor: 'rgba(26,18,8,0.1)', color: textMuted }}
      >
        <span>© 2026 DealRadar — Riga Property Intelligence</span>
        <span>Data updated daily · Not financial advice</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,700;0,800;1,700&family=Lato:wght@400;500;600&display=swap');
        :root {
          --font-heading-d: 'EB Garamond', Georgia, serif;
          --font-body-d: 'Lato', sans-serif;
        }
      `}</style>
    </div>
  )
}
