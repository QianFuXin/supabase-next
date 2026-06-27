import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages'
import { createClient } from '@/supabase/server'
import { getApiKey } from '@/utils/get-api-key'

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant powered by Google's Gemma 4 model.
You provide clear, concise, and accurate answers.
Use markdown formatting for code blocks, lists, tables, and emphasis when appropriate.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      systemPrompt,
    }: {
      messages: ChatMessage[]
      systemPrompt?: string
    } = await req.json()

    if (!messages?.length) {
      return Response.json(
        { error: "Missing 'messages' array" },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { data: claims, error: authError } = await supabase.auth.getClaims()
    if (authError || !claims?.claims) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeyResult = await getApiKey(supabase, 'gemini')
    if ('error' in apiKeyResult) {
      return Response.json({ error: apiKeyResult.error }, { status: 400 })
    }

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-3.1-flash-lite',
      apiKey: apiKeyResult.key,
      temperature: 0.7,
      maxOutputTokens: 2048,
    })

    const langchainMessages = [
      new SystemMessage(systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT),
      ...messages.map((msg) =>
        msg.role === 'user'
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content),
      ),
    ]
    console.log('LangChain Messages:', langchainMessages)

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          )
        }

        try {
          const aiStream = await model.stream(langchainMessages)

          for await (const chunk of aiStream) {
            const text =
              typeof chunk.content === 'string'
                ? chunk.content
                : Array.isArray(chunk.content)
                  ? chunk.content
                      .filter(
                        (p): p is { type: string; text: string } =>
                          typeof p === 'object' && p !== null && 'text' in p,
                      )
                      .map((p) => p.text)
                      .join('')
                  : ''

            if (text) {
              send({ type: 'text', content: text })
            }
          }

          send({ type: 'done' })
        } catch (err) {
          console.error('Stream error:', err)
          send({
            type: 'error',
            error: err instanceof Error ? err.message : 'Stream error occurred',
          })
        } finally {
          controller.close()
        }
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
    console.error('Chat API Error:', error)
    return Response.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
