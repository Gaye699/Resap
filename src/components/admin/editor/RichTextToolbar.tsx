'use client'

import { Editor } from '@tiptap/react'

type Props = {
  editor: Editor | null
}

type ToolbarButtonProps = {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
  disabled?: boolean
}

function ToolbarButton({ onClick, isActive, title, children, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // onMouseDown + preventDefault évite que le champ perde le focus
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: 4,
        border: 'none',
        background: isActive ? '#dbeafe' : 'transparent',
        color: isActive ? '#1d4ed8' : '#374151',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: isActive ? 600 : 400,
        transition: 'background 0.1s',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isActive && !disabled) e.currentTarget.style.background = '#f3f4f6'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px' }} />
}

export function RichTextToolbar({ editor }: Props) {
  if (!editor) return null

  const addImage = () => {
    const url = window.prompt('URL de l\'image :')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    const url = window.prompt('URL du lien :')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '6px 8px',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px 8px 0 0',
        borderBottom: 'none',
        flexWrap: 'wrap',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Titres */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Titre 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Titre 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Titre 3"
      >
        H3
      </ToolbarButton>

      <Divider />

      {/* Formatage texte */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Gras (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italique (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Souligné (Ctrl+U)"
      >
        <span style={{ textDecoration: 'underline' }}>U</span>
      </ToolbarButton>

      <Divider />

      {/* Listes */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Liste à puces"
      >
        ≡
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Liste numérotée"
      >
        1≡
      </ToolbarButton>

      <Divider />

      {/* Alignement */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Aligner à gauche"
      >
        ⬛◻◻
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Centrer"
      >
        ◻⬛◻
      </ToolbarButton>

      <Divider />

      {/* Lien */}
      <ToolbarButton
        onClick={addLink}
        isActive={editor.isActive('link')}
        title="Insérer un lien"
      >
        🔗
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        title="Retirer le lien"
      >
        🚫
      </ToolbarButton>

      <Divider />

      {/* Image */}
      <ToolbarButton
        onClick={addImage}
        title="Insérer une image (URL)"
      >
        🖼
      </ToolbarButton>

      <Divider />

      {/* Quote + HR */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Citation"
      >
        &quot;
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Séparateur horizontal"
      >
        —
      </ToolbarButton>

      <Divider />

      {/* Annuler / Rétablir */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Annuler (Ctrl+Z)"
      >
        ↩
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Rétablir (Ctrl+Y)"
      >
        ↪
      </ToolbarButton>
    </div>
  )
}
