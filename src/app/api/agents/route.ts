import { createAgent, tool } from 'langchain'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { createClient } from '@/supabase/server'
import * as z from 'zod'

const SYSTEM_PROMPT = `You are a helpful AI assistant with access to tools.
You provide clear, concise, and accurate answers.
Use markdown formatting for code blocks, lists, tables, and emphasis when appropriate.
When you need to calculate something, use the calculator tool.
When asked about time, use the get_current_time tool.
When asked about weather, use the get_weather tool.`

const calculator = tool(
  async ({ expression }) => {
    try {
      const result = Function(`"use strict"; return (${expression})`)()
      return String(result)
    } catch (e) {
      return `Error: ${(e as Error).message}`
    }
  },
  {
    name: 'calculator',
    description:
      'Evaluate a mathematical expression. Supports basic arithmetic, parentheses, and Math functions (Math.sqrt, Math.pow, Math.sin, etc.).',
    schema: z.object({
      expression: z
        .string()
        .describe('The mathematical expression to evaluate, e.g. "2 + 2 * 3"'),
    }),
  },
)

const getCurrentTime = tool(
  async ({ timezone }) => {
    try {
      return new Date().toLocaleString('en-US', {
        timeZone: timezone || 'UTC',
        dateStyle: 'full',
        timeStyle: 'long',
      })
    } catch {
      return new Date().toISOString()
    }
  },
  {
    name: 'get_current_time',
    description:
      'Get the current date and time. Optionally specify an IANA timezone.',
    schema: z.object({
      timezone: z
        .string()
        .optional()
        .describe(
          'IANA timezone name, e.g. "America/New_York", "Asia/Shanghai". Defaults to UTC.',
        ),
    }),
  },
)

const getWeather = tool(
  async ({ location }) => {
    const conditions = [
      'Sunny',
      'Cloudy',
      'Rainy',
      'Partly Cloudy',
      'Clear',
    ] as const
    const temp = Math.floor(Math.random() * 30) + 5
    const condition = conditions[Math.floor(Math.random() * conditions.length)]
    const humidity = Math.floor(Math.random() * 40) + 40
    return `Weather in ${location}: ${condition}, ${temp}°C, humidity ${humidity}%`
  },
  {
    name: 'get_weather',
    description:
      'Get the current weather for a location (simulated). In production, connect to a real weather API.',
    schema: z.object({
      location: z
        .string()
        .describe('The city or location name to get weather for'),
    }),
  },
)

const AGENT_TOOLS = [calculator, getCurrentTime, getWeather]

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

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: claims, error: authError } = await supabase.auth.getClaims()
    if (authError || !claims?.claims) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: apikeys, error: apikeysError } = await supabase
      .from('apikeys')
      .select('key')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (apikeysError || !apikeys?.key) {
      return Response.json(
        { error: 'No active API key found. Please create an API key first.' },
        { status: 400 },
      )
    }

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
      apiKey: apikeys.key,
      temperature: 0.7,
      maxOutputTokens: 4096,
    })

    const agent = createAgent({
      model,
      tools: AGENT_TOOLS,
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
