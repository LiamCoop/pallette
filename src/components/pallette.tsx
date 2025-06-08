'use client'
import React, { useState } from "react";
import { colorFamilies } from "@/data/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Component() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [colors, setColors] = useState(colorFamilies)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; color: any } | null>(null)
  const [newFamilyInput, setNewFamilyInput] = useState<{ index: number; name: string } | null>(null)

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

  const handleRemove = (familyName: string, colorName: string) => {
    setColors(prevColors => 
      prevColors.map(family => 
        family.name === familyName 
          ? { ...family, colors: family.colors.filter(color => color.name !== colorName) }
          : family
      )
    )
    setContextMenu(null)
  }

  const handleAddFamily = (index: number) => {
    setNewFamilyInput({ index, name: '' })
  }

  const handleConfirmNewFamily = () => {
    if (newFamilyInput && newFamilyInput.name.trim()) {
      const newFamily = {
        name: newFamilyInput.name.trim(),
        colors: []
      }
      setColors(prevColors => {
        const newColors = [...prevColors]
        newColors.splice(newFamilyInput.index, 0, newFamily)
        return newColors
      })
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
    setColors(prevColors => prevColors.filter(family => family.name !== familyName))
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tailwind CSS Color Palette</h1>
        <div className="space-y-6">
          {colors.map((family, index) => (
            <React.Fragment key={family.name}>
              {/* Add family button before the first family */}
              {index === 0 && (
                <div className="relative group">
                  <div className="h-4 w-full flex items-center justify-center">
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
                            className="text-sm border-none outline-none bg-transparent w-32"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddFamily(0)}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
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
                  <h2 className="text-lg font-semibold text-gray-700 capitalize">{family.name}</h2>
                  <button
                    onClick={() => handleRemoveFamily(family.name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 p-1"
                    title="Remove family"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-11 gap-2">
                  {family.colors.length === 0 ? (
                    <div className="col-span-11 text-center text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      No colors in this family
                    </div>
                  ) : (
                    family.colors.map((color) => (
                      <div key={color.name} className="group relative">
                        <div
                          className={`${color.class} w-12 h-12 rounded-2xl shadow-sm border border-gray-200 transition-all duration-200 hover:scale-110 hover:shadow-md cursor-pointer relative`}
                          title={color.name}
                          onClick={() => handleColorClick(color.hex)}
                          onContextMenu={(e) => handleRightClick(e, { ...color, familyName: family.name })}
                        >
                          {copiedColor === color.hex && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/90 rounded-full p-1">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 2H16M8 2V6H16V2M8 6H7.2C6.54 6 6 6.54 6 7.2V20.8C6 21.46 6.54 22 7.2 22H16.8C17.46 22 18 21.46 18 20.8V7.2C18 6.54 17.46 6 16.8 6H16M12 11V17M9 14H15" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {color.name}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add family button between families */}
              <div className="relative group">
                <div className="h-4 w-full flex items-center justify-center">
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
                          className="text-sm border-none outline-none bg-transparent w-32 text-black"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddFamily(index + 1)}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
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
              onClick={() => handleRemove(contextMenu.color.familyName, contextMenu.color.name)}
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

