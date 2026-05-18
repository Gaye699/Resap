'use client'

type Props = {
  snapshot: Record<string, any>
  current: Record<string, any>
  onClose: () => void
}

export function DiffViewer({ snapshot, current, onClose }: Props) {
  const fields = ['titre', 'resume', 'categorie', 'tags', 'typeDispositif']
  const changes = fields.filter(k => JSON.stringify(snapshot[k]) !== JSON.stringify(current[k]))

  if (changes.length === 0) return null

  const strip = (v: any) => Array.isArray(v)
    ? v.join(', ')
    : String(v ?? '').replace(/<[^>]+>/g, '').trim()

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 flex items-end justify-center p-4 sm:items-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">
            ✅ Sauvegardé — {changes.length} modification{changes.length > 1 ? 's' : ''}
          </p>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <div className="divide-y divide-gray-50">
          {changes.map(k => (
            <div key={k} className="px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{k}</p>
              <div className="grid grid-cols-2 gap-3">

                {/* AVANT */}
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                  <p className="text-[9px] font-bold text-red-400 uppercase mb-1">Avant</p>
                  <p className="text-xs text-red-700 line-through leading-relaxed">
                    {strip(snapshot[k]) || <span className="not-italic text-red-300 no-underline">Vide</span>}
                  </p>
                </div>

                {/* APRÈS */}
                <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">
                  <p className="text-[9px] font-bold text-green-500 uppercase mb-1">Après</p>
                  <p className="text-xs text-green-800 font-medium leading-relaxed">
                    {strip(current[k]) || <span className="font-normal text-green-400">Vide</span>}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Si l'illustration a changé — affiche les deux images */}
        {snapshot.illustrationUrl !== current.illustrationUrl && (
          <div className="px-5 py-3 border-t border-gray-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Illustration</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-red-100 overflow-hidden">
                <p className="text-[9px] font-bold text-red-400 uppercase px-2 pt-1.5 pb-1">Avant</p>
                {snapshot.illustrationUrl
                  ? <img src={snapshot.illustrationUrl} className="w-full h-20 object-cover opacity-60" alt="avant" />
                  : <div className="h-20 flex items-center justify-center text-gray-300 text-xs">Aucune</div>
                }
              </div>
              <div className="rounded-lg border border-green-100 overflow-hidden">
                <p className="text-[9px] font-bold text-green-500 uppercase px-2 pt-1.5 pb-1">Après</p>
                {current.illustrationUrl
                  ? <img src={current.illustrationUrl} className="w-full h-20 object-cover" alt="après" />
                  : <div className="h-20 flex items-center justify-center text-gray-300 text-xs">Aucune</div>
                }
              </div>
            </div>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
