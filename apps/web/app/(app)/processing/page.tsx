'use client'

import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { analyzeSourceStream, saveResult } from '@/lib/api'

type StepStatus = 'pending' | 'active' | 'done' | 'error'

interface Step {
  label: string
  pendingSub: string
  activeSub: string
  doneSub: string
  errorSub: string
}

const STEPS: Step[] = [
  {
    label: 'Audio Processing',
    pendingSub: 'Waiting...',
    activeSub: 'Downloading & chunking audio...',
    doneSub: 'Audio ready',
    errorSub: 'Audio processing failed',
  },
  {
    label: 'Speech-to-Text',
    pendingSub: 'Waiting...',
    activeSub: 'Transcribing with Whisper / Sarvam AI...',
    doneSub: 'Transcript complete',
    errorSub: 'Transcription failed',
  },
  {
    label: 'Summarizing',
    pendingSub: 'Waiting...',
    activeSub: 'Analyzing with Mistral AI...',
    doneSub: 'Insights generated',
    errorSub: 'Analysis failed',
  },
  {
    label: 'Vector DB Indexing',
    pendingSub: 'Waiting...',
    activeSub: 'Embedding into Qdrant...',
    doneSub: 'Knowledge indexed',
    errorSub: 'Indexing failed',
  },
]

const LOG_LINES = [
  { text: '> [SYSTEM] Pipeline initialized', color: 'text-accent-green' },
  { text: '> [AUDIO] Extracting audio stream...', color: 'text-mute' },
  { text: '> [STT] Using Whisper-large-v3-turbo', color: 'text-mute' },
  { text: '> [LLM] Mistral AI summarization temp: 0.3', color: 'text-mute' },
  { text: '> [INDEX] Calculating embeddings...', color: 'text-accent-blue' },
  { text: '> [INDEX] Sharding vector set...', color: 'text-accent-blue' },
  { text: '> [INDEX] Writing to Qdrant cluster...', color: 'text-accent-blue' },
]

function ProcessingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const source = searchParams.get('source') ?? ''
  const language = searchParams.get('language') ?? 'english'

  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>([
    'pending', 'pending', 'pending', 'pending',
  ])
  const [error, setError] = useState<string | null>(null)
  const [logIdx, setLogIdx] = useState(0)
  // Stored so retries resume from the same backend checkpoint
  const meetingIdRef = useRef<string | null>(null)
  const started = useRef(false)

  const runStream = useCallback(
    async (retryMeetingId?: string) => {
      setError(null)

      try {
        const result = await analyzeSourceStream(
          { source, language, meeting_id: retryMeetingId },
          {
            onStart: (id) => {
              meetingIdRef.current = id
            },
            onStep: (step, status) => {
              setStepStatuses((prev) => {
                const next = [...prev]
                next[step] = status
                return next
              })
            },
          },
        )

        setStepStatuses(['done', 'done', 'done', 'done'])
        saveResult(result)
        setTimeout(() => router.push('/results'), 900)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(msg)
        // Mark the actively-running step as errored; leave already-done steps green
        setStepStatuses((prev) => prev.map((s) => (s === 'active' ? 'error' : s)))
      }
    },
    [source, language, router],
  )

  useEffect(() => {
    if (started.current) return
    started.current = true

    const logInterval = setInterval(
      () => setLogIdx((i) => (i + 1) % LOG_LINES.length),
      2800,
    )

    runStream()
    return () => clearInterval(logInterval)
  }, [runStream])

  const handleRetry = () => {
    // Reset only the errored step back to pending; keep already-done steps green.
    // The backend will immediately re-emit "done" events for those steps,
    // then resume from the failed one.
    setStepStatuses((prev) => prev.map((s) => (s === 'error' ? 'pending' : s)))
    runStream(meetingIdRef.current ?? undefined)
  }

  const allDone = stepStatuses.every((s) => s === 'done')
  const hasError = stepStatuses.some((s) => s === 'error')
  const doneCount = stepStatuses.filter((s) => s === 'done').length
  const lineProgress = allDone ? 100 : doneCount === 0 ? 0 : (doneCount / STEPS.length) * 85

  return (
    <main className="flex-grow pt-20 relative overflow-hidden flex flex-col items-center justify-center min-h-screen">
      <div className="absolute inset-0 glow-top pointer-events-none" />

      <div className="container max-w-2xl px-xxl py-section relative z-10 flex flex-col items-center">
        {hasError ? (
          <h1
            className="font-display-xl text-accent-red text-center mb-section tracking-tighter"
            style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}
          >
            Processing failed
          </h1>
        ) : allDone ? (
          <h1
            className="font-display-xl text-accent-green text-center mb-section tracking-tighter"
            style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}
          >
            Analysis complete!
          </h1>
        ) : (
          <h1
            className="font-display-xl text-primary text-center mb-section tracking-tighter"
            style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}
          >
            Processing meeting...
          </h1>
        )}

        {/* Pipeline stepper */}
        <div className="w-full space-y-0 relative">
          {/* Background track */}
          <div className="absolute left-[11px] top-6 bottom-6 w-[2px] pipeline-line" />

          {/* Filled progress line */}
          {!allDone && lineProgress > 0 && (
            <div
              className="absolute left-[11px] top-6 w-[2px] pipeline-line-active transition-all duration-700 ease-in-out"
              style={{ height: `${lineProgress}%` }}
            />
          )}
          {allDone && (
            <div className="absolute left-[11px] top-6 bottom-6 w-[2px] pipeline-line-active" />
          )}

          {STEPS.map((step, i) => {
            const status = stepStatuses[i]
            return (
              <div key={step.label} className="flex items-start gap-xxl pb-xxl relative">
                {/* Step indicator */}
                <div
                  className={`z-10 w-6 h-6 rounded-full flex items-center justify-center border-4 border-canvas transition-all duration-500 ${
                    status === 'done'
                      ? 'bg-accent-blue'
                      : status === 'active'
                        ? 'bg-canvas border-2 border-accent-blue step-pulse'
                        : status === 'error'
                          ? 'bg-accent-red'
                          : 'bg-surface-container-high border-2 border-hairline-strong'
                  }`}
                >
                  {status === 'done' && (
                    <span
                      className="material-symbols-outlined text-canvas font-bold"
                      style={{ fontSize: 14 }}
                    >
                      check
                    </span>
                  )}
                  {status === 'active' && (
                    <div className="w-2 h-2 rounded-full bg-accent-blue" />
                  )}
                  {status === 'error' && (
                    <span
                      className="material-symbols-outlined text-canvas"
                      style={{ fontSize: 14 }}
                    >
                      close
                    </span>
                  )}
                </div>

                {/* Step text */}
                <div className="flex flex-col">
                  <span
                    className={`font-headline-sm text-headline-sm transition-colors duration-300 ${
                      status === 'active'
                        ? 'text-accent-blue'
                        : status === 'done'
                          ? 'text-primary'
                          : status === 'error'
                            ? 'text-accent-red'
                            : 'text-mute'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="font-code-md text-code-md text-ash mt-xxs">
                    {status === 'done'
                      ? step.doneSub
                      : status === 'active'
                        ? step.activeSub
                        : status === 'error'
                          ? step.errorSub
                          : step.pendingSub}
                  </span>
                  {status === 'active' && !hasError && (
                    <span className="flex gap-1 mt-xs">
                      <span
                        className="w-1 h-1 bg-accent-blue rounded-full animate-bounce"
                        style={{ animationDelay: '-0.3s' }}
                      />
                      <span
                        className="w-1 h-1 bg-accent-blue rounded-full animate-bounce"
                        style={{ animationDelay: '-0.15s' }}
                      />
                      <span className="w-1 h-1 bg-accent-blue rounded-full animate-bounce" />
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Error panel with retry */}
        {hasError && error && (
          <div className="mt-xxl w-full p-xl bg-accent-red/10 border border-accent-red/30 rounded-xl">
            <p className="text-body-sm text-accent-red mb-md">{error}</p>
            <div className="flex items-center gap-md flex-wrap">
              <button
                onClick={handleRetry}
                className="bg-primary text-canvas px-xxl py-sm rounded-lg text-button-md font-button-md hover:opacity-90 transition-opacity active:scale-95"
              >
                Retry from failed step
              </button>
              <button
                onClick={() => router.push('/upload')}
                className="text-body-sm text-mute hover:text-primary transition-colors underline"
              >
                Start over
              </button>
            </div>
            {meetingIdRef.current && (
              <p className="text-caption text-ash mt-sm">
                Already-completed steps will be skipped on retry.
              </p>
            )}
          </div>
        )}

        {/* Cancel (only while running without error) */}
        {!hasError && !allDone && (
          <div className="mt-section flex flex-col items-center gap-xl w-full">
            <div className="w-full h-px bg-hairline-strong" />
            <button
              onClick={() => router.push('/upload')}
              className="bg-surface-elevated text-primary border border-hairline-strong px-xxl py-sm rounded-lg text-button-md font-button-md hover:bg-surface-container-high transition-colors active:scale-95"
            >
              Cancel
            </button>
            <p className="text-caption text-mute text-center max-w-sm">
              Canceling will stop watching the pipeline. The backend will continue briefly
              but results won&apos;t be saved.
            </p>
          </div>
        )}
      </div>

      {/* Live log terminal */}
      <div className="absolute bottom-10 right-10 w-80 h-64 border border-hairline-strong rounded-xl bg-surface-deep p-xxl hidden lg:block overflow-hidden">
        <div className="flex items-center gap-sm mb-lg">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-error opacity-40" />
            <div className="w-2 h-2 rounded-full bg-accent-yellow opacity-40" />
            <div className="w-2 h-2 rounded-full bg-accent-green opacity-40" />
          </div>
          <span className="text-caption font-code-md text-ash uppercase tracking-widest">
            Live Logs
          </span>
        </div>
        <div className="space-y-xxs font-code-md text-[11px] text-mute">
          {LOG_LINES.map((line, i) => (
            <p
              key={i}
              className={`transition-opacity duration-500 ${
                i <= logIdx ? line.color : 'opacity-20'
              } ${i === logIdx ? 'animate-pulse' : ''}`}
            >
              {line.text}
            </p>
          ))}
        </div>
      </div>
    </main>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-charcoal">Loading...</div>
        </main>
      }
    >
      <ProcessingContent />
    </Suspense>
  )
}
