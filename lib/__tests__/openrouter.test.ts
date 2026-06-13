import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { toOpenAIMessages, callOpenRouter } from '@/lib/openrouter'
import type { ChatMessage } from '@/types/chatbot'

describe('toOpenAIMessages', () => {
  it('prepends the system prompt and preserves message order/roles', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
      { role: 'user', content: 'bye' },
    ]
    expect(toOpenAIMessages('SYS', history)).toEqual([
      { role: 'system', content: 'SYS' },
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
      { role: 'user', content: 'bye' },
    ])
  })

  it('produces just the system message for an empty history', () => {
    expect(toOpenAIMessages('SYS', [])).toEqual([{ role: 'system', content: 'SYS' }])
  })
})

describe('callOpenRouter', () => {
  const originalKey = process.env.OPENROUTER_API_KEY

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = 'sk-or-test'
  })
  afterEach(() => {
    process.env.OPENROUTER_API_KEY = originalKey
    vi.restoreAllMocks()
  })

  it('throws when the API key is missing', async () => {
    delete process.env.OPENROUTER_API_KEY
    await expect(
      callOpenRouter({ model: 'm', system: 's', messages: [] })
    ).rejects.toThrow(/OPENROUTER_API_KEY/)
  })

  it('sends the key as a Bearer header (never in the URL)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: ' hi ' } }] }), { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)

    const out = await callOpenRouter({
      model: 'google/gemini-2.5-flash',
      system: 'SYS',
      messages: [{ role: 'user', content: 'q' }],
      maxTokens: 123,
    })

    expect(out).toBe('hi')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(url).not.toContain('sk-or-test')
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer sk-or-test')
    const sentBody = JSON.parse(init.body as string)
    expect(sentBody.model).toBe('google/gemini-2.5-flash')
    expect(sentBody.max_tokens).toBe(123)
    expect(sentBody.messages[0]).toEqual({ role: 'system', content: 'SYS' })
  })

  it('throws on a non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'bad' } }), { status: 429 })
      )
    )
    await expect(
      callOpenRouter({ model: 'm', system: 's', messages: [] })
    ).rejects.toThrow(/OpenRouter request failed \(429\)/)
  })

  it('returns empty string when content is absent', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [] }), { status: 200 }))
    )
    expect(await callOpenRouter({ model: 'm', system: 's', messages: [] })).toBe('')
  })
})
