const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

export interface AnalyzeRequest {
  source: string
  language: string
  meeting_id?: string
}

export interface AnalysisResult {
  meeting_id: string
  title: string
  summary: string
  action_items: string
  decisions: string
  questions: string
  transcript: string
}

export interface HistoryItem {
  meeting_id: string
  title: string
  created_at: string
  source: string
  language: string
}

export interface ConversationMessage {
  id: string
  meeting_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatResponse {
  answer: string
}

export const RESULT_KEY = 'voca_last_result'

export function saveResult(r: AnalysisResult) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(r))
}

export function loadResult(): AnalysisResult | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(RESULT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AnalysisResult
  } catch {
    return null
  }
}

export async function analyzeSource(req: AnalyzeRequest): Promise<AnalysisResult> {
  const resp = await fetch(`${BACKEND}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!resp.ok) {
    const detail = await resp.json().catch(() => ({ detail: resp.statusText }))
    throw new Error(detail.detail ?? 'Analysis failed')
  }
  return resp.json()
}

export async function analyzeSourceStream(
  req: AnalyzeRequest,
  callbacks: {
    onStart: (meeting_id: string) => void
    onStep: (step: number, status: 'active' | 'done') => void
  },
): Promise<AnalysisResult> {
  const resp = await fetch(`${BACKEND}/api/analyze/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!resp.ok) {
    const detail = await resp.json().catch(() => ({ detail: resp.statusText }))
    throw new Error(detail.detail ?? 'Analysis failed')
  }

  const reader = resp.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? '' // keep the incomplete trailing line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (!raw) continue

      const event = JSON.parse(raw)

      if (event.type === 'start') {
        callbacks.onStart(event.meeting_id as string)
        continue
      }

      if (event.error) throw new Error(event.error)

      if (event.done) {
        return {
          meeting_id: event.meeting_id,
          title: event.title,
          summary: event.summary,
          action_items: event.action_items,
          decisions: event.decisions,
          questions: event.questions,
          transcript: event.transcript,
        }
      }

      if (event.step !== undefined && event.status) {
        callbacks.onStep(event.step as number, event.status as 'active' | 'done')
      }
    }
  }

  throw new Error('Stream ended without a result')
}

export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const resp = await fetch(`${BACKEND}/api/upload`, {
    method: 'POST',
    body: fd,
  })
  if (!resp.ok) {
    const detail = await resp.json().catch(() => ({ detail: resp.statusText }))
    throw new Error(detail.detail ?? 'Upload failed')
  }
  const { file_path } = await resp.json()
  return file_path as string
}

export async function askQuestion(question: string, meeting_id?: string): Promise<ChatResponse> {
  const resp = await fetch(`${BACKEND}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, meeting_id }),
  })
  if (!resp.ok) {
    const detail = await resp.json().catch(() => ({ detail: resp.statusText }))
    throw new Error(detail.detail ?? 'Chat failed')
  }
  return resp.json()
}

export async function getHistory(): Promise<HistoryItem[]> {
  const resp = await fetch(`${BACKEND}/api/history`)
  if (!resp.ok) throw new Error('Failed to fetch history')
  return resp.json()
}

export async function getHistoryItem(id: string): Promise<AnalysisResult> {
  const resp = await fetch(`${BACKEND}/api/history/${id}`)
  if (!resp.ok) throw new Error('Meeting not found')
  return resp.json()
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const resp = await fetch(`${BACKEND}/api/history/${id}`, { method: 'DELETE' })
  if (!resp.ok) throw new Error('Failed to delete meeting')
}

export async function getConversations(meeting_id: string): Promise<ConversationMessage[]> {
  const resp = await fetch(`${BACKEND}/api/history/${meeting_id}/conversations`)
  if (!resp.ok) return []
  return resp.json()
}
