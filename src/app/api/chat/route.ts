import { createDeepAgent, StateBackend } from 'deepagents'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { MemorySaver } from '@langchain/langgraph-checkpoint'

const SYSTEM_PROMPT = `You are a helpful, friendly AI assistant. You provide clear, concise, and accurate answers.
Use markdown formatting for code blocks, lists, tables, and emphasis.
For complex multi-step tasks, use write_todos to plan, then execute step by step.`

const model = new ChatGoogleGenerativeAI({
  model: 'gemma-4-26b-a4b-it',
})

const checkpointer = new MemorySaver()
const backend = new StateBackend()

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
  | { type: 'subagent_start'; name: string }
  | { type: 'subagent_thinking'; name: string; content: string }
  | { type: 'subagent_text'; name: string; content: string }
  | { type: 'subagent_end'; name: string; status: string }
  | { type: 'done' }
  | { type: 'error'; error: string }

let _agent: ReturnType<typeof createDeepAgent> | null = null

function getAgent() {
  if (!_agent) {
    _agent = createDeepAgent({
      model,
      systemPrompt: SYSTEM_PROMPT,
      checkpointer,
      backend,
    })
  }
  return _agent
}

export async function POST(req: Request) {
  try {
    const { question, thread_id } = await req.json()

    if (!question?.trim()) {
      return Response.json(
        { error: "Missing 'question' parameter" },
        { status: 400 },
      )
    }

    const agent = getAgent()

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
            { messages: [{ role: 'user', content: question }] },
            {
              version: 'v3',
              configurable: {
                thread_id: thread_id ?? crypto.randomUUID(),
              },
            },
          )

          await Promise.all([
            // Coordinator message chunks — iterate token by token
            (async () => {
              for await (const msg of run.messages) {
                // Thinking / reasoning content (streaming)
                for await (const token of msg.reasoning) {
                  if (token) send({ type: 'thinking', content: token })
                }
                // Regular text content (streaming)
                for await (const token of msg.text) {
                  if (token) send({ type: 'text', content: token })
                }
              }
            })(),
            // Coordinator tool calls
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
            // Subagent tasks
            (async () => {
              for await (const sub of run.subagents) {
                const s = sub as any
                send({ type: 'subagent_start', name: s.name })

                for await (const msg of s.messages) {
                  // Subagent thinking / reasoning content
                  for await (const token of msg.reasoning) {
                    if (token)
                      send({
                        type: 'subagent_thinking',
                        name: s.name,
                        content: token,
                      })
                  }
                  // Subagent text content
                  for await (const token of msg.text) {
                    if (token)
                      send({
                        type: 'subagent_text',
                        name: s.name,
                        content: token,
                      })
                  }
                }

                try {
                  await s.output
                  send({
                    type: 'subagent_end',
                    name: s.name,
                    status: 'completed',
                  })
                } catch {
                  send({ type: 'subagent_end', name: s.name, status: 'failed' })
                }
              }
            })(),
          ])

          send({ type: 'done' })
        } catch (err) {
          console.error('Stream error:', err)
          send({ type: 'error', error: 'Stream error occurred' })
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
  } catch (err) {
    console.error('Error:', err)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
