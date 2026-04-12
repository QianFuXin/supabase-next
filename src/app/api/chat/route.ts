import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

export async function POST(req: Request) {
  try {
    const { question } = await req.json()

    if (!question) {
      return Response.json(
        { error: "Missing 'question' parameter" },
        { status: 400 },
      )
    }

    console.log('start invoke:', question)

    const llm = new ChatGoogleGenerativeAI({
      model: 'gemma-4-26b-a4b-it',
    })

    const aiMsg = await llm.invoke([
      ['system', 'You are a helpful assistant.'],
      ['human', question],
    ])

    console.log('done invoke')

    // ✅ 兼容 LangChain content 结构
    let text = ''

    if (typeof aiMsg.content === 'string') {
      text = aiMsg.content
    } else if (Array.isArray(aiMsg.content)) {
      const last = aiMsg.content[aiMsg.content.length - 1]
      text =
        typeof last === 'string'
          ? last
          : typeof last?.text === 'string'
            ? last.text
            : ''
    }

    return Response.json({ answer: text })
  } catch (err) {
    console.error('error:', err)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
