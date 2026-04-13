'use client'

import { FieldDefinition } from '../EditorContext'

type Props = {
  field: FieldDefinition
  value: string
  onChange: (v: string) => void
}

export function TextareaField({ field, value, onChange }: Props) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={field.maxLength}
        rows={5}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
      />
      {field.maxLength && (
        <p className={`text-xs mt-1 text-right ${value.length > field.maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
          {value.length} / {field.maxLength}
        </p>
      )}
    </div>
  )
}
