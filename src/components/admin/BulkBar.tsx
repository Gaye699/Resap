'use client'

type Props = {
  count: number
  onDelete: () => void
  onPublish?: () => void
  onClear: () => void
  isProcessing: boolean
}

export function BulkBar({ count, onDelete, onPublish, onClear, isProcessing }: Props) {
  if (count === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#0f172a',
        color: 'white',
        borderRadius: 12,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        zIndex: 200,
        fontSize: 13,
        whiteSpace: 'nowrap',
      }}
    >
      {/* Compteur */}
      <span style={{
        background: '#3b82f6',
        borderRadius: 20,
        padding: '2px 10px',
        fontWeight: 600,
        fontSize: 12,
      }}
      >
        {count} sélectionné{count > 1 ? 's' : ''}
      </span>

      {/* Bouton publier */}
      {onPublish && (
        <button
          type="button"
          onClick={onPublish}
          disabled={isProcessing}
          style={{
            background: '#16a34a',
            border: 'none',
            color: 'white',
            borderRadius: 7,
            padding: '6px 14px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {isProcessing ? '...' : '✓ Publier'}
        </button>
      )}

      {/* Bouton supprimer */}
      <button
        type="button"
        onClick={onDelete}
        disabled={isProcessing}
        style={{
          background: '#dc2626',
          border: 'none',
          color: 'white',
          borderRadius: 7,
          padding: '6px 14px',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {isProcessing ? 'Suppression...' : '🗑 Supprimer'}
      </button>

      {/* Désélectionner tout */}
      <button
        type="button"
        onClick={onClear}
        style={{
          background: 'none',
          border: '1px solid #334155',
          color: '#94a3b8',
          borderRadius: 7,
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        Annuler
      </button>
    </div>
  )
}
