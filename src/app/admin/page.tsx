import Link from 'next/link'
import { listStructures, listFiches } from '@/services/contentful-management'

export default async function AdminDashboard() {
  let structures: Awaited<ReturnType<typeof listStructures>> = []
  let fiches: Awaited<ReturnType<typeof listFiches>> = []

  try {
    [structures, fiches] = await Promise.all([listStructures(), listFiches()])
  } catch {
    // tokens pas encore configurés
  }

  const statStructures = structures.length
  const statFichesDraft = fiches.filter((f) => f.statut === 'draft').length
  const statFichesPublished = fiches.filter((f) => f.statut === 'published').length

  const cards = [
    {
      href: '/admin/structures',
      emoji: '🏥',
      label: 'Structures',
      value: statStructures,
      sub: 'dans l annuaire',
      color: '#eff6ff',
      border: '#bfdbfe',
    },
    {
      href: '/admin/fiches',
      emoji: '📄',
      label: 'Fiches publiées',
      value: statFichesPublished,
      sub: 'visibles sur le site',
      color: '#f0fdf4',
      border: '#bbf7d0',
    },
    {
      href: '/admin/fiches',
      emoji: '✏️',
      label: 'Fiches brouillon',
      value: statFichesDraft,
      sub: 'en attente de publication',
      color: '#fefce8',
      border: '#fde68a',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Environnement :{' '}
          <span
            className="font-semibold px-2 py-0.5 rounded-full text-xs"
            style={{
              background:
                process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT === 'master'
                  ? '#fee2e2'
                  : '#dcfce7',
              color:
                process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT === 'master'
                  ? '#b91c1c'
                  : '#15803d',
            }}
          >
            {process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'dev'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border p-6 flex flex-col gap-2
              hover:shadow-md transition-shadow"
            style={{ background: card.color, borderColor: card.border }}
          >
            <span className="text-3xl">{card.emoji}</span>
            <span className="text-4xl font-bold text-gray-900">{card.value}</span>
            <span className="text-sm font-semibold text-gray-700">{card.label}</span>
            <span className="text-xs text-gray-400">{card.sub}</span>
          </Link>
        ))}
      </div>

      {/* Accès rapide */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Accès rapide</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/fiches/nouveau"
            className="px-4 py-2 bg-blue-600 text-white text-sm
              font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nouvelle fiche
          </Link>
          <Link
            href="/admin/structures/nouveau"
            className="px-4 py-2 border border-gray-200 text-gray-700
              text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            + Nouvelle structure
          </Link>
          <a
            href="https://app.contentful.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-200 text-gray-500
              text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Ouvrir Contentful ↗
          </a>
        </div>
      </div>
    </div>
  )
}
