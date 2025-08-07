'use client'

import { useState } from 'react'

export default function TestMatchPage() {
  const [briefId, setBriefId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const testMatch = async () => {
    if (!briefId) {
      setError('Please enter a brief ID')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/match/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId }),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        setError(`Error ${response.status}: ${data.error || 'Failed to find match'}`)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Test Match API</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Brief ID:
            </label>
            <input
              type="text"
              value={briefId}
              onChange={(e) => setBriefId(e.target.value)}
              placeholder="Enter brief ID"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <button
            onClick={testMatch}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Match API'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h2 className="font-bold mb-2">Match Found!</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  )
}