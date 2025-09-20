import { NextRequest, NextResponse } from 'next/server'
import { getMatchingColors, getColorName, getRichPalette } from '@/lib/imageAnalysis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dataUrl, dominantHexes } = body as { dataUrl?: string; dominantHexes?: string[] }

    if (!dataUrl && (!dominantHexes || dominantHexes.length === 0)) {
      return NextResponse.json({ error: 'Missing image data or dominantHexes' }, { status: 400 })
    }

    // Deterministic server output using provided rough hexes
    const list = Array.isArray(dominantHexes) ? dominantHexes : []
    const seen = new Set<string>()
    const clean = list
      .map((h) => (String(h).startsWith('#') ? String(h) : `#${String(h)}`))
      .filter((k) => /^#[0-9a-fA-F]{6}$/.test(k))
      .filter((k) => {
        const low = k.toLowerCase()
        if (seen.has(low)) return false
        seen.add(low)
        return true
      })

    if (!clean.length) {
      return NextResponse.json({ error: 'No valid hexes provided' }, { status: 400 })
    }

    const primaryHex = clean[0]
    const matches = getMatchingColors(primaryHex)
    const richMatches = getRichPalette(primaryHex)
    const colorNames = clean.map((h) => getColorName(h))

    return NextResponse.json({
      primaryHex,
      dominantHexes: clean,
      colorNames,
      garmentType: 'top',
      matches,
      richMatches,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Analyze failed', details: e?.message || String(e) }, { status: 500 })
  }
}
