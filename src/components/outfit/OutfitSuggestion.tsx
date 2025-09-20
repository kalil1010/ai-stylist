'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MultiSelectChips } from '@/components/ui/multi-select-chips'
import { WeatherCard } from '@/components/weather/WeatherCard'
import { useAuth } from '@/contexts/AuthContext'
import { getUserClothing, toClosetSummary, type ClosetItemSummary } from '@/lib/closet'
import { getOutfitSuggestion, OutfitSuggestionResponse, OutfitPieceRecommendation } from '@/lib/api'
import { WeatherData } from '@/lib/weather'
import { Shirt, Zap, Sparkles } from 'lucide-react'
const COLOR_SWATCH_MAP: Record<string, string> = {
  black: '#111827',
  charcoal: '#374151',
  graphite: '#4b5563',
  navy: '#1f2937',
  ivory: '#f8f1e7',
  gold: '#d4af37',
  silver: '#9ca3af',
  neutral: '#9ca3af',
  beige: '#d6c3a5',
  tan: '#d2b48c',
  brown: '#6b4f2a',
  white: '#f5f5f5',
}

const resolveSwatchColor = (value?: string) => {
  if (!value) return COLOR_SWATCH_MAP.neutral
  const trimmed = value.trim()
  const key = trimmed.toLowerCase()
  if (COLOR_SWATCH_MAP[key]) return COLOR_SWATCH_MAP[key]
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return trimmed
  if (/^(rgb|hsl)a?\(/i.test(trimmed)) return trimmed
  return COLOR_SWATCH_MAP.neutral
}

const formatColorLabel = (value?: string) => {
  if (!value) return 'Neutral'
  const trimmed = value.trim()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}



export function OutfitSuggestion() {
  const { user, userProfile } = useAuth()
  const [occasion, setOccasion] = useState('')
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [suggestion, setSuggestion] = useState<OutfitSuggestionResponse | null>(null)
  const [closetItems, setClosetItems] = useState<ClosetItemSummary[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    const loadCloset = async () => {
      if (!user?.uid) {
        if (active) {
          setClosetItems([])
        }
        return
      }
      try {
        const items = await getUserClothing(user.uid)
        if (active) {
          setClosetItems(toClosetSummary(items, 20))
        }
      } catch (error) {
        console.warn('Failed to load closet summary for suggestions:', error)
        if (active) {
          setClosetItems([])
        }
      }
    }

    loadCloset()
    return () => {
      active = false
    }
  }, [user?.uid])


  const handleGetSuggestion = async () => {
    const occasionText = selectedOccasions[0] || ''
    if (!occasionText || !weather) {
      alert('Please enter an occasion and ensure weather data is loaded')
      return
    }

    setOccasion(occasionText)
    setLoading(true)
    try {
      const result = await getOutfitSuggestion({
        occasion: occasionText,
        weather,
        userProfile: userProfile || undefined,
        userId: user?.uid,
        closetItems: closetItems.length > 0 ? closetItems : undefined,
      })
      setSuggestion(result)
    } catch (error) {
      console.error('Failed to get outfit suggestion:', error)
      alert('Failed to get outfit suggestion. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const paletteColors = useMemo(() => {
    if (!suggestion) return [] as string[]
    const set = new Set<string>()
    const add = (value?: string) => {
      if (!value) return
      const label = formatColorLabel(value)
      set.add(label)
    }
    add(suggestion.top?.color)
    add(suggestion.bottom?.color)
    add(suggestion.footwear?.color)
    if (suggestion.outerwear?.color) add(suggestion.outerwear.color)
    suggestion.accessories?.forEach((accessory) => add(accessory.color))
    return Array.from(set)
  }, [suggestion])

  const renderOutfitItem = (label: string, item: OutfitPieceRecommendation | undefined) => {
    if (!item) return null
    const sourceLabel = item.source === 'online' ? 'Online pick' : item.source === 'closet' ? 'Closet pick' : undefined
    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">{label}</h4>
        <p className="text-sm text-gray-800">{item.summary}</p>
        <div className="flex flex-wrap gap-2">
          {item.color && (
            <span className="inline-flex items-center gap-3 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
              <span
                className="h-6 w-6 rounded-full border border-black/10"
                style={{ backgroundColor: resolveSwatchColor(item.color) }}
              />
              Color: {formatColorLabel(item.color)}
            </span>
          )}
          {sourceLabel && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {sourceLabel}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherCard onWeatherUpdate={setWeather} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shirt className="mr-2 h-5 w-5" />
              Outfit Request
            </CardTitle>
            <CardDescription>
              Select your occasion(s) and we'll suggest the perfect outfit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Occasion</label>
              <MultiSelectChips
                options={[
                  'Business Meeting',
                  'Casual Dinner',
                  'Wedding',
                  'Date Night',
                  'Outdoor Activity',
                  'Travel',
                  'Party',
                  'Interview',
                  'Gym',
                  'Beach Day',
                ].map((o) => ({ label: o, value: o.toLowerCase() }))}
                value={selectedOccasions}
                onChange={setSelectedOccasions}
                single
              />
            </div>

            <Button
              onClick={handleGetSuggestion}
              className="w-full"
              disabled={loading || selectedOccasions.length !== 1 || !weather}
            >
              {loading ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-pulse" />
                  Generating Suggestion...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Outfit Suggestion
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {suggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
              Your Personalized Outfit
            </CardTitle>
            <CardDescription>
              Perfect for {occasion || selectedOccasions[0]} in {weather?.location}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {renderOutfitItem('Top', suggestion.top)}
              {renderOutfitItem('Bottom', suggestion.bottom)}
              {renderOutfitItem('Footwear', suggestion.footwear)}

              {suggestion.outerwear && (
                renderOutfitItem('Outerwear', suggestion.outerwear)
              )}

              {suggestion.accessories && suggestion.accessories.length > 0 && (
                <div className="space-y-3 md:col-span-2">
                  <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                    Accessories
                  </h4>
                  <div className="space-y-3">
                    {suggestion.accessories.map((accessory, index) => (
                      <div
                        key={`${accessory.summary}-${index}`}
                        className="rounded-lg border border-gray-200 bg-gray-50/80 p-3 shadow-sm"
                      >
                        {renderOutfitItem(`Accessory ${suggestion.accessories.length > 1 ? index + 1 : ''}`.trim(), accessory)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {paletteColors.length > 0 && (
              <div className="border-t pt-4 mb-6">
                <h4 className="mb-3 font-semibold text-sm text-gray-600 uppercase tracking-wide">
                  Color Palette
                </h4>
                <div className="flex flex-wrap gap-2">
                  {paletteColors.map((color) => (
                    <span key={color} className="inline-flex items-center gap-3 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      <span
                        className="h-6 w-6 rounded-full border border-black/10"
                        style={{ backgroundColor: resolveSwatchColor(color) }}
                      />
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {suggestion.styleNotes && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide mb-2">
                  Style Notes
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {suggestion.styleNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
