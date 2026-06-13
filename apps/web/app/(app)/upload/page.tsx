'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { uploadFile } from '@/lib/api'

export default function UploadPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [language, setLanguage] = useState('english')
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setSelectedFile(file)
    setUrl('')
    setUploadError(null)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const handleSubmit = async () => {
    if (!url && !selectedFile) return
    let source = url

    if (selectedFile) {
      setUploading(true)
      setUploadError(null)
      try {
        source = await uploadFile(selectedFile)
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    const params = new URLSearchParams({ source, language })
    router.push(`/processing?${params}`)
  }

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-5rem)]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] atmospheric-white pointer-events-none" />

      <section className="max-w-4xl mx-auto px-xxl py-band flex flex-col items-center text-center relative z-10">
        {/* Headline */}
        <div className="space-y-xl mb-band">
          <h1
            className="font-display-xl text-primary leading-none max-w-2xl mx-auto"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
          >
            Intelligence for every meeting.
          </h1>
          <p className="text-subtitle font-subtitle text-charcoal max-w-lg mx-auto">
            Transcribe, summarize, and query your meetings with Voca. Submit a YouTube link or upload an audio file.
          </p>
        </div>

        {/* Upload Card */}
        <div className="w-full space-y-xl">
          <div className="bg-surface-card border border-hairline-strong rounded-xl p-xxl flex flex-col items-center hover:border-primary/20 transition-all duration-500">
            {/* Drop Zone */}
            <div
              className={`upload-dashed-border w-full py-band flex flex-col items-center justify-center group cursor-pointer transition-colors ${
                dragOver ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'
              }`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.webm"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className={`mb-xl text-primary transition-opacity ${dragOver ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 48 }}>
                  {selectedFile ? 'audio_file' : 'upload_file'}
                </span>
              </div>
              {selectedFile ? (
                <>
                  <h3 className="text-headline-sm font-headline-sm text-primary mb-xs">{selectedFile.name}</h3>
                  <p className="text-body-sm text-mute">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB — click to change
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-headline-sm font-headline-sm text-primary mb-xs">Drag and drop audio files</h3>
                  <p className="text-body-sm text-mute">MP3, WAV, M4A, MP4 or WebM</p>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-md w-full my-xxl">
              <div className="h-px flex-1 bg-hairline" />
              <span className="text-caption text-mute uppercase tracking-widest">or</span>
              <div className="h-px flex-1 bg-hairline" />
            </div>

            {/* YouTube input + language + submit */}
            <div className="w-full max-w-lg space-y-xl">
              <div className="flex flex-col text-left gap-sm">
                <label className="text-body-sm font-body-sm text-mute ml-xs">Import from YouTube</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={url}
                    onChange={e => { setUrl(e.target.value); setSelectedFile(null) }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-canvas border border-hairline-strong rounded-xl px-xl py-lg text-body-md font-body-md text-primary placeholder:text-stone focus:outline-none focus:border-primary transition-colors pr-12"
                  />
                  <div className="absolute inset-y-0 right-md flex items-center">
                    <span className="material-symbols-outlined text-stone group-focus-within:text-primary transition-colors" style={{ fontSize: 20 }}>
                      link
                    </span>
                  </div>
                </div>
              </div>

              {/* Language selector */}
              <div className="flex flex-col text-left gap-sm">
                <label className="text-body-sm font-body-sm text-mute ml-xs">Transcription language</label>
                <div className="flex gap-md">
                  {[
                    { value: 'english', label: 'English', sub: 'Whisper AI' },
                    { value: 'hinglish', label: 'Hinglish', sub: 'Sarvam AI' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setLanguage(opt.value)}
                      className={`flex-1 p-md rounded-xl border text-left transition-all ${
                        language === opt.value
                          ? 'border-primary bg-surface-elevated'
                          : 'border-hairline-strong bg-canvas hover:border-on-surface-variant'
                      }`}
                    >
                      <div className="text-body-sm font-bold text-primary">{opt.label}</div>
                      <div className="text-caption text-mute">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {uploadError && (
                <div className="p-md bg-accent-red/10 border border-accent-red/30 rounded-xl">
                  <p className="text-caption text-accent-red">{uploadError}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={(!url && !selectedFile) || uploading}
                className="w-full bg-primary text-canvas font-button-md text-button-md py-lg px-xl rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-canvas/30 border-t-canvas rounded-full animate-spin" />
                    Uploading file...
                  </>
                ) : (
                  <>
                    Process Meeting
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feature mini-cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {[
              { icon: 'closed_caption', color: 'text-accent-blue', title: 'Neural Transcription', desc: '99%+ accuracy with Whisper large v3 turbo.' },
              { icon: 'auto_awesome', color: 'text-accent-green', title: 'Executive Summary', desc: 'Distill hours of audio into concise insights.' },
              { icon: 'database', color: 'text-accent-orange', title: 'Semantic Index', desc: 'Ask questions across the full transcript via RAG.' },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className="bg-surface-elevated border border-hairline p-xl rounded-xl text-left">
                <span className={`material-symbols-outlined ${color} mb-md`} style={{ fontSize: 24 }}>{icon}</span>
                <h4 className="text-body-md font-body-md text-primary font-bold mb-xs">{title}</h4>
                <p className="text-caption text-mute">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal widget */}
      <section className="max-w-5xl mx-auto px-xxl pb-band">
        <div className="bg-surface-deep border border-hairline-strong rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-xxs px-xl py-md bg-surface-container-low border-b border-hairline">
            <div className="w-3 h-3 rounded-full bg-error opacity-50" />
            <div className="w-3 h-3 rounded-full bg-accent-yellow opacity-50" />
            <div className="w-3 h-3 rounded-full bg-accent-green opacity-50" />
            <div className="ml-md text-caption text-mute font-code-md">voca-intelligence-engine --status</div>
          </div>
          <div className="p-xxl font-code-md text-code-md text-primary/80 space-y-xs">
            <p className="text-accent-blue">$ initializing v_engine_core_v4.2...</p>
            <p className="text-mute">[info] cluster status: optimal</p>
            <p className="text-mute">[info] ready for high-fidelity audio stream</p>
            <p><span className="text-accent-green">✓</span> transcription_module.bin loaded</p>
            <p><span className="text-accent-green">✓</span> semantic_parser.bin loaded</p>
            <p className="animate-pulse">_</p>
          </div>
        </div>
      </section>
    </main>
  )
}
