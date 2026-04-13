'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { Markdown } from 'tiptap-markdown'
import { RichTextToolbar } from './RichTextToolbar'

type Props = {
  // Contenu HTML initial
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Commencez à écrire...',
  minHeight = 200,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => {
       onChange(e.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
        style: `min-height: ${minHeight}px; padding: 16px;`,
      },
    },
  })

  // Sync si la valeur change de l'extérieur
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
        background: 'white',
      }}
    >
      <RichTextToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
