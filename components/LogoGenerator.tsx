// components/LogoGenerator.tsx
'use client'
import React, { useState } from 'react'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Loader2 } from 'lucide-react'
import { generateLogo } from '@/app/actions/logo-actions'

interface Logo {
  url: string
  id: string
}

interface GenerateLogoResponse {
  logos: Logo[]
}

export default function LogoGenerator() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [logos, setLogos] = useState<Logo[]>([])
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a business description')
      return
    }

    try {
      setLoading(true)
      setError('')
      const result = await generateLogo(prompt)
      setLogos(result.logos)
    } catch (err) {
      setError('Failed to generate logos. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Logo Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your business and the type of logo you want..."
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              className="min-h-32 resize-none"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Logos...
              </>
            ) : 'Generate Logos'}
          </Button>

          {logos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {logos.map((logo, index) => (
                <div 
                  key={index}
                  className="border rounded-lg p-3 hover:shadow-lg transition-shadow"
                >
                  <img
                    src={logo.url}
                    alt={`Generated logo ${index + 1}`}
                    className="w-full h-auto"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => window.open(logo.url, '_blank')}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}