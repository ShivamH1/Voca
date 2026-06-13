'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadResult, type AnalysisResult } from '@/lib/api'
import Link from 'next/link'

function parseListItems(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map(chunk => chunk.trim())
    .filter(Boolean)
}

function CheckableItem({ text }: { text: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <li className="flex items-start gap-md group cursor-pointer" onClick={() => setChecked(c => !c)}>
      <div
        className={`mt-xs w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all ${
          checked ? 'bg-primary border-primary' : 'bg-canvas border-hairline-strong'
        }`}
      >
        {checked && <span className="material-symbols-outlined text-canvas" style={{ fontSize: 12 }}>check</span>}
      </div>
      <span className={`text-body-sm font-body-sm text-charcoal group-hover:text-primary transition-colors leading-relaxed ${checked ? 'line-through opacity-50' : ''}`}>
        {text}
      </span>
    </li>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showFullTranscript, setShowFullTranscript] = useState(false)

  useEffect(() => {
    const data = loadResult()
    if (!data) {
      router.replace('/upload')
    } else {
      setResult(data)
    }
  }, [router])

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex gap-xs">
          <span className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
          <span className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }} />
          <span className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" />
        </div>
      </div>
    )
  }

  const actionItems = parseListItems(result.action_items)
  const decisions = parseListItems(result.decisions)
  const questions = parseListItems(result.questions)

  return (
    <main className="pb-band px-xxl pt-xxl min-h-screen relative">
      {/* Atmospheric glow */}
      <div className="absolute top-0 left-0 right-0 h-[400px] atmospheric-green opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-section">
          <div className="flex items-center gap-sm mb-md">
            <span className="bg-accent-green/20 text-accent-green px-sm py-xxs rounded-full text-[10px] uppercase tracking-[1px] font-bold">
              Analysis Complete
            </span>
            <span className="text-ash text-caption">Powered by Whisper + Mistral AI</span>
          </div>
          <h1 className="font-display-xl text-primary max-w-3xl leading-tight" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
            {result.title}
          </h1>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xxl">
          {/* Summary */}
          <section className="lg:col-span-12">
            <div className="bg-surface-card p-xxl rounded-xl border border-hairline-strong">
              <h2 className="text-ash font-body-sm text-body-sm uppercase tracking-wider mb-lg">Executive Summary</h2>
              <p className="text-primary font-body-lg text-body-lg leading-relaxed whitespace-pre-line">
                {result.summary}
              </p>
            </div>
          </section>

          {/* Action Items */}
          <section className="lg:col-span-4">
            <div className="bg-surface-card border border-hairline-strong p-xl rounded-xl h-full">
              <div className="flex items-center gap-sm mb-xl">
                <span className="material-symbols-outlined text-accent-blue" style={{ fontSize: 20 }}>task_alt</span>
                <h3 className="text-headline-sm font-headline-sm text-primary">Action Items</h3>
              </div>
              {actionItems.length ? (
                <ul className="space-y-md">
                  {actionItems.map((item, i) => <CheckableItem key={i} text={item} />)}
                </ul>
              ) : (
                <p className="text-body-sm text-mute italic">No action items found.</p>
              )}
            </div>
          </section>

          {/* Decisions */}
          <section className="lg:col-span-4">
            <div className="bg-surface-card border border-hairline-strong p-xl rounded-xl h-full">
              <div className="flex items-center gap-sm mb-xl">
                <span className="material-symbols-outlined text-accent-green" style={{ fontSize: 20 }}>verified</span>
                <h3 className="text-headline-sm font-headline-sm text-primary">Decisions</h3>
              </div>
              {decisions.length ? (
                <ul className="space-y-md">
                  {decisions.map((item, i) => (
                    <li key={i} className="flex items-start gap-sm">
                      <span className="text-accent-green mt-xxs flex-shrink-0">→</span>
                      <p className="text-body-sm text-charcoal leading-relaxed whitespace-pre-line">{item}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-sm text-mute italic">No key decisions found.</p>
              )}
            </div>
          </section>

          {/* Open Questions */}
          <section className="lg:col-span-4">
            <div className="bg-surface-card border border-hairline-strong p-xl rounded-xl h-full">
              <div className="flex items-center gap-sm mb-xl">
                <span className="material-symbols-outlined text-accent-orange" style={{ fontSize: 20 }}>help_center</span>
                <h3 className="text-headline-sm font-headline-sm text-primary">Open Questions</h3>
              </div>
              {questions.length ? (
                <ul className="space-y-md">
                  {questions.map((item, i) => (
                    <li key={i} className="p-md bg-canvas/50 rounded-lg border border-divider-soft">
                      <p className="text-body-sm text-charcoal italic leading-relaxed whitespace-pre-line">{item}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-sm text-mute italic">No open questions found.</p>
              )}
            </div>
          </section>

          {/* Transcript */}
          <section className="lg:col-span-12 mt-xl">
            <div className="bg-surface-deep p-xxl rounded-xl border border-hairline-strong shadow-2xl relative overflow-hidden">
              <div className="absolute top-xxl left-xxl flex gap-xxs">
                <div className="w-2 h-2 rounded-full border border-accent-red opacity-50" />
                <div className="w-2 h-2 rounded-full border border-accent-yellow opacity-50" />
                <div className="w-2 h-2 rounded-full border border-accent-green opacity-50" />
              </div>
              <header className="flex justify-between items-center mb-xxl mt-sm">
                <h3 className="text-headline-sm font-headline-sm text-primary ml-10">Transcript</h3>
                <div className="flex items-center gap-md">
                  <button
                    onClick={() => setShowFullTranscript(v => !v)}
                    className="text-ash text-caption font-caption hover:text-primary transition-colors"
                  >
                    {showFullTranscript ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    onClick={() => {
                      const a = document.createElement('a')
                      a.href = URL.createObjectURL(new Blob([result.transcript], { type: 'text/plain' }))
                      a.download = `${result.title.replace(/\s+/g, '_')}_transcript.txt`
                      a.click()
                    }}
                    className="text-ash hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
                  </button>
                </div>
              </header>
              <div
                className={`font-code-md text-code-md text-charcoal whitespace-pre-line overflow-y-auto hide-scrollbar transition-all duration-500 ${
                  showFullTranscript ? 'max-h-[800px]' : 'max-h-[300px]'
                }`}
              >
                {result.transcript}
              </div>
              {!showFullTranscript && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-surface-deep to-transparent pointer-events-none rounded-b-xl" />
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Ask Voca FAB */}
      <Link
        href="/chat"
        className="fixed bottom-xxl right-xxl z-50 flex items-center gap-md bg-primary text-on-primary px-xl py-md rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-hairline-strong"
      >
        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform" style={{ fontSize: 20 }}>bolt</span>
        <span className="font-button-md text-button-md font-bold">Ask Voca</span>
      </Link>
    </main>
  )
}
