import Link from 'next/link'
import { listStructures, listFiches, listLiens } from '@/services/contentful-management'

// Composant carte statistique — réutilisé 3 fois
function StatCard({
  href,
  emoji,
  titre,
  total,
  draft,
  draftLabel = 'brouillon(s)',
  draftDanger = false,
}: {
  href: string
  emoji: string
  titre: string
  total: number
  draft: number
  draftLabel?: string
  draftDanger?: boolean
}) {
  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <p className="text-sm font-medium text-gray-500 mb-1">{titre}</p>
      <p className="text-4xl font-bold text-gray-900">{total}</p>
      {draft > 0 && (
        <p className={`text-xs mt-2 ${draftDanger ? 'text-red-600' : 'text-yellow-600'}`}>
          {draft} {draftLabel}
        </p>
      )}
    </Link>
  )
}

export default async function AdminDashboard() {
  // On récupère tout en parallèle pour aller plus vite
  // Promise.all = lance les 3 requêtes en même temps au lieu d'attendre l'une après l'autre
  const [structures, fiches, liens] = await Promise.all([
    listStructures(),
    listFiches(),
    listLiens(),
  ])

  // Calcul des stats
  const stats = {
    structures: structures.length,
    structuresDraft: structures.filter((s) => s.statut === 'draft').length,
    fiches: fiches.length,
    fichesDraft: fiches.filter((f) => f.statut === 'draft').length,
    liens: liens.length,
    liensVides: liens.filter((l) => l.estVide).length,
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Environnement Contentful :{' '}
          <span className="font-medium text-blue-600">
            {process.env.CONTENTFUL_ENVIRONMENT ?? 'master'}
          </span>
          {process.env.CONTENTFUL_ENVIRONMENT === 'dev' && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              Mode dev — les changements n&apos;affectent pas le site en ligne
            </span>
          )}
        </p>
      </div>

      {/* Alerte liens vides */}
      {stats.liensVides > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <div>
            <p className="font-medium text-red-700">
              {stats.liensVides} lien(s) en brouillon sans contenu
            </p>
            <p className="text-sm text-red-600 mt-0.5">
              Ces liens ne peuvent pas être publiés. Allez dans{' '}
              <Link href="/admin/liens" className="underline">Liens</Link> pour les corriger.
            </p>
          </div>
        </div>
      )}

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          href="/admin/structures"
          emoji="🏥"
          titre="Structures"
          total={stats.structures}
          draft={stats.structuresDraft}
        />
        <StatCard
          href="/admin/fiches"
          emoji="📄"
          titre="Fiches pratiques"
          total={stats.fiches}
          draft={stats.fichesDraft}
        />
        <StatCard
          href="/admin/liens"
          emoji="🔗"
          titre="Liens"
          total={stats.liens}
          draft={stats.liensVides}
          draftLabel="vide(s)"
          draftDanger={stats.liensVides > 0}
        />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic' // On force le rendu dynamique pour toujours avoir les données à jour, même en dev (pas de cache)
