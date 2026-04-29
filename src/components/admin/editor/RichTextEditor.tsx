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
import { useEffect, useState } from 'react'
import { RichTextToolbar } from './RichTextToolbar'
import { AssetPicker } from './AssetPicker'

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

const AssetImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      assetId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-asset-id'),
        renderHTML: (attributes) => (
          attributes.assetId ? { 'data-asset-id': attributes.assetId } : {}
        ),
      },
    }
  },
})

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
      AssetImage.configure({
        inline: true,
        allowBase64: true,
      }),
      LinkExtension.configure({ openOnClick: false }),
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
        style: `min-height: ${minHeight}px; padding: 16px; height: auto;`,
      },
    },
  })

  // FONCTION POUR INSÉRER IMAGE / LIEN
  const handleEmbedAsset = (asset: {
  id: string
  titre: string
  url: string
  contentType: string
  fileName: string
}) => {
  setShowAssetPicker(false)
  if (!editor) return

  if (asset.contentType.startsWith('image/')) {
    // Image
   editor.chain().focus().setImage({
    src: asset.url,
    alt: asset.titre || asset.fileName,
    // @ts-expect-error — data-* non typé par Tiptap mais accepté par le DOM
    'data-asset-id': asset.id,
  }).run()
  } else {
    editor.chain().focus().insertContent({
      type: 'text',
      marks: [
        {
          type: 'link',
          attrs: {
            href: asset.url,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
      ],
      text: asset.titre || asset.fileName,
    }).run()
  }
}

  // Sync si valeur externe change
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    }
  }, [value, editor])

  // UI
  return (
    <div className="border border-gray-200 rounded-lg bg-white flex flex-col max-h-[70vh] overflow-hidden">
      <div className="sticky top-0 z-20 bg-[#fafafa] shrink-0">
        <RichTextToolbar
          editor={editor}
          onEmbedAsset={() => setShowAssetPicker(true)}
        />
      </div>

      <div className="overflow-y-auto flex-1">
        <EditorContent editor={editor} />
      </div>

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
