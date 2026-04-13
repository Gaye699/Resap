'use client'

import { FieldDefinition } from '../EditorContext'

type Props = {
  field: FieldDefinition
  value: string[]
  onChange: (v: string[]) => void
}

export function CheckboxGroupField({ field, value, onChange }: Props) {
  const toggle = (opt: string) => {
    const next = value.includes(opt)
      ? value.filter((v) => v !== opt)
      : [...value, opt]
    onChange(next)
  }

  return (
    <div className="space-y-1.5">
      {field.options?.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors
            ${value.includes(opt.value)
              ? 'border-blue-200 bg-blue-50'
              : 'border-gray-100 hover:border-blue-100 hover:bg-gray-50'}`}
        >
          <input
            type="checkbox"
            checked={value.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700">{opt.label}</span>
        </label>
      ))}
      <p className="text-xs text-gray-400 mt-2">{value.length} sélectionné(s)</p>
    </div>
  )
}
