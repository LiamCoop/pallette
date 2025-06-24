'use client'
import React, { useState } from "react";
import { isValidHex, findBestNumber } from "@/data/utils";

interface PalletteProps {
  colors: Record<string, Record<string, string>>
  setColors: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>
}

export default function Pallette({ colors, setColors }: PalletteProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; color: any } | null>(null)
  const [newFamilyInput, setNewFamilyInput] = useState<{ index: number; name: string } | null>(null)
  const [newColorInput, setNewColorInput] = useState<{ familyName: string; hex: string } | null>(null)

  const handleColorClick = (colorName: string) => {
    navigator.clipboard.writeText(colorName)
    setCopiedColor(colorName)
    setTimeout(() => setCopiedColor(null), 1500)
  }

  const handleRightClick = (e: React.MouseEvent, color: any) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, color })
  }

  const handleCopyName = (colorName: string) => {
    navigator.clipboard.writeText(colorName)
    setCopiedColor(colorName)
    setTimeout(() => setCopiedColor(null), 1500)
    setContextMenu(null)
  }

  const handleCopyHex = (colorHex: string) => {
    navigator.clipboard.writeText(colorHex)
    setCopiedColor(colorHex)
    setTimeout(() => setCopiedColor(null), 1500)
    setContextMenu(null)
  }

  const handleRemove = (familyName: string, colorKey: string) => {
    setColors(prevColors => {
      const newColors = { ...prevColors }
      if (newColors[familyName]) {
        const { [colorKey]: removed, ...rest } = newColors[familyName]
        newColors[familyName] = rest
      }
      return newColors
    })
    setContextMenu(null)
  }

  const handleAddFamily = (index: number) => {
    setNewFamilyInput({ index, name: '' })
  }

  const handleConfirmNewFamily = () => {
    if (newFamilyInput && newFamilyInput.name.trim()) {
      const familyName = newFamilyInput.name.trim().toLowerCase()
      setColors(prevColors => ({
        ...prevColors,
        [familyName]: {}
      }))
    }
    setNewFamilyInput(null)
  }

  const handleCancelNewFamily = () => {
    setNewFamilyInput(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirmNewFamily()
    } else if (e.key === 'Escape') {
      handleCancelNewFamily()
    }
  }

  const handleRemoveFamily = (familyName: string) => {
    setColors(prevColors => {
      const { [familyName]: removed, ...rest } = prevColors
      return rest
    })
  }

  const handleAddColor = (familyName: string) => {
    setNewColorInput({ familyName, hex: '' })
  }


  const handleConfirmNewColor = () => {
    if (newColorInput && newColorInput.hex.trim()) {
      const hexValue = newColorInput.hex.trim()
      
      if (!isValidHex(hexValue)) {
        alert('Please enter a valid hex color code (e.g., #ffffff or ffffff)')
        return
      }
      
      const hex = hexValue.startsWith('#') ? hexValue : `#${hexValue}`
      const familyName = newColorInput.familyName.toLowerCase()
      const familyColors = colors[familyName] || {}
      
      // Convert family colors to format expected by findBestNumber
      const existingColors = Object.entries(familyColors).map(([key, hex]) => ({
        name: `${familyName}-${key}`,
        hex
      }))
      
      const number = findBestNumber(existingColors, hex)
      
      if (familyColors[number.toString()]) {
        alert(`Color ${familyName}-${number} already exists in this family`)
        return
      }
      
      setColors(prevColors => ({
        ...prevColors,
        [familyName]: {
          ...prevColors[familyName],
          [number.toString()]: hex
        }
      }))
    }
    setNewColorInput(null)
  }

  const handleCancelNewColor = () => {
    setNewColorInput(null)
  }

  const handleColorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirmNewColor()
    } else if (e.key === 'Escape') {
      handleCancelNewColor()
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {Object.entries(colors).map(([familyName, familyColors], index) => (
            <React.Fragment key={familyName}>
              {/* Add family button before the first family */}
              {index === 0 && (
                <div className="relative group">
                  <div className="h-4 w-full flex items-center justify-start">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {newFamilyInput?.index === 0 ? (
                        <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                          <input
                            type="text"
                            value={newFamilyInput.name}
                            onChange={(e) => setNewFamilyInput({ ...newFamilyInput, name: e.target.value })}
                            onKeyDown={handleKeyDown}
                            onBlur={handleCancelNewFamily}
                            autoFocus
                            placeholder="Family name..."
                            className="text-sm border-none outline-none bg-transparent w-32 text-gray-700 placeholder-gray-600"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddFamily(0)}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
                          title="Add a colour family"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="group flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-700 capitalize">{familyName}</h2>
                  <button
                    onClick={() => handleAddColor(familyName)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-green-500 hover:text-green-700 p-1"
                    title="Add color"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveFamily(familyName)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 p-1"
                    title="Remove family"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-start items-start gap-1 flex-wrap sm:gap-2 md:gap-1 lg:justify-between">
                  {Object.keys(familyColors).length === 0 ? (
                    <div className="w-full text-center text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      No colors in this family
                    </div>
                  ) : (
                    Object.entries(familyColors)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([colorKey, hexValue]) => {
                        const colorName = `${familyName}-${colorKey}`
                        const colorClass = `bg-${familyName}-${colorKey}`
                        return (
                          <div key={colorName} className="group relative">
                            <div
                              className={`${colorClass} w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 transition-all duration-200 hover:scale-110 hover:shadow-md relative -ml-2 first:ml-0 sm:ml-0 hover:z-10`}
                              style={{ backgroundColor: hexValue }}
                              title={colorName}
                              onContextMenu={(e) => handleRightClick(e, { name: colorName, hex: hexValue, familyName, colorKey })}
                            >
                            </div>
                            <div className="absolute -bottom-6 sm:-bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {colorName}
                              </div>
                            </div>
                          </div>
                        )
                      })
                  )}
                </div>
                
                {newColorInput?.familyName === familyName && (
                  <div className="mt-4 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hex Code</label>
                        <input
                          type="text"
                          value={newColorInput.hex}
                          onChange={(e) => setNewColorInput({ ...newColorInput, hex: e.target.value })}
                          onKeyDown={handleColorKeyDown}
                          placeholder="#ffffff"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConfirmNewColor}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={handleCancelNewColor}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add family button between families */}
              <div className="relative group">
                <div className="h-4 w-full flex items-center justify-start">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {newFamilyInput?.index === index + 1 ? (
                      <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                        <input
                          type="text"
                          value={newFamilyInput.name}
                          onChange={(e) => setNewFamilyInput({ ...newFamilyInput, name: e.target.value })}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCancelNewFamily}
                          autoFocus
                          placeholder="Family name..."
                          className="text-sm border-none outline-none bg-transparent w-32 text-gray-700 placeholder-gray-600"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddFamily(index + 1)}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
                        title="Add a colour family"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {contextMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
        >
          <div 
            className="absolute bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[160px] z-50"
            style={{ 
              left: contextMenu.x, 
              top: contextMenu.y,
              transform: 'translate(-50%, -10px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleCopyName(contextMenu.color.name)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy name
            </button>
            <button
              onClick={() => handleCopyHex(contextMenu.color.hex)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Copy hex
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              onClick={() => handleRemove(contextMenu.color.familyName, contextMenu.color.colorKey)}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

