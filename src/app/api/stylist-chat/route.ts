import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { summariseClosetForPrompt } from '@/lib/closet'
import { getOnlinePieces, summarisePiecesForPrompt } from '@/lib/fashionPieces'
import { callMistralAI } from '@/lib/genkit'
import type { GenderTarget } from '@/types/arrivals'

const ClosetItemSchema = z.object({
  id: z.string(),
  garmentType: z.enum(['top', 'bottom', 'footwear', 'accessory', 'outerwear']),
  brand: z.string().optional(),
  description: z.string().optional(),
  dominantColors: z.array(z.string()).optional(),
})

const normalizeGender = (value?: string | null): GenderTarget | undefined => {
  if (!value) return undefined
  const lowered = value.toLowerCase()
  if (lowered === 'male' || lowered === 'man' || lowered === 'mens') return 'male'
  if (lowered === 'female' || lowered === 'woman' || lowered === 'womens') return 'female'
  if (lowered === 'unisex') return 'unisex'
  return undefined
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.message) {
      return NextResponse.json({ error: 'Missing required field: message' }, { status: 400 })
    }

    const targetGender = normalizeGender(body.userProfile?.gender)
    const closetItems = Array.isArray(body.closetItems) ? ClosetItemSchema.array().parse(body.closetItems) : []
    const closetSummary = summariseClosetForPrompt(closetItems)
    const onlinePieces = await getOnlinePieces(targetGender, undefined)
    const onlineSummary = summarisePiecesForPrompt(onlinePieces, 12)

    const closetBlock = closetSummary.length
      ? `Closet Inventory (prioritise these pieces):
${closetSummary.join('\n')}`
      : 'Closet Inventory: No items provided.'

    const onlineBlock = onlineSummary.length
      ? `Online Store Highlights (mention the brand when you suggest one):
${onlineSummary.join('\n')}`
      : 'Online Store Highlights: None available.'

    const systemPrompt = `You are a friendly fashion stylist AI in Concise Mode. Keep answers short, clear, and enjoyable to read.

Formatting rules (strict):
- Use simple Markdown only (no tables).
- Max 8-12 lines total.
- Short bullets, no long paragraphs.
- End with one short follow-up question.

When asked for an outfit, use the user's closet items first. Only reference the online store highlights when the closet lacks a needed piece or when suggesting an optional purchase—make it clear when something is a shopping idea.

When asked for an outfit, return exactly these sections (omit any that don’t apply):

## Outfit (1-2 options)
- Top: ...  Bottom: ...  Shoes: ...  Accessories: ...

## Colors
- Complementary: ...
- Analogous: ...
- Neutrals: ...

## Tips
- 1-2 quick pointers (fit/fabric/occasion).

Personalize to the user's profile and any provided image colors. Be helpful and upbeat, but never verbose.`

    const prompt = `User message: ${body.message}

${body.context ? `Context: ${body.context}` : ''}
${body.imageColors?.length ? `Image context: Dominant colors detected: ${body.imageColors.join(', ')}. If relevant, suggest color pairings and outfit ideas that complement these colors.` : ''}

User Profile:
- Gender: ${body.userProfile?.gender || 'not specified'}
- Age: ${body.userProfile?.age || 'not specified'}
- Favorite Colors: ${body.userProfile?.favoriteColors?.join(', ') || 'none specified'}
- Favorite Styles: ${body.userProfile?.favoriteStyles?.join(', ') || 'none specified'}

${closetBlock}

${onlineBlock}

Please provide a helpful and personalised response that references these sources when giving outfit advice.`

    const response = await callMistralAI(prompt, systemPrompt, { temperature: 0.5, maxTokens: 600 })
    return NextResponse.json({ response })
  } catch (error) {
    console.error('Stylist chat error:', error)
    return NextResponse.json({ error: 'Failed to generate chat response' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Stylist chat API is running' }, { status: 200 })
}
