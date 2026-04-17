'use client'

import { Editor } from '@tiptap/react'
import { useRef } from 'react'

type Props = {
  editor: Editor | null
  onEmbedAsset?: () => void
}

type BtnProps = {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
  disabled?: boolean
}

function Btn({ onClick, isActive, title, children, disabled }: BtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 4,
        border: 'none',
        background: isActive ? '#dbeafe' : 'transparent',
        color: isActive ? '#1d4ed8' : '#374151',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: isActive ? 600 : 400,
        opacity: disabled ? 0.35 : 1,
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => { if (!isActive && !disabled) e.currentTarget.style.background = '#f3f4f6' }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div style={{ width: 1, height: 18, background: '#e5e7eb', margin: '0 3px', flexShrink: 0 }} />
}

export function RichTextToolbar({ editor, onEmbedAsset }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!editor) return null

  // Ouvre le sélecteur de fichier pour uploader une image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      if (src) {
        editor.chain().focus().setImage({ src }).run()
      }
    }
    reader.readAsDataURL(file)
    // Reset pour permettre de recharger le même fichier
    e.target.value = ''
  }

  // Insère une image depuis une URL
  const handleImageUrl = () => {
    const url = window.prompt('URL de l\'image :')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const handleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    } else {
      const url = window.prompt('URL du lien :')
      if (url) editor.chain().focus().setLink({ href: url }).run()
    }
  }

  // Couleur actuelle du texte sélectionné
  const currentColor = editor.getAttributes('textStyle').color ?? '#000000'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: '5px 8px',
        background: '#fafafa',
        borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        rowGap: 4,
      }}
    >
      {/* Titres */}
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Titre 1">H1</Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Titre 2">H2</Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Titre 3">H3</Btn>

      <Sep />

      {/* Formatage */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Gras (Ctrl+B)">
        <strong>B</strong>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italique (Ctrl+I)">
        <em>I</em>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Souligné (Ctrl+U)">
        <span style={{ textDecoration: 'underline' }}>U</span>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Barré">
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </Btn>

      <Sep />

      {/* Couleur du texte — color picker natif */}
      <label
        title="Couleur du texte"
        style={{
          width: 28,
          height: 28,
          borderRadius: 4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        {/* Lettre A avec soulignement de la couleur actuelle */}
        <span style={{ fontSize: 13, fontWeight: 700, color: currentColor, lineHeight: 1 }}>A</span>
        <span style={{
          position: 'absolute',
          bottom: 2,
          left: 4,
          right: 4,
          height: 3,
          background: currentColor,
          borderRadius: 1,
        }}
        />
        <input
          type="color"
          value={currentColor}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
            width: '100%',
            height: '100%',
          }}
        />
      </label>

      {/* Supprimer couleur */}
      <Btn
        onClick={() => editor.chain().focus().unsetColor().run()}
        disabled={!editor.getAttributes('textStyle').color}
        title="Supprimer la couleur"
      >
        <span style={{ fontSize: 10 }}>A✕</span>
      </Btn>

      <Sep />

      {/* Listes */}
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Liste à puces">•≡</Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Liste numérotée">1≡</Btn>

      <Sep />

      {/* Alignement */}
      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Gauche">⬛</Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Centre">⊟</Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Droite">⬜</Btn>

      <Sep />

      {/* Lien */}
      <Btn onClick={handleLink} isActive={editor.isActive('link')} title={editor.isActive('link') ? 'Retirer le lien' : 'Insérer un lien'}>
        🔗
      </Btn>

      <Sep />

      {/* Image — 2 options */}
      <Btn onClick={() => fileInputRef.current?.click()} title="Insérer une image (depuis mon ordinateur)">
        📁
      </Btn>
      <Btn onClick={handleImageUrl} title="Insérer une image (depuis une URL)">
        🖼
      </Btn>

      <Sep />
      { /* Embed asset Contentful */ }
      {onEmbedAsset && (
        <Btn
          onClick={onEmbedAsset}
          title="Insérer un asset Contentful (image, PDF...)"
        >
          + Embed
        </Btn>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      <Sep />

      {/* Citation + HR */}
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Citation">`</Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ligne de séparation">—</Btn>

      <Sep />

      {/* Annuler / Rétablir */}
      <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Annuler (Ctrl+Z)">↩</Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rétablir (Ctrl+Y)">↪</Btn>
    </div>
  )
}
