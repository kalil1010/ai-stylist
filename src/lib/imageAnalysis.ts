import { COLOR_PALETTE } from '@/lib/colors'
import { ColorAnalysis } from '@/types/clothing'

// Color detection using Canvas API with background suppression and center bias
export type ColorAlgorithm = 'legacy' | 'enhanced'

export function analyzeImageColors(imageFile: File, algorithm: ColorAlgorithm = 'enhanced'): Promise<ColorAnalysis> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | null
    if (!ctx) {
      reject(new Error('Failed to acquire 2D context'))
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      // Downscale for performance
      const targetW = 200
      const scale = Math.min(1, targetW / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      canvas.width = w
      canvas.height = h
      ctx.drawImage(img, 0, 0, w, h)

      const imageData = ctx.getImageData(0, 0, w, h)
      if (!imageData) return reject(new Error('Failed to get image data'))

      const colors = algorithm === 'enhanced'
        ? extractDominantColorsEnhanced(imageData)
        : extractDominantColorsLegacy(imageData)
      resolve(colors)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(imageFile)
  })
}

// Legacy, simpler extraction that matched your earlier results
function extractDominantColorsLegacy(imageData: ImageData): ColorAnalysis {
  const data = imageData.data
  const colorCounts: Record<string, number> = {}
  const totalPixels = data.length / 4

  // Sample every ~10th pixel for performance (step of 40 in RGBA array)
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const alpha = data[i + 3]
    if (alpha < 128) continue // skip transparent
    const hex = rgbToHex(r, g, b)
    colorCounts[hex] = (colorCounts[hex] || 0) + 1
  }

  const sorted = Object.entries(colorCounts).sort(([, a], [, b]) => b - a).slice(0, 5)
  const dominantColors = sorted.map(([hex]) => hex)
  const colorPercentages: Record<string, number> = {}
  sorted.forEach(([hex, count]) => { colorPercentages[hex] = (count / (totalPixels / 10)) * 100 })
  return { dominantColors, colorPercentages }
}

// Enhanced extraction with background suppression and center bias
function extractDominantColorsEnhanced(imageData: ImageData): ColorAnalysis {
  const { data, width, height } = imageData

  // Estimate background color by sampling border pixels and taking the mode (quantized)
  const borderSamples: number[] = []
  const addSample = (x: number, y: number) => {
    const idx = (y * width + x) * 4
    const a = data[idx + 3]
    if (a < 128) return
    const r = data[idx], g = data[idx + 1], b = data[idx + 2]
    borderSamples.push((r << 16) | (g << 8) | b)
  }
  for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 50))) {
    addSample(x, 0)
    addSample(x, height - 1)
  }
  for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 50))) {
    addSample(0, y)
    addSample(width - 1, y)
  }
  const bg = estimateModeColor(borderSamples)

  const colorCounts: Record<string, number> = {}
  let total = 0

  // Focus on center area to emphasize garment (tighter ellipse ~50–55%)
  const cx = width / 2, cy = height / 2
  const rx = width * 0.25, ry = height * 0.25

  // Sample pixels with center bias and background suppression
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4
      const a = data[idx + 3]
      if (a < 128) continue
      const r = data[idx], g = data[idx + 1], b = data[idx + 2]
      const brightness = (r + g + b) / 3
      const maxc = Math.max(r, g, b)
      const minc = Math.min(r, g, b)
      const saturationApprox = maxc - minc

      // Suppress near-white/near-black and flat gray
      if (brightness > 240 || brightness < 10 || (saturationApprox < 10 && brightness > 210)) continue

      // Suppress pixels similar to background (stronger margin)
      if (bg) {
        const br = (bg >> 16) & 255, bgc = (bg >> 8) & 255, bb = bg & 255
        const dist = colorDistance(r, g, b, br, bgc, bb)
        if (dist < 65) continue
      }

      // Suppress likely skin tones (basic RGB rule)
      const maxv = Math.max(r, g, b), minv = Math.min(r, g, b)
      const isSkin = (r > 95 && g > 40 && b > 20 && (maxv - minv) > 15 && Math.abs(r - g) > 15 && r > g && r > b)
      if (isSkin) continue

      // Extra suppression: hues close to background hue with low saturation
      const toHsl = (R: number, G: number, B: number) => {
        let r1 = R / 255, g1 = G / 255, b1 = B / 255
        const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1)
        let h = 0, s = 0, l = (max + min) / 2
        if (max !== min) {
          const d = max - min
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          switch (max) {
            case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break
            case g1: h = (b1 - r1) / d + 2; break
            case b1: h = (r1 - g1) / d + 4; break
          }
          h /= 6
        }
        return { h: h * 360, s, l }
      }
      const px = toHsl(r, g, b)
      // Suppress beige/cream (common backgrounds): hue ~ 25-50, low/moderate sat, high lightness
      // Suppress beige/cream (common background) and low-sat bright pixels
      if ((px.h >= 25 && px.h <= 50 && px.s < 0.35 && px.l > 0.65) || (px.s < 0.12 && px.l > 0.6)) continue
      if (bg) {
        const br = (bg >> 16) & 255, bgc = (bg >> 8) & 255, bb = bg & 255
        const bh = toHsl(br, bgc, bb).h
        const dh = Math.min(Math.abs(px.h - bh), 360 - Math.abs(px.h - bh))
        if (px.s < 0.2 && dh < 18) continue
      }

      // Elliptical center mask
      const norm = ((x - cx) * (x - cx)) / (rx * rx) + ((y - cy) * (y - cy)) / (ry * ry)
      const inCenter = norm <= 1

      // Quantize to reduce noise (finer than legacy)
      const qr = (r >> 3) << 3
      const qg = (g >> 3) << 3
      const qb = (b >> 3) << 3
      const hex = rgbToHex(qr, qg, qb)
      // Weighting: center * saturation * mid-lightness preference
      const satW = 1 + Math.min(2.5, px.s * 3)
      // Prefer mid/dark: heavier when l below 0.6, lighter penalty when above
      const lightW = px.l <= 0.6 ? 1 + (0.6 - px.l) : 1 - Math.min(0.3, px.l - 0.6)
      const weight = (inCenter ? 12 : 0.5) * satW * lightW
      colorCounts[hex] = (colorCounts[hex] || 0) + weight
      total += weight
    }
  }

  // Consolidate nearby colors to avoid duplicates (merge within small RGB distance)
  const consolidated: Record<string, number> = {}
  const threshold = 18 // RGB distance threshold
  const keys = Object.keys(colorCounts)
  const visited = new Set<string>()
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    if (visited.has(k)) continue
    visited.add(k)
    let count = colorCounts[k]
    let r0 = parseInt(k.slice(1, 3), 16)
    let g0 = parseInt(k.slice(3, 5), 16)
    let b0 = parseInt(k.slice(5, 7), 16)
    for (let j = i + 1; j < keys.length; j++) {
      const k2 = keys[j]
      if (visited.has(k2)) continue
      const r1 = parseInt(k2.slice(1, 3), 16)
      const g1 = parseInt(k2.slice(3, 5), 16)
      const b1 = parseInt(k2.slice(5, 7), 16)
      if (colorDistance(r0, g0, b0, r1, g1, b1) <= threshold) {
        count += colorCounts[k2]
        // average towards weighted mean
        r0 = Math.round((r0 + r1) / 2)
        g0 = Math.round((g0 + g1) / 2)
        b0 = Math.round((b0 + b1) / 2)
        visited.add(k2)
      }
    }
    const qhex = rgbToHex((r0 >> 3) << 3, (g0 >> 3) << 3, (b0 >> 3) << 3)
    consolidated[qhex] = (consolidated[qhex] || 0) + count
  }

  const sorted = Object.entries(consolidated).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const dominantColors = sorted.map(([hex]) => hex)
  const colorPercentages: Record<string, number> = {}
  const totalCon = sorted.reduce((acc, [, c]) => acc + c, 0)
  sorted.forEach(([hex, count]) => { colorPercentages[hex] = (count / Math.max(1, totalCon)) * 100 })

  return { dominantColors, colorPercentages }
}

function estimateModeColor(colors: number[]): number | null {
  if (!colors.length) return null
  const counts = new Map<number, number>()
  for (const c of colors) {
    const qr = (c >> 16) & 0xff, qg = (c >> 8) & 0xff, qb = c & 0xff
    const quant = ((qr >> 4) << 16) | ((qg >> 4) << 8) | (qb >> 4)
    counts.set(quant, (counts.get(quant) || 0) + 1)
  }
  let best: number | null = null, bestCount = -1
  counts.forEach((cnt, key) => { if (cnt > bestCount) { best = key; bestCount = cnt } })
  if (best == null) return null
  // Expand back to 8-bit per channel (approx)
  const r = ((best >> 16) & 0xff) << 4
  const g = ((best >> 8) & 0xff) << 4
  const b = (best & 0xff) << 4
  return (r << 16) | (g << 8) | b
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Garment type detection using simple heuristics
export function detectGarmentType(imageFile: File): Promise<string> {
  return new Promise((resolve) => {
    // This is a simplified version. In a real app, you'd use ML models
    // For now, we'll return a default and let users correct it
    resolve('top') // Default to 'top'
  })
}

// Color name mapping
export function getColorName(hex: string): string {
  const target = hexToRgb(hex)
  if (!target) return 'Unknown'
  let bestName = 'Unknown'
  let best = Infinity
  for (const color of COLOR_PALETTE) {
    const rgb = hexToRgb(color.hex)
    if (!rgb) continue
    const distance = colorDistance(target.r, target.g, target.b, rgb.r, rgb.g, rgb.b)
    if (distance < best) {
      best = distance
      bestName = color.name
    }
  }
  return bestName
}


function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Matching color suggestions based on simple color theory (complementary/analogous/triadic)
export function getMatchingColors(hex: string): { complementary: string; analogous: string[]; triadic: string[] } {
  const toHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    return { h: h * 360, s, l }
  }
  const toRgb = (h: number, s: number, l: number) => {
    h /= 360
    let r: number, g: number, b: number
    if (s === 0) { r = g = b = l } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
  }
  const rgbToHexStr = (r: number, g: number, b: number) => rgbToHex(r, g, b)

  const base = hexToRgb(hex) || { r: 0, g: 0, b: 0 }
  const { h, s, l } = toHsl(base.r, base.g, base.b)
  const wrap = (deg: number) => (deg + 360) % 360
  const comp = wrap(h + 180)
  const ana = [wrap(h - 30), wrap(h + 30)]
  const tri = [wrap(h + 120), wrap(h - 120)]

  const compRgb = toRgb(comp, s, l)
  const anaRgb = ana.map(a => toRgb(a, s, l))
  const triRgb = tri.map(t => toRgb(t, s, l))

  return {
    complementary: rgbToHexStr(compRgb.r, compRgb.g, compRgb.b),
    analogous: anaRgb.map(c => rgbToHexStr(c.r, c.g, c.b)),
    triadic: triRgb.map(c => rgbToHexStr(c.r, c.g, c.b)),
  }
}

// Rich, well-structured palette around a base color
export function getRichPalette(hex: string): {
  base: string
  complementary: string
  splitComplementary: string[]
  analogous: string[]
  triadic: string[]
  tetradic: string[]
  monochrome: string[]
  neutrals: string[]
} {
  const toHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    return { h: h * 360, s, l }
  }
  const toRgb = (h: number, s: number, l: number) => {
    h /= 360
    let r: number, g: number, b: number
    if (s === 0) { r = g = b = l } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
  }
  const rgbToHexStr = (r: number, g: number, b: number) => rgbToHex(r, g, b)
  const wrap = (deg: number) => (deg + 360) % 360

  const base = hexToRgb(hex) || { r: 0, g: 0, b: 0 }
  const { h, s, l } = toHsl(base.r, base.g, base.b)

  // Complementary
  const comp = wrap(h + 180)

  // Split complementary (around the complement ±30)
  const split = [wrap(h + 150), wrap(h + 210)]

  // Analogous (±30, ±15)
  const analogous = [wrap(h - 30), wrap(h - 15), wrap(h + 15), wrap(h + 30)]

  // Triadic (±120)
  const tri = [wrap(h + 120), wrap(h - 120)]

  // Tetradic (square): +90, +180, +270
  const tetr = [wrap(h + 90), wrap(h + 180), wrap(h + 270)]

  // Monochrome: 3 tints + 3 shades around current lightness (cap to [0,1])
  const mkMono = () => {
    const steps = [-0.3, -0.18, -0.08, 0.08, 0.18, 0.3]
    const sat = Math.max(0.28, Math.min(0.9, s))
    return steps.map((dl) => {
      const nl = Math.max(0.05, Math.min(0.95, l + dl))
      const { r, g, b } = toRgb(h, sat, nl)
      return rgbToHexStr(r, g, b)
    })
  }

  const toHex = (deg: number, sat = s, lig = l) => {
    const { r, g, b } = toRgb(deg, sat, lig)
    return rgbToHexStr(r, g, b)
  }

  // Neutrals: include true black and range of grays
  const neutrals = ['#000000', '#ffffff', '#f5f5f5', '#e5e7eb', '#9ca3af', '#4b5563', '#111827']

  return {
    base: rgbToHexStr(base.r, base.g, base.b),
    complementary: toHex(comp),
    splitComplementary: split.map((d) => toHex(d)),
    analogous: analogous.map((d) => toHex(d)),
    triadic: tri.map((d) => toHex(d)),
    tetradic: tetr.map((d) => toHex(d)),
    monochrome: mkMono(),
    neutrals,
  }
}

// Adjust a color to be more readable (normalize lightness/saturation)
export function ensureReadableColor(hex: string, targetL = 0.55, minS = 0.5): string {
  const toHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    return { h: h * 360, s, l }
  }
  const toRgb = (h: number, s: number, l: number) => {
    h /= 360
    let r: number, g: number, b: number
    if (s === 0) { r = g = b = l } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
  }
  const base = hexToRgb(hex)
  if (!base) return hex
  const hsl = toHsl(base.r, base.g, base.b)
  const newS = Math.max(minS, hsl.s)
  const newL = Math.min(0.75, Math.max(0.35, targetL))
  const out = toRgb(hsl.h, newS, newL)
  return rgbToHex(out.r, out.g, out.b)
}

