// Utility to scale ingredient quantities based on serving size

// Common fraction mappings
const fractionMap: Record<string, number> = {
  '½': 0.5,
  '⅓': 1/3,
  '⅔': 2/3,
  '¼': 0.25,
  '¾': 0.75,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
}

// Convert decimal to nice fraction string
function decimalToFraction(decimal: number): string {
  if (decimal === 0) return '0'

  const whole = Math.floor(decimal)
  const frac = decimal - whole

  // Common fractions with tolerance
  const fractions: [number, string][] = [
    [0, ''],
    [0.125, '⅛'],
    [0.25, '¼'],
    [0.333, '⅓'],
    [0.375, '⅜'],
    [0.5, '½'],
    [0.625, '⅝'],
    [0.667, '⅔'],
    [0.75, '¾'],
    [0.875, '⅞'],
  ]

  // Find closest fraction
  let closestFrac = ''
  let closestDiff = 1

  for (const [value, symbol] of fractions) {
    const diff = Math.abs(frac - value)
    if (diff < closestDiff) {
      closestDiff = diff
      closestFrac = symbol
    }
  }

  // If very close to a whole number, round
  if (closestDiff > 0.1) {
    // Not close to a nice fraction, use decimal
    if (whole === 0) {
      return decimal.toFixed(1).replace(/\.0$/, '')
    }
    return decimal.toFixed(1).replace(/\.0$/, '')
  }

  if (whole === 0 && closestFrac) {
    return closestFrac
  }

  if (closestFrac) {
    return `${whole}${closestFrac}`
  }

  return whole.toString()
}

// Scale a single ingredient line
function scaleIngredientLine(line: string, ratio: number): string {
  if (ratio === 1) return line

  // Match number at start of line (including fractions)
  // Patterns: "2 cups", "1/2 cup", "½ cup", "1 1/2 cups", "1½ cups"

  // Try unicode fractions first
  for (const [frac, value] of Object.entries(fractionMap)) {
    const unicodePattern = new RegExp(`^(\\d*\\s*)${frac}`)
    const match = line.match(unicodePattern)
    if (match) {
      const whole = match[1].trim() ? parseInt(match[1]) : 0
      const originalValue = whole + value
      const scaledValue = originalValue * ratio
      const rest = line.slice(match[0].length)
      return decimalToFraction(scaledValue) + rest
    }
  }

  // Try "1 1/2" or "1/2" pattern
  const mixedFractionPattern = /^(\d+)\s+(\d+)\/(\d+)/
  const mixedMatch = line.match(mixedFractionPattern)
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1])
    const num = parseInt(mixedMatch[2])
    const denom = parseInt(mixedMatch[3])
    const originalValue = whole + (num / denom)
    const scaledValue = originalValue * ratio
    const rest = line.slice(mixedMatch[0].length)
    return decimalToFraction(scaledValue) + rest
  }

  const simpleFractionPattern = /^(\d+)\/(\d+)/
  const simpleMatch = line.match(simpleFractionPattern)
  if (simpleMatch) {
    const num = parseInt(simpleMatch[1])
    const denom = parseInt(simpleMatch[2])
    const originalValue = num / denom
    const scaledValue = originalValue * ratio
    const rest = line.slice(simpleMatch[0].length)
    return decimalToFraction(scaledValue) + rest
  }

  // Try simple number
  const numberPattern = /^([\d.]+)/
  const numberMatch = line.match(numberPattern)
  if (numberMatch) {
    const originalValue = parseFloat(numberMatch[1])
    const scaledValue = originalValue * ratio
    const rest = line.slice(numberMatch[0].length)
    return decimalToFraction(scaledValue) + rest
  }

  // No number found, return as-is (e.g., "Salt and pepper")
  return line
}

// Scale all ingredients based on serving ratio
export function scaleIngredients(
  ingredientsText: string,
  originalServings: number,
  newServings: number
): string {
  if (originalServings === newServings || originalServings <= 0) {
    return ingredientsText
  }

  const ratio = newServings / originalServings

  const lines = ingredientsText.split('\n')
  const scaledLines = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return line
    return scaleIngredientLine(trimmed, ratio)
  })

  return scaledLines.join('\n')
}

export const DEFAULT_SERVINGS = 2
