export interface NamedColor {
  name: string
  hex: string
}

const HEX_REGEX = /^#?([0-9a-f]{6})$/i

export function normalizeHex(value: string | null | undefined): string | null {
  if (!value) return null
  const match = HEX_REGEX.exec(value.trim())
  if (!match) return null
  return `#${match[1].toUpperCase()}`
}

const BASE_COLORS: NamedColor[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'Charcoal', hex: '#1f2937' },
  { name: 'Slate Gray', hex: '#4b5563' },
  { name: 'Gray', hex: '#6b7280' },
  { name: 'Silver', hex: '#c0c0c0' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Off White', hex: '#f5f5f5' },
  { name: 'Ivory', hex: '#fffff0' },
  { name: 'Beige', hex: '#f5f5dc' },
  { name: 'Khaki', hex: '#f0e68c' },
  { name: 'Tan', hex: '#d2b48c' },
  { name: 'Camel', hex: '#c19a6b' },
  { name: 'Saddle Brown', hex: '#8b4513' },
  { name: 'Sienna', hex: '#a0522d' },
  { name: 'Dark Brown', hex: '#654321' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Rust', hex: '#7c2d12' },
  { name: 'Dark Gold', hex: '#b8860b' },
  { name: 'Gold', hex: '#ffd700' },
  { name: 'Mustard', hex: '#d97706' },
  { name: 'Orange', hex: '#ffa500' },
  { name: 'Coral', hex: '#ff7f50' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Bright Red', hex: '#ef4444' },
  { name: 'Pink', hex: '#f472b6' },
  { name: 'Magenta', hex: '#ff00ff' },
  { name: 'Lavender', hex: '#b57edc' },
  { name: 'Purple', hex: '#a21caf' },
  { name: 'Indigo', hex: '#4c1d95' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Royal Blue', hex: '#1d4ed8' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Sky Blue', hex: '#38bdf8' },
  { name: 'Turquoise', hex: '#06b6d4' },
  { name: 'Cyan', hex: '#0ea5e9' },
  { name: 'Teal', hex: '#10b981' },
  { name: 'Dark Teal', hex: '#065f46' },
  { name: 'Mint', hex: '#98ff98' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Bright Green', hex: '#22c55e' },
  { name: 'Olive', hex: '#6b8e23' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Yellow Green', hex: '#a3e635' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Light Yellow', hex: '#fde047' },
  { name: 'Cream', hex: '#fff4e6' },
]

const COLOR_ALIASES: NamedColor[] = [
  { name: 'Jet Black', hex: '#000000' },
  { name: 'Charcoal Gray', hex: '#1f2937' },
  { name: 'Soft Gray', hex: '#e5e7eb' },
  { name: 'Heather Gray', hex: '#9ca3af' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Bright White', hex: '#ffffff' },
  { name: 'Off-White', hex: '#f5f5f5' },
  { name: 'Creamy White', hex: '#fff4e6' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Midnight Blue', hex: '#000080' },
  { name: 'Deep Navy', hex: '#000080' },
  { name: 'Baby Blue', hex: '#38bdf8' },
  { name: 'Light Blue', hex: '#38bdf8' },
  { name: 'Powder Blue', hex: '#bfd7ff' },
  { name: 'Forest Green', hex: '#065f46' },
  { name: 'Hunter Green', hex: '#065f46' },
  { name: 'Emerald', hex: '#16a34a' },
  { name: 'Sage', hex: '#a7c796' },
  { name: 'Olive Green', hex: '#6b8e23' },
  { name: 'Army Green', hex: '#556b2f' },
  { name: 'Dusty Rose', hex: '#d98695' },
  { name: 'Blush Pink', hex: '#f9a8d4' },
  { name: 'Hot Pink', hex: '#ff69b4' },
  { name: 'Wine', hex: '#800020' },
  { name: 'Maroon', hex: '#800020' },
  { name: 'Burgundy Red', hex: '#800020' },
  { name: 'Terracotta', hex: '#e2725b' },
  { name: 'Copper', hex: '#b87333' },
  { name: 'Bronze', hex: '#cd7f32' },
  { name: 'Burnt Orange', hex: '#cc5500' },
  { name: 'Mustard Yellow', hex: '#d97706' },
  { name: 'Golden Yellow', hex: '#ffd700' },
  { name: 'Pastel Yellow', hex: '#fde047' },
  { name: 'Lavender Purple', hex: '#b57edc' },
  { name: 'Plum', hex: '#8e4585' },
  { name: 'Deep Purple', hex: '#4c1d95' },
  { name: 'Charcoal Black', hex: '#1f2937' },
  { name: 'Chocolate Brown', hex: '#654321' },
  { name: 'Coffee Brown', hex: '#5d3a24' },
  { name: 'Camel Brown', hex: '#c19a6b' },
  { name: 'Tan Brown', hex: '#d2b48c' },
  { name: 'Champagne', hex: '#f7e7ce' },
]

const ALL_COLORS: NamedColor[] = [...BASE_COLORS, ...COLOR_ALIASES]

export const COLOR_PALETTE: NamedColor[] = BASE_COLORS.map((color) => ({
  name: color.name,
  hex: normalizeHex(color.hex) ?? color.hex.toUpperCase(),
}))

interface ColorPattern {
  displayName: string
  hex: string
  tokens: string[]
  regex: RegExp
}

const COLOR_PATTERNS: ColorPattern[] = buildColorPatterns(ALL_COLORS)

const NAME_LOOKUP = new Map<string, { hex: string; displayName: string }>()
const HEX_LOOKUP = new Map<string, string>()

COLOR_PATTERNS.forEach((entry) => {
  const key = entry.tokens.join(' ')
  if (!NAME_LOOKUP.has(key)) {
    NAME_LOOKUP.set(key, { hex: entry.hex, displayName: entry.displayName })
  }
})

ALL_COLORS.forEach((color) => {
  const normalized = normalizeHex(color.hex)
  if (normalized && !HEX_LOOKUP.has(normalized)) {
    HEX_LOOKUP.set(normalized, color.name)
  }
})

export function getHexForColorName(name: string): string | null {
  const tokens = tokenize(name)
  if (!tokens.length) return null
  const key = tokens.join(' ')
  const found = NAME_LOOKUP.get(key)
  return found ? found.hex : null
}

export function getNameForHex(hex: string): string | null {
  const normalized = normalizeHex(hex)
  if (!normalized) return null
  return HEX_LOOKUP.get(normalized) ?? null
}

export function findColorsInText(text: string): NamedColor[] {
  if (!text) return []
  const matches: Array<{ index: number; color: NamedColor; start: number; end: number }> = []
  const occupied: Array<{ start: number; end: number }> = []

  for (const pattern of COLOR_PATTERNS) {
    const match = pattern.regex.exec(text)
    if (!match) continue
    const start = match.index
    const end = start + match[0].length
    if (overlapsExisting(occupied, start, end)) continue
    occupied.push({ start, end })
    matches.push({
      index: start,
      color: { name: pattern.displayName, hex: pattern.hex },
      start,
      end,
    })
  }

  matches.sort((a, b) => a.index - b.index)

  const seen = new Set<string>()
  return matches.flatMap((match) => {
    const key = `${match.color.name.toLowerCase()}|${match.color.hex}`
    if (seen.has(key)) return []
    seen.add(key)
    return [match.color]
  })
}

function buildColorPatterns(colors: NamedColor[]): ColorPattern[] {
  const seen = new Set<string>()
  const patterns: ColorPattern[] = []
  for (const color of colors) {
    const tokens = tokenize(color.name)
    if (!tokens.length) continue
    const key = tokens.join(' ')
    if (seen.has(key)) continue
    seen.add(key)
    const normalizedHex = normalizeHex(color.hex)
    if (!normalizedHex) continue
    patterns.push({
      displayName: color.name,
      hex: normalizedHex,
      tokens,
      regex: buildRegex(tokens),
    })
  }
  return patterns.sort((a, b) => {
    if (b.tokens.length !== a.tokens.length) {
      return b.tokens.length - a.tokens.length
    }
    return b.displayName.length - a.displayName.length
  })
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function buildRegex(tokens: string[]): RegExp {
  const pattern = tokens.map((token) => escapeRegExp(token)).join('[\s-]+')
  return new RegExp(`\\b${pattern}\\b`, 'i')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function overlapsExisting(occupied: Array<{ start: number; end: number }>, start: number, end: number): boolean {
  return occupied.some((range) => start < range.end && end > range.start)
}
