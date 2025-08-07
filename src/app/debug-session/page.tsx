'use client'

import { useEffect, useState } from 'react'

export default function DebugSessionPage() {
  const [sessionData, setSessionData] = useState<any>({})
  const [cookies, setCookies] = useState('')

  useEffect(() => {
    // Get all sessionStorage data
    const data: any = {}
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key) {
        data[key] = sessionStorage.getItem(key)
      }
    }
    setSessionData(data)
    
    // Get cookies
    setCookies(document.cookie)
  }, [])

  const clearSession = () => {
    sessionStorage.clear()
    window.location.reload()
  }

  const testMatch = async () => {
    // Create a test brief directly
    const testBriefData = {
      projectType: 'Mobile App',
      industry: 'Technology',
      timeline: '2-3 months',
      styles: ['Modern', 'Minimalist'],
      inspiration: 'Like Airbnb',
      requirements: 'Need a clean design'
    }
    
    // First ensure we have a session
    const response = await fetch('/api/auth/session')
    const session = await response.json()
    console.log('Current session:', session)
    
    if (!session.clientId) {
      alert('No client session found. Please go through the normal flow first.')
      return
    }
    
    // Create brief
    const briefResponse = await fetch('/api/briefs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBriefData),
      credentials: 'include'
    })
    
    if (!briefResponse.ok) {
      alert('Failed to create brief: ' + await briefResponse.text())
      return
    }
    
    const { brief } = await briefResponse.json()
    console.log('Created brief:', brief)
    
    // Now test match
    const matchResponse = await fetch('/api/match/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefId: brief.id }),
      credentials: 'include'
    })
    
    const matchText = await matchResponse.text()
    console.log('Match response:', matchResponse.status, matchText)
    
    if (matchResponse.ok) {
      alert('Match found! Check console for details.')
    } else {
      alert('Match failed: ' + matchText)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Session Data</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">SessionStorage:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Cookies:</h2>
          <pre className="text-sm overflow-auto">
            {cookies || 'No cookies'}
          </pre>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={clearSession}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Clear Session
          </button>
          
          <button
            onClick={testMatch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Test Match API
          </button>
        </div>
      </div>
    </div>
  )
}