'use client'
import { useState } from "react"
import { SignInButton } from "./auth/SignInButton"
import { isValidHex, findClosestColor } from "@/data/utils"

interface HeaderProps {
  colors: Record<string, Record<string, string>>
}

export function Header({ colors }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchHex, setSearchHex] = useState('')
  const [searchResult, setSearchResult] = useState<{ family: string; key: string; hex: string; distance: number } | null>(null)
  const [searchError, setSearchError] = useState('')

  const handleSearch = () => {
    if (!searchHex.trim()) {
      setSearchError('Please enter a hex color')
      return
    }

    const cleanHex = searchHex.trim().startsWith('#') ? searchHex.trim() : `#${searchHex.trim()}`
    
    if (!isValidHex(cleanHex)) {
      setSearchError('Please enter a valid hex color (e.g., #ff5733)')
      return
    }

    const result = findClosestColor(cleanHex, colors)
    setSearchResult(result)
    setSearchError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false)
      setSearchHex('')
      setSearchResult(null)
      setSearchError('')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Color Palette Editor</h1>
            <p className="text-sm text-gray-600">Create and manage your Tailwind CSS color palettes</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Search for closest color"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <SignInButton />
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Find Closest Color</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter hex color
              </label>
              <input
                type="text"
                value={searchHex}
                onChange={(e) => setSearchHex(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="#ff5733"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-600"
                autoFocus
              />
            </div>

            {searchError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{searchError}</p>
              </div>
            )}

            {searchResult && (
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-2">Closest match:</p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: searchResult.hex }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">{searchResult.family}-{searchResult.key}</p>
                    <p className="text-sm text-gray-600">{searchResult.hex}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                Search
              </button>
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchHex('')
                  setSearchResult(null)
                  setSearchError('')
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}