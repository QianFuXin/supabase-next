import { createAgent, tool } from 'langchain'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { createClient } from '@/supabase/server'
import { getApiKey } from '@/utils/get-api-key'
import * as z from 'zod'

const SYSTEM_PROMPT = `You are a helpful AI assistant with access to tools.
You provide clear, concise, and accurate answers.
Use markdown formatting for code blocks, lists, tables, and emphasis when appropriate.
When asked about current time or date, use the get_current_time tool.
When asked to search, look up, or find information, use the tavily_search tool.
When asked to read, fetch, or extract content from a specific web page URL, use the fetch_web_page tool.`

const getCurrentTime = tool(
  async () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  },
  {
    name: 'get_current_time',
    description: 'Get the current date and time in YYYY-MM-DD HH:MM:SS format.',
    schema: z.object({}),
  },
)

const fetchWebPage = tool(
  async ({ url, maxLength }) => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AgentBot/1.0)',
        },
      })
      clearTimeout(timeout)

      if (!response.ok) {
        return `Failed to fetch ${url}: HTTP ${response.status} ${response.statusText}`
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) {
        return `URL content type is "${contentType}", not HTML. Cannot extract text.`
      }

      const html = await response.text()

      // Strip script and style tags with their content
      const noScripts = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      const noStyles = noScripts.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

      // Strip all HTML tags
      const text = noStyles.replace(/<[^>]+>/g, ' ')

      // Decode common HTML entities
      const decoded = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')

      // Normalize whitespace
      const normalized = decoded.replace(/\s+/g, ' ').trim()

      const limit = maxLength ?? 5000
      const result =
        normalized.length > limit
          ? normalized.slice(0, limit) + '...'
          : normalized

      return result || `No readable text content found at ${url}`
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return `Fetch timed out for ${url} (15s limit)`
      }
      return `Fetch failed for ${url}: ${(err as Error).message}`
    }
  },
  {
    name: 'fetch_web_page',
    description:
      'Fetch and extract text content from a web page URL. Returns cleaned text without HTML tags, scripts, or styles. Useful for reading articles, documentation, or any web page content.',
    schema: z.object({
      url: z.string().describe('The full URL of the web page to fetch'),
      maxLength: z
        .number()
        .optional()
        .describe('Maximum characters to return (default: 5000)'),
    }),
  },
)

type StreamEvent =
  | { type: 'text'; content: string }
  | { type: 'thinking'; content: string }
  | { type: 'tool_start'; callId: string; name: string; input: unknown }
  | {
      type: 'tool_end'
      callId: string
      name: string
      status: string
      output?: unknown
      error?: string
    }
  | { type: 'done' }
  | { type: 'error'; error: string }

interface TavilyResult {
  title: string
  url: string
  content: string
  score: number
}

interface TavilyResponse {
  query: string
  answer?: string
  results: TavilyResult[]
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: claims, error: authError } = await supabase.auth.getClaims()
    if (authError || !claims?.claims) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [geminiKeyResult, tavilyKeyResult] = await Promise.all([
      getApiKey(supabase, 'gemini'),
      getApiKey(supabase, 'tavily'),
    ])

    if ('error' in geminiKeyResult) {
      return Response.json({ error: geminiKeyResult.error }, { status: 400 })
    }

    const tavilyApiKey = 'error' in tavilyKeyResult ? '' : tavilyKeyResult.key

    const tavilySearch = tool(
      async ({ query, maxResults, searchDepth }) => {
        try {
          const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: tavilyApiKey,
              query,
              max_results: maxResults ?? 5,
              search_depth: searchDepth ?? 'basic',
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            return `Tavily search error (${response.status}): ${errorText}`
          }

          const data: TavilyResponse = await response.json()

          if (!data.results?.length) {
            return data.answer
              ? `Answer: ${data.answer}\n\nNo search results found.`
              : `No results found for "${data.query}".`
          }

          const lines: string[] = []

          if (data.answer) {
            lines.push(`**Answer:** ${data.answer}`, '')
          }

          lines.push(`**Search results for "${data.query}":**`, '')

          data.results.forEach((r, i) => {
            lines.push(`${i + 1}. **[${r.title}](${r.url})**`)
            lines.push(`   ${r.content}`)
            lines.push('')
          })

          return lines.join('\n')
        } catch (err) {
          return `Tavily search failed: ${(err as Error).message}`
        }
      },
      {
        name: 'tavily_search',
        description:
          'Search the web using Tavily API. Returns real-time search results with titles, URLs, and content snippets. Useful for finding current information, facts, and news.',
        schema: z.object({
          query: z.string().describe('The search query string'),
          maxResults: z
            .number()
            .optional()
            .describe('Maximum number of results to return (default: 5)'),
          searchDepth: z
            .enum(['basic', 'advanced'])
            .optional()
            .describe('Search depth: "basic" (default) or "advanced"'),
        }),
      },
    )

    const {
      messages,
    }: {
      messages?: { role: 'user' | 'assistant'; content: string }[]
    } = await req.json()

    if (!messages?.length) {
      return Response.json(
        { error: "Missing 'messages' array" },
        { status: 400 },
      )
    }

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      apiKey: geminiKeyResult.key,
      temperature: 0.7,
      maxOutputTokens: 4096,
    })

    const agent = createAgent({
      model,
      tools: [getCurrentTime, fetchWebPage, tavilySearch],
      systemPrompt: SYSTEM_PROMPT,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: StreamEvent) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          )
        }
        try {
          const run = await agent.streamEvents(
            { messages },
            {
              version: 'v3',
            },
          )

          await Promise.all([
            (async () => {
              for await (const msg of run.messages) {
                if ((msg as Record<string, unknown>).node === 'tools') continue

                await Promise.all([
                  (async () => {
                    for await (const token of msg.reasoning) {
                      if (token) send({ type: 'thinking', content: token })
                    }
                  })(),
                  (async () => {
                    for await (const token of msg.text) {
                      if (token) send({ type: 'text', content: token })
                    }
                  })(),
                ])
              }
            })(),
            (async () => {
              for await (const call of run.toolCalls) {
                send({
                  type: 'tool_start',
                  callId: call.callId,
                  name: call.name,
                  input: call.input,
                })
                const status = await call.status
                if (status === 'finished') {
                  send({
                    type: 'tool_end',
                    callId: call.callId,
                    name: call.name,
                    status,
                    output: await call.output,
                  })
                } else {
                  send({
                    type: 'tool_end',
                    callId: call.callId,
                    name: call.name,
                    status,
                    error: await call.error,
                  })
                }
              }
            })(),
          ])

          send({ type: 'done' })
        } catch (err) {
          console.error('Agent stream error:', err)
          send({
            type: 'error',
            error:
              err instanceof Error
                ? err.message
                : 'Agent stream error occurred',
          })
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Agents API Error:', error)
    return Response.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
