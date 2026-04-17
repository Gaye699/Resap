'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Markdown } from 'tiptap-markdown'
import { useEffect, useState } from 'react'
import { RichTextToolbar } from './RichTextToolbar'
import { AssetPicker } from './AssetPicker'

type Props = {
  value: string
  onChange: (markdown: string) => void
  placeholder?: string
  minHeight?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Commencez à écrire...',
  minHeight = 200,
}: Props) {
// ÉTAT POUR OUVRIR LE PICKER
  const [showAssetPicker, setShowAssetPicker] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Markdown.configure({
        html: false,
        transformCopiedText: true,
        transformPastedText: true,
      }),
    ],

    content: value,

    onUpdate: ({ editor: e }) => {
      const md = (e.storage as any).markdown?.getMarkdown?.() ?? ''
      onChange(md)
    },

    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
        style: `min-height: ${minHeight}px; padding: 16px; font-size: 14px;`,
      },
    },
  })

  // FONCTION POUR INSÉRER IMAGE / LIEN
  const handleEmbedAsset = (asset: {
    id: string
    titre: string
    url: string
    contentType: string
  }) => {
    setShowAssetPicker(false)

    if (asset.contentType.startsWith('image/')) {
      editor?.chain().focus().setImage({
        src: asset.url,
        alt: asset.titre,
      }).run()
    } else {
      editor?.chain().focus()
        .extendMarkRange('link')
        .insertContent(
          `<a href="${asset.url}" target="_blank" rel="noopener noreferrer">${asset.titre}</a>`
                )
        .run()
    }
  }

  // Sync si valeur externe change
  useEffect(() => {
    if (!editor) return
    const current = (editor.storage as any).markdown?.getMarkdown?.() ?? ''
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  // UI
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
        background: 'white',
      }}
    >
      {/* ✅ Toolbar avec bouton pour ouvrir picker */}
      <RichTextToolbar
        editor={editor}
        onEmbedAsset={() => setShowAssetPicker(true)}
      />

      {/* ✅ Éditeur */}
      <EditorContent editor={editor} />

      {/* ✅ POPUP ASSET PICKER */}
      {showAssetPicker && (
        <AssetPicker
          mode="embed"
          onSelect={handleEmbedAsset}
          onClose={() => setShowAssetPicker(false)}
        />
      )}
    </div>
  )
}
