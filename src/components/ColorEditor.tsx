'use client'
import React, { useState, useEffect, useRef } from "react";

interface ColorEditorProps {
  colors: Record<string, Record<string, string>>
  setColors: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>
}

export default function ColorEditor({ colors, setColors }: ColorEditorProps) {
  const [editorValue, setEditorValue] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState('')
  const [invalidLines, setInvalidLines] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Convert colors object to formatted JSON string
  useEffect(() => {
    const formatted = JSON.stringify(colors, null, 2)
    setEditorValue(formatted)
  }, [colors])

  // Update line validation when editor value changes
  useEffect(() => {
    validateLineByLine(editorValue)
  }, [editorValue])

  const validateLineByLine = (value: string) => {
    const lines = value.split('\n')
    const newInvalidLines = new Set<number>()
    
    // First, try to parse JSON to get syntax error information
    try {
      JSON.parse(value)
    } catch (err) {
      if (err instanceof SyntaxError) {
        const errorMessage = err.message
        
        // Try to extract line number from error message
        const lineMatch = errorMessage.match(/at line (\d+)/)
        if (lineMatch) {
          const errorLine = parseInt(lineMatch[1]) - 1 // Convert to 0-based index
          newInvalidLines.add(errorLine)
        } else {
          // If we can't get specific line info, try to detect common syntax errors
          detectSyntaxErrors(lines, newInvalidLines)
        }
      }
    }
    
    // Validate content-specific issues (hex colors, keys, etc.)
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      // Skip empty lines
      if (!trimmedLine) return
      
      // Check for hex color pattern: "key": "#hexvalue"
      const hexColorMatch = trimmedLine.match(/["']([^"']+)["']\s*:\s*["']([^"']+)["']/)
      if (hexColorMatch) {
        const [, key, value] = hexColorMatch
        
        // Validate hex format
        const hexRegex = /^#[0-9A-Fa-f]{6}$/
        if (!hexRegex.test(value)) {
          newInvalidLines.add(index)
        }
        
        // Validate key is numeric for color scales
        if (!/^\d+$/.test(key)) {
          newInvalidLines.add(index)
        }
      }
      
      // Check for common JSON syntax issues
      validateJsonSyntax(line, index, lines, newInvalidLines)
    })
    
    setInvalidLines(newInvalidLines)
  }

  const detectSyntaxErrors = (lines: string[], invalidLines: Set<number>) => {
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return
      
      // Check for missing commas (line ends with } or " but next non-empty line doesn't start with })
      if ((trimmedLine.endsWith('"') || trimmedLine.endsWith('}')) && !trimmedLine.endsWith(',')) {
        const nextNonEmptyLineIndex = findNextNonEmptyLine(lines, index)
        if (nextNonEmptyLineIndex !== -1) {
          const nextLine = lines[nextNonEmptyLineIndex].trim()
          if (!nextLine.startsWith('}') && nextLine !== '') {
            invalidLines.add(index)
          }
        }
      }
      
      // Check for trailing commas before closing braces
      if (trimmedLine.endsWith(',')) {
        const nextNonEmptyLineIndex = findNextNonEmptyLine(lines, index)
        if (nextNonEmptyLineIndex !== -1) {
          const nextLine = lines[nextNonEmptyLineIndex].trim()
          if (nextLine.startsWith('}')) {
            invalidLines.add(index)
          }
        }
      }
    })
  }

  const validateJsonSyntax = (line: string, index: number, lines: string[], invalidLines: Set<number>) => {
    const trimmedLine = line.trim()
    
    // Check for unmatched quotes
    const quoteCount = (trimmedLine.match(/"/g) || []).length
    if (quoteCount % 2 !== 0 && !trimmedLine.endsWith(',') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}')) {
      invalidLines.add(index)
    }
    
    // Check for key-value pairs without colons
    if (trimmedLine.includes('"') && !trimmedLine.includes(':') && 
        !trimmedLine.startsWith('{') && !trimmedLine.startsWith('}') && 
        trimmedLine.length > 2) {
      invalidLines.add(index)
    }
    
    // Check for invalid JSON values (not strings, numbers, booleans, null, objects, arrays)
    const keyValueMatch = trimmedLine.match(/["']([^"']+)["']\s*:\s*(.+?)(?:,\s*)?$/)
    if (keyValueMatch) {
      const value = keyValueMatch[2].trim()
      // Remove trailing comma for validation
      const cleanValue = value.replace(/,\s*$/, '')
      
      if (!isValidJsonValue(cleanValue)) {
        invalidLines.add(index)
      }
    }
  }

  const findNextNonEmptyLine = (lines: string[], currentIndex: number): number => {
    for (let i = currentIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() !== '') {
        return i
      }
    }
    return -1
  }

  const isValidJsonValue = (value: string): boolean => {
    // Check if it's a valid JSON value
    try {
      JSON.parse(value)
      return true
    } catch {
      // Check for specific valid patterns that might not parse alone
      return (
        value === 'true' ||
        value === 'false' ||
        value === 'null' ||
        /^".*"$/.test(value) ||  // String
        /^-?\d+(\.\d+)?$/.test(value) ||  // Number
        value === '{' ||
        value === '}'
      )
    }
  }

  const validateAndUpdateColors = (value: string) => {
    try {
      const parsed = JSON.parse(value)
      
      // Validate structure
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Colors must be an object')
      }
      
      for (const [familyName, familyColors] of Object.entries(parsed)) {
        if (typeof familyColors !== 'object' || familyColors === null) {
          throw new Error(`Color family "${familyName}" must be an object`)
        }
        
        for (const [colorKey, hexValue] of Object.entries(familyColors as Record<string, unknown>)) {
          if (typeof hexValue !== 'string') {
            throw new Error(`Color "${familyName}.${colorKey}" must be a string`)
          }
          
          // Validate hex format
          const hexRegex = /^#[0-9A-Fa-f]{6}$/
          if (!hexRegex.test(hexValue as string)) {
            throw new Error(`Color "${familyName}.${colorKey}" must be a valid hex color (e.g., #ff0000)`)
          }
        }
      }
      
      setColors(parsed)
      setIsValid(true)
      setError('')
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'Invalid JSON format')
    }
  }

  const updateOverlay = () => {
    if (!textareaRef.current || !overlayRef.current) return
    
    const textarea = textareaRef.current
    const overlay = overlayRef.current
    
    // Sync scroll position
    overlay.scrollTop = textarea.scrollTop
    overlay.scrollLeft = textarea.scrollLeft
  }

  const renderLineHighlights = () => {
    const lines = editorValue.split('\n')
    
    return lines.map((line, index) => (
      <div
        key={index}
        className={`whitespace-pre font-mono text-sm leading-5 ${
          invalidLines.has(index) ? 'bg-red-100' : ''
        }`}
        style={{ minHeight: '1.25rem' }}
      >
        {line || ' '}
      </div>
    ))
  }

  const handleEditorChange = (value: string) => {
    setEditorValue(value)
    
    // Debounce validation and update
    setTimeout(() => {
      validateAndUpdateColors(value)
    }, 500)
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editorValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Color Editor</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">{isValid ? 'Valid' : 'Invalid'}</span>
          </div>
        </div>
      </div>
      
      {!isValid && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden relative">
        {/* Background overlay for line highlighting */}
        <div
          ref={overlayRef}
          className="absolute inset-0 p-4 pointer-events-none overflow-auto"
          style={{ zIndex: 1 }}
        >
          {renderLineHighlights()}
        </div>
        
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={editorValue}
          onChange={(e) => handleEditorChange(e.target.value)}
          onScroll={updateOverlay}
          className="w-full h-full p-4 font-mono text-sm text-gray-700 placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset relative bg-transparent"
          style={{ zIndex: 2 }}
          placeholder="Enter your colors object here..."
          spellCheck={false}
        />
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Format: JSON object with color families as keys and color scales as nested objects.</p>
        <p>Example: {"{ \"blue\": { \"500\": \"#3b82f6\" } }"}</p>
      </div>
    </div>
  )
}