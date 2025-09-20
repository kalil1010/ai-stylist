'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getWeatherData, getWeatherIcon, WeatherData } from '@/lib/weather'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WeatherCardProps {
  onWeatherUpdate?: (weather: WeatherData) => void
}

export function WeatherCard({ onWeatherUpdate }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWeather = async () => {
    setLoading(true)
    try {
      const weatherData = await getWeatherData()
      setWeather(weatherData)
      onWeatherUpdate?.(weatherData)
    } catch (error) {
      console.error('Failed to fetch weather:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Unable to load weather data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Current Weather</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWeather}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="text-4xl">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <div className="text-2xl font-bold">
              {weather.temperature}°C
            </div>
            <div className="text-sm text-gray-600">
              {weather.condition}
            </div>
            <div className="text-xs text-gray-500">
              {weather.location}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Humidity:</span>
            <span className="ml-1 font-medium">{weather.humidity}%</span>
          </div>
          <div>
            <span className="text-gray-500">Wind:</span>
            <span className="ml-1 font-medium">{weather.windSpeed} m/s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}