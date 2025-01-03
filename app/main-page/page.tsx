// app/main-page/page.tsx
import { Metadata } from 'next'
import LogoGenerator from '../../components/LogoGenerator'

export const metadata: Metadata = {
  title: 'GetYoLogo - AI Logo Generator',
  description: 'Generate unique logos for your business using AI',
}

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">GetYoLogo</h1>
        <LogoGenerator />
      </div>
    </main>
  )
}