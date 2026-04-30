'use client'

import { useState } from 'react'

type Props = {
  value: string[]
  onChange: (value: string[]) => void
}

export function TagsField({ value, onChange }: Props) {
  const [input, setInput] = useState('')

  const addTag = () => {
    if (input.trim() && !value.includes(input.trim())) {
      onChange([...value, input.trim()])
      setInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder="Ajouter un tag (Entrée)"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-blue-500 hover:text-blue-700"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
