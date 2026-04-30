'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { AssetPicker } from '../AssetPicker'
import { setFicheIllustration } from '@/services/contentful-management'

type Props = {
  ficheId: string
  value: string
  onChange: (url: string, assetId: string) => void
}

export function IllustrationField({ ficheId, value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)

    const handleSelect = async (asset: {
      id: string; titre: string; url: string; contentType: string; fileName: string
    }) => {
      setSaving(true)
      try {
        await setFicheIllustration(ficheId, asset.id)
        onChange(asset.url, asset.id)
        toast.success('Illustration mise à jour.')
      } catch {
        toast.error('Erreur lors de la mise à jour de l\'illustration.')
      } finally {
        setSaving(false)
        setShowPicker(false)
      }
    }

  return (
    <div>
      {/* Aperçu actuel */}
      {value ? (
        <div className="relative mb-3">
          <img
            src={value}
            alt="Illustration actuelle"
            className="w-full rounded-lg border border-gray-100 object-cover"
            style={{ maxHeight: 160 }}
          />
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-black/70"
            >
              Changer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl
            flex flex-col items-center justify-center gap-2 hover:border-blue-300
            hover:bg-blue-50 transition-colors mb-3"
        >
          <span className="text-3xl">🖼</span>
          <span className="text-xs text-gray-400">Choisir une illustration</span>
        </button>
      )}

      {value && (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          disabled={saving}
          className="w-full text-xs py-2 border border-gray-200 rounded-lg
            text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {saving ? '⏳ Mise à jour...' : '🖼 Changer l\'illustration'}
        </button>
      )}

      {showPicker && (
        <AssetPicker
          mode="illustration"
          currentAssetUrl={value}
          onSelect={handleSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
