import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { createClient } from '@/supabase/server'

const SYSTEM_PROMPT = `You are a helpful AI assistant powered by Google's Gemma 4 model.
You provide clear, concise, and accurate answers.
Use markdown formatting for code blocks, lists, tables, and emphasis when appropriate.`

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message?.trim()) {
      return Response.json(
        { error: "Missing 'message' parameter" },
        { status: 400 },
      )
    }

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
    const model = new ChatGoogleGenerativeAI({
      model: 'gemma-4-26b-a4b-it',
      apiKey: apikeys.key,
      temperature: 0.7,
      maxOutputTokens: 2048,
    })

    const messages = [
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(message),
    ]

    const response = await model.invoke(messages)

    let textContent: string
    if (typeof response.content === 'string') {
      textContent = response.content
    } else if (Array.isArray(response.content)) {
      textContent = response.content
        .filter(
          (part): part is { type: string; text: string } =>
            typeof part === 'object' && part !== null && 'text' in part,
        )
        .map((part) => part.text)
        .join('')
    } else {
      textContent = String(response.content)
    }

    return Response.json({
      success: true,
      content: textContent,
      model: 'gemma-4-26b-a4b-it',
      usage: response.usage_metadata,
    })
  } catch (error) {
    console.error('Gemma Demo Error:', error)
    return Response.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
