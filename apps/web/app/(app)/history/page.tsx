'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getHistory,
  getHistoryItem,
  deleteHistoryItem,
  saveResult,
  type HistoryItem,
} from '@/lib/api'

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function truncate(str: string, n: number) {
  return str.length > n ? `${str.slice(0, n)}…` : str
}

export default function HistoryPage() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    getHistory()
      .then(setMeetings)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  const handleLoad = async (id: string, dest: '/results' | '/chat') => {
    setActionId(id)
    try {
      const result = await getHistoryItem(id)
      saveResult(result)
      router.push(dest)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load meeting')
      setActionId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this meeting and its conversation history?')) return
    setActionId(id)
    try {
      await deleteHistoryItem(id)
      setMeetings(prev => prev.filter(m => m.meeting_id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setActionId(null)
    }
  }

  return (
    <main className="pb-band px-xxl pt-xxl min-h-screen relative">
      <div className="absolute top-0 left-0 right-0 h-[400px] atmospheric-blue opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-section flex items-start justify-between gap-xxl">
          <div>
            <h1
              className="font-display-xl text-primary leading-tight"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              Meeting History
            </h1>
            {!loading && (
              <p className="text-body-md text-mute mt-sm">
                {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} analyzed
              </p>
            )}
          </div>
          <Link
            href="/upload"
            className="flex-shrink-0 flex items-center gap-sm bg-primary text-canvas px-xl py-md rounded-lg font-button-md text-button-md hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            New Meeting
          </Link>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-xl p-xl bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center justify-between">
            <p className="text-body-sm text-accent-red">{error}</p>
            <button onClick={() => setError(null)} className="text-mute hover:text-primary ml-xl">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-band">
            <div className="flex gap-xs">
              {['-0.3s', '-0.15s', '0s'].map(d => (
                <span
                  key={d}
                  className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"
                  style={{ animationDelay: d }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && meetings.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-band text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-hairline-strong flex items-center justify-center mb-xxl">
              <span className="material-symbols-outlined text-mute" style={{ fontSize: 32 }}>history</span>
            </div>
            <h2 className="text-headline-sm font-headline-sm text-primary mb-md">No meetings yet</h2>
            <p className="text-body-md text-mute mb-xxl max-w-sm">
              Analyze your first meeting to see it here. Upload an audio file or paste a YouTube link.
            </p>
            <Link
              href="/upload"
              className="flex items-center gap-sm bg-primary text-canvas px-xl py-md rounded-lg font-button-md text-button-md hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload_file</span>
              Upload your first meeting
            </Link>
          </div>
        )}

        {/* Meeting list */}
        {!loading && meetings.length > 0 && (
          <div className="space-y-lg">
            {meetings.map(meeting => {
              const busy = actionId === meeting.meeting_id
              return (
                <div
                  key={meeting.meeting_id}
                  className="group bg-surface-card border border-hairline-strong rounded-xl p-xxl hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-xxl">
                    {/* Left: meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-sm mb-sm flex-wrap">
                        <span
                          className={`text-[10px] uppercase tracking-[1px] font-bold px-sm py-xxs rounded-full ${
                            meeting.language === 'hinglish'
                              ? 'bg-accent-orange/20 text-accent-orange'
                              : 'bg-accent-blue/20 text-accent-blue'
                          }`}
                        >
                          {meeting.language}
                        </span>
                        <span className="text-caption text-mute">{formatRelative(meeting.created_at)}</span>
                      </div>

                      <h3 className="font-headline-sm text-headline-sm text-primary mb-xs truncate">
                        {meeting.title}
                      </h3>

                      {meeting.source && (
                        <p className="text-caption text-stone font-code-md">
                          {truncate(meeting.source, 64)}
                        </p>
                      )}
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-sm flex-shrink-0">
                      <button
                        onClick={() => handleLoad(meeting.meeting_id, '/results')}
                        disabled={busy}
                        className="flex items-center gap-xs bg-surface-elevated border border-hairline hover:border-hairline-strong px-md py-sm rounded-lg text-body-sm font-body-sm text-charcoal hover:text-primary transition-all disabled:opacity-40"
                      >
                        {busy ? (
                          <span className="w-3.5 h-3.5 border-2 border-mute border-t-primary rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>dashboard</span>
                        )}
                        Results
                      </button>

                      <button
                        onClick={() => handleLoad(meeting.meeting_id, '/chat')}
                        disabled={busy}
                        className="flex items-center gap-xs bg-accent-blue/10 border border-accent-blue/30 hover:border-accent-blue/60 px-md py-sm rounded-lg text-body-sm font-body-sm text-accent-blue transition-all disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>auto_awesome</span>
                        Ask Voca
                      </button>

                      <button
                        onClick={() => handleDelete(meeting.meeting_id)}
                        disabled={busy}
                        className="p-sm rounded-lg text-mute hover:text-accent-red transition-colors disabled:opacity-40"
                        title="Delete meeting"
                      >
                        {busy ? (
                          <span className="w-4 h-4 border-2 border-mute border-t-accent-red rounded-full animate-spin block" />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
