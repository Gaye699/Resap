'use client'

import { FieldDefinition } from '../EditorContext'

type Props = {
  field: FieldDefinition
  value: string
  onChange: (v: string) => void
}

export function TextField({ field, value, onChange }: Props) {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={field.maxLength}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
      />
      {field.maxLength && (
        <p className={`text-xs mt-1 text-right ${value.length > field.maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
          {value.length} / {field.maxLength}
        </p>
      )}
    </div>
  )
}
