'use client'

import { Editor } from '@tiptap/react'

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
      className={`
        inline-flex items-center justify-center w-7 h-7 rounded text-[13px]
        transition-all border
        ${isActive
          ? 'bg-blue-100 text-blue-700 border-blue-200 font-semibold'
          : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:border-gray-200'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />
}

export function RichTextToolbar({ editor, onEmbedAsset }: Props) {
  if (!editor) return null

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
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white border-b border-gray-200 flex-wrap">
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
      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Gauche">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="7" height="18" rx="2" ry="2"/>
          <rect x="14" y="6" width="7" height="12" rx="2" ry="2"/>
        </svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Centre">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        </svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Droite">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="14" y="3" width="7" height="18" rx="2" ry="2"/>
          <rect x="3" y="6" width="7" height="12" rx="2" ry="2"/>
        </svg>
      </Btn>

      <Sep />

      {/* Lien */}
      <Btn onClick={handleLink} isActive={editor.isActive('link')} title={editor.isActive('link') ? 'Retirer le lien' : 'Insérer un lien'}>
        🔗
      </Btn>

      <Sep />

      <Sep />
      { /* Embed asset Contentful */ }
      {onEmbedAsset && (
        <Btn
          onClick={onEmbedAsset}
          title="Insérer un asset Contentful (image, PDF...)"
        >
          + Integrer
        </Btn>
      )}

      <Sep />

      {/* Citation + HR */}
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Citation">`</Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ligne de séparation">—</Btn>

      <Sep />
    </div>
  )
}
