'use client'

import { useState } from 'react'

export default function Page() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!question.trim()) return

    setLoading(true)
    setAnswer('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()
      setAnswer(data.answer || 'No response')
    } catch (err) {
      console.error(err)
      setAnswer('Error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
      <h1>AI Chat Demo</h1>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something..."
        rows={4}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Loading...' : 'Ask'}
      </button>

      <div style={{ marginTop: 20 }}>
        <h3>Answer:</h3>
        <p>{answer}</p>
      </div>
    </div>
  )
}
