export interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  location: string
  timestamp: Date
}

export interface LocationData {
  city: string
  region: string
  country: string
  latitude: number
  longitude: number
}

export async function getCurrentLocation(): Promise<LocationData> {
  try {
    const response = await fetch(`https://ipinfo.io/json?token=${process.env.NEXT_PUBLIC_IPINFO_API_KEY}`)
    const data = await response.json()
    
    const [lat, lon] = data.loc.split(',').map(Number)
    
    return {
      city: data.city,
      region: data.region,
      country: data.country,
      latitude: lat,
      longitude: lon,
    }
  } catch (error) {
    console.error('Failed to get location:', error)
    // Fallback to default location
    return {
      city: 'New York',
      region: 'NY',
      country: 'US',
      latitude: 40.7128,
      longitude: -74.0060,
    }
  }
}

export async function getWeatherData(location?: LocationData): Promise<WeatherData> {
  try {
    const loc = location || await getCurrentLocation()
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${loc.latitude}&lon=${loc.longitude}&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}&units=metric`
    )
    
    const data = await response.json()
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      location: `${loc.city}, ${loc.region}`,
      timestamp: new Date(),
    }
  } catch (error) {
    console.error('Failed to get weather data:', error)
    // Fallback weather data
    return {
      temperature: 22,
      condition: 'Clear',
      humidity: 50,
      windSpeed: 5,
      location: 'Unknown Location',
      timestamp: new Date(),
    }
  }
}

export function getWeatherIcon(condition: string): string {
  const iconMap: { [key: string]: string } = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
  }
  
  return iconMap[condition] || '🌤️'
}