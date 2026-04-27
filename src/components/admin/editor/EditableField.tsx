'use client'

import { useEditor, FieldDefinition } from './EditorContext'
import { useState } from 'react'

type Props = {
  field: FieldDefinition
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function EditableField({
  field,
  children,
  className = '',
  as: Tag = 'div',
}: Props) {
  const { selectField, selectedField } = useEditor()
  const [hovered, setHovered] = useState(false)

  const isSelected = selectedField?.key === field.key

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectField(field)
  }

  // Style selon l'état — PAS de tooltip, juste l'outline
  const outlineStyle = isSelected
    ? '2px solid #3b82f6'    // bleu plein = sélectionné
    : hovered
      ? '2px dashed #93c5fd' // bleu pointillé = survol
      : 'none'

  const bgStyle = isSelected
    ? 'rgba(59,130,246,0.04)'  // très léger bleu de fond
    : 'transparent'

  return (
    // @ts-ignore — Tag dynamique
    <Tag
      className={className}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        outline: outlineStyle,
        outlineOffset: '3px',
        background: bgStyle,
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'outline 0.12s ease, background 0.12s ease',
        position: 'relative',
      }}
    >
      {children}
    </Tag>
  )
}
