export const isValidHex = (hex: string) => {
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex
  return /^[0-9A-Fa-f]{6}$/.test(cleanHex)
}

export const hexToDecimal = (hex: string) => {
  return parseInt(hex.slice(1), 16)
}

export const findBestNumber = (existingColors: Array<{name: string, hex: string}>, hexValue: string) => {
  if (existingColors.length === 0) {
    return 500
  }

  const newDecimal = hexToDecimal(hexValue)
  const colorsWithNumbers = existingColors.map(color => ({
    number: parseInt(color.name.split('-')[1]),
    decimal: hexToDecimal(color.hex)
  })).sort((a, b) => a.decimal - b.decimal)

  // Map decimal value (0 to 16777215) to scale (50 to 950)
  const maxHex = 16777215 // #ffffff
  const minScale = 50
  const maxScale = 950
  const baseNumber = Math.round(((maxHex - newDecimal) / maxHex) * (maxScale - minScale) + minScale)
  
  // Round to nearest 25 or 50
  let targetNumber
  if (baseNumber % 50 === 0) {
    targetNumber = baseNumber
  } else if (baseNumber % 25 === 0) {
    targetNumber = baseNumber
  } else {
    // Round to nearest 25
    targetNumber = Math.round(baseNumber / 25) * 25
  }

  // Ensure it's within bounds
  targetNumber = Math.max(25, Math.min(975, targetNumber))

  // Check if this number already exists, if so find the nearest available
  const existingNumbers = colorsWithNumbers.map(c => c.number)
  if (!existingNumbers.includes(targetNumber)) {
    return targetNumber
  }

  // Find nearest available number
  for (let offset = 25; offset <= 200; offset += 25) {
    const lower = targetNumber - offset
    const higher = targetNumber + offset
    
    if (lower >= 25 && !existingNumbers.includes(lower)) {
      return lower
    }
    if (higher <= 975 && !existingNumbers.includes(higher)) {
      return higher
    }
  }

  return targetNumber
}

export const findClosestColor = (searchHex: string, colors: Record<string, Record<string, string>>) => {
  const searchDecimal = hexToDecimal(searchHex)
  let closestMatch: { family: string; key: string; hex: string; distance: number } | null = null
  
  for (const [familyName, familyColors] of Object.entries(colors)) {
    for (const [colorKey, colorHex] of Object.entries(familyColors)) {
      const colorDecimal = hexToDecimal(colorHex)
      const distance = Math.abs(searchDecimal - colorDecimal)
      
      if (!closestMatch || distance < closestMatch.distance) {
        closestMatch = {
          family: familyName,
          key: colorKey,
          hex: colorHex,
          distance
        }
      }
    }
  }
  
  return closestMatch
}