'use client'
import React, { useState } from "react";
import { colorFamilies } from "@/data/types";

export default function Component() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const handleColorClick = (colorName: string) => {
    navigator.clipboard.writeText(colorName)
    setCopiedColor(colorName)
    setTimeout(() => setCopiedColor(null), 1500)
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tailwind CSS Color Palette</h1>
        <div className="space-y-6">
          {colorFamilies.map((family) => (
            <div key={family.name} className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-700 capitalize">{family.name}</h2>
              <div className="grid grid-cols-11 gap-2">
                {family.colors.map((color) => (
                  <div key={color.name} className="group relative">
                    <div
                      className={`${color.class} w-12 h-12 rounded-2xl shadow-sm border border-gray-200 transition-all duration-200 hover:scale-110 hover:shadow-md cursor-pointer relative`}
                      title={color.name}
                      onClick={() => handleColorClick(color.hex)}
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
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

