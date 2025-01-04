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
      setLogos([]) // Clear previous logos
      const response = await generateLogo(prompt) // Call backend function
      if (response?.logos) {
        setLogos(response.logos) // Update state with generated logos
      } else {
        throw new Error('No logos were generated')
      }
    } catch (err) {
      setError('Failed to generate logos. Please try again.')
      console.error('Error generating logos:', err)
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
          {/* Input Section */}
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your business and the type of logo you want..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-32 resize-none"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Generate Button */}
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Logos...
              </>
            ) : (
              'Generate Logos'
            )}
          </Button>

          {/* Display Generated Logos */}
          {logos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {logos.map((logo, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 hover:shadow-lg transition-shadow"
                >
                  {/* Render Logo */}
                  <img
                    src={logo.url}
                    alt={`Generated logo ${index + 1}`}
                    className="w-full h-auto rounded"
                  />
                  {/* Download Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = logo.url
                      link.download = `logo-${index + 1}.svg`
                      link.click()
                    }}
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
