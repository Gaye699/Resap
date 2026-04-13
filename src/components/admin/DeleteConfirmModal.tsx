'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  nom: string
  onConfirm: () => Promise<void>
  className?: string
}

export function DeleteConfirmModal({ nom, onConfirm, className }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saisie, setSaisie] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const confirmationAttendue = 'SUPPRIMER'
  const peutSupprimer = saisie === confirmationAttendue

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleConfirm = async () => {
    if (!peutSupprimer) return

    setIsDeleting(true)

    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
      setSaisie('')
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setSaisie('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className ?? 'text-red-500 hover:text-red-700 text-sm font-medium'}
      >
        Supprimer
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer la fenetre de suppression"
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleClose()
              }
            }}
          />

          <div
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <span className="text-lg font-bold text-red-600">!</span>
              </div>
              <div>
                <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900">
                  Supprimer definitivement ?
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vous etes sur le point de supprimer{' '}
                  <strong className="text-gray-700">&quot;{nom}&quot;</strong>.
                  Cette action est <strong>irreversible</strong> et le contenu sera
                  efface de Contentful.
                </p>
              </div>
            </div>

            <div className="mb-5 rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-sm text-gray-600">
                Pour confirmer, tapez{' '}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs text-red-600">
                  SUPPRIMER
                </code>{' '}
                ci-dessous :
              </p>
              <input
                ref={inputRef}
                type="text"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!peutSupprimer || isDeleting}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                  peutSupprimer && !isDeleting
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400'
                }`}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer definitivement'}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
