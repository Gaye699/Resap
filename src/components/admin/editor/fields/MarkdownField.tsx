'use client'

import { useState } from 'react'
import { FieldDefinition } from '../EditorContext'

type Props = {
  field: FieldDefinition
  value: string
  onChange: (v: string) => void
}

export function MarkdownField({ field: _field, value, onChange }: Props) {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div>
      {/* Toggle guide Markdown */}
      <button
        type="button"
        onClick={() => setShowGuide(!showGuide)}
        className="text-xs text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
      >
        {showGuide ? '▲ Masquer le guide' : '▼ Guide Markdown'}
      </button>

      {showGuide && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs text-gray-600 font-mono leading-relaxed">
          <p>**gras** → <strong>gras</strong></p>
          <p>*italique* → <em>italique</em></p>
          <p># Titre 1 &nbsp;&nbsp; ## Titre 2</p>
          <p>- item de liste</p>
          <p>[texte](url) → lien</p>
          <p>---  → ligne de séparation</p>
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
        placeholder="Écrivez en Markdown..."
      />
      <p className="text-xs text-gray-400 mt-1">{value.length} caractères</p>
    </div>
  )
}
