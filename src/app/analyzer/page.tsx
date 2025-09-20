'use client'

import { ColorAnalyzer } from '@/components/analyzer/ColorAnalyzer'

export default function AnalyzerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-6">
        <ColorAnalyzer />
      </div>
    </div>
  )
}

