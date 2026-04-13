'use client'

import { FieldDefinition } from '../EditorContext'

type Props = {
  field: FieldDefinition
  value: string
  onChange: (v: string) => void
}

export function SelectField({ field, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      {field.options?.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
