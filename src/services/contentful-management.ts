'use server'

import { createClient } from 'contentful-management'
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown'

const { CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN } = process.env

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN) {
  throw new Error('CONTENTFUL env vars needed (SPACE_ID, MANAGEMENT_API_ACCESS_TOKEN).')
}

export type CreateStructureData = {
  nom: string
  organisation: string
  type: string
  description: string
  specialites?: string[]
  adresse: string
  siteWeb: string
  email: string
  tel: string
}

const findCoordinates = async (address: string): Promise<{ lat: number, lon: number }> => {
  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://data.geopf.fr/geocodage/search?index=address&q=${encodedAddress}&limit=1`,
    )

    if (!response.ok) {
      throw new Error('Erreur lors du géocodage')
    }

    const data = await response.json()

    if (!data || !data.features?.length) {
      return { lat: 0, lon: 0 }
    }

    return {
      lat: parseFloat(data.features[0].geometry.coordinates[1]),
      lon: parseFloat(data.features[0].geometry.coordinates[0]),
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors du géocodage:', error)
    return { lat: 0, lon: 0 }
  }
}

export const createStructureInContentful = async (data: CreateStructureData): Promise<{ id: string, url: string }> => {
  const client = createClient({
    accessToken: CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN,
  })

  const space = await client.getSpace(CONTENTFUL_SPACE_ID)
  const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT ?? 'master')
  const { lat, lon } = await findCoordinates(data.adresse)

  const structureEntry = await environment.createEntry('structure', {
    fields: {
      nom: {
        fr: data.nom,
      },
      organisation: data.organisation ? {
        fr: data.organisation,
      } : undefined,
      specialites: data.specialites?.length ? {
        fr: data.specialites,
      } : undefined,
      description: data.description ? {
        fr: await richTextFromMarkdown(data.description),
      } : undefined,
      type: {
        fr: data.type,
      },

      adresse: {
        fr: data.adresse,
      },
      siteWeb: data.siteWeb ? {
        fr: data.siteWeb,
      } : undefined,
      email: data.email ? {
        fr: data.email,
      } : undefined,
      tel: data.tel ? {
        fr: data.tel,
      } : undefined,
      latLon: {
        fr: {
          lat,
          lon,
        },
      },
    },
  })

  const contentfulUrl = `https://app.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries/${structureEntry.sys.id}`

  return {
    id: structureEntry.sys.id,
    url: contentfulUrl,
  }
}

const getEnvironment = async () => {
  const client = createClient({
    accessToken: CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN,
  })
  const space = await client.getSpace(CONTENTFUL_SPACE_ID)
  return space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT ?? 'master')
}

// ─── STRUCTURES ────────────────────────────────────────────────────────────

// Retourne toutes les structures (publiées ET brouillons)
export const listStructures = async () => {
  const environment = await getEnvironment()
  const limit = 1000
  let skip = 0
  let allItems: any[] = []
  let total = 0

  do {
    // eslint-disable-next-line no-await-in-loop
    const response = await environment.getEntries({
      content_type: 'structure',
      limit,
      skip,
    })

    allItems = [...allItems, ...response.items]
    total = response.total
    skip += limit
  } while (skip < total)

  return allItems.map((entry) => ({
    id: entry.sys.id,
    nom: (entry.fields.nom as { fr: string })?.fr ?? '',
    organisation: (entry.fields.organisation as { fr: string } | undefined)?.fr ?? '',
    type: (entry.fields.type as { fr: string })?.fr ?? '',
    adresse: (entry.fields.adresse as { fr: string })?.fr ?? '',
    email: (entry.fields.email as { fr: string } | undefined)?.fr ?? '',
    tel: (entry.fields.tel as { fr: string } | undefined)?.fr ?? '',
    siteWeb: (entry.fields.siteWeb as { fr: string } | undefined)?.fr ?? '',
    description: (entry.fields.description as { fr: string } | undefined)?.fr ?? '',
    statut: entry.sys.publishedAt ? 'published' : 'draft' as const,
    updatedAt: entry.sys.updatedAt,
    contentfulUrl: `https://app.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT ?? 'master'}/entries/${entry.sys.id}`,
  }))
}

// Retourne une seule structure par son id (pour pré-remplir le formulaire d'édition)
export const getStructureById = async (id: string) => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)

  // Extrait le texte brut du rich text description
  const extractText = (doc: any): string => {
    if (!doc?.content) return ''
    const extract = (nodes: any[]): string =>
      nodes.flatMap((n: any) => {
        if (n.nodeType === 'text') return [n.value ?? '']
        if (n.content) return extract(n.content)
        return []
      }).join('\n')
    return extract(doc.content)
  }

  return {
    id: entry.sys.id,
    nom: (entry.fields.nom as { fr: string })?.fr ?? '',
    organisation: (entry.fields.organisation as { fr: string } | undefined)?.fr ?? '',
    type: (entry.fields.type as { fr: string })?.fr ?? '',
    adresse: (entry.fields.adresse as { fr: string })?.fr ?? '',
    email: (entry.fields.email as { fr: string } | undefined)?.fr ?? '',
    tel: (entry.fields.tel as { fr: string } | undefined)?.fr ?? '',
    siteWeb: (entry.fields.siteWeb as { fr: string } | undefined)?.fr ?? '',
    description: extractText((entry.fields.description as { fr: any } | undefined)?.fr),
    specialites: (entry.fields.specialites as { fr: string[] } | undefined)?.fr ?? [],
    statut: entry.sys.publishedAt ? 'published' : 'draft' as const,
  }
}

// Met à jour une structure existante → sauvegarde en BROUILLON
export const updateStructureInContentful = async (
  id: string,
  data: Partial<CreateStructureData>,
): Promise<void> => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)

  if (data.nom !== undefined) entry.fields.nom = { fr: data.nom }
  if (data.organisation !== undefined) {
    entry.fields.organisation = data.organisation ? { fr: data.organisation } : undefined
  }
  if (data.type !== undefined) entry.fields.type = { fr: data.type }
  if (data.specialites !== undefined) {
    entry.fields.specialites = { fr: data.specialites }
  }
  if (data.siteWeb !== undefined) entry.fields.siteWeb = data.siteWeb ? { fr: data.siteWeb } : undefined
  if (data.email !== undefined) entry.fields.email = data.email ? { fr: data.email } : undefined
  if (data.tel !== undefined) entry.fields.tel = data.tel ? { fr: data.tel } : undefined

  // Description = rich text
  if (data.description !== undefined) {
    entry.fields.description = data.description
      ? { fr: await richTextFromMarkdown(data.description) }
      : undefined
  }

  // Adresse : une seule saisie → remplit les 2 champs Contentful
  if (data.adresse !== undefined) {
    entry.fields.adresse = { fr: data.adresse }
    const { lat, lon } = await findCoordinates(data.adresse)
    entry.fields.latLon = { fr: { lat, lon } }
  }

  await entry.update()
}

// Publie une structure → visible sur le site public
export const publishStructure = async (id: string): Promise<void> => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)
  await entry.publish()
}

// Dépublie une structure → repasse en brouillon
export const unpublishStructure = async (id: string): Promise<void> => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)
  await entry.unpublish()
}

// ─── LIENS

export type CreateLienData = {
  titre: string
  url?: string
}

export const listLiens = async () => {
  const environment = await getEnvironment()

  const entries = await environment.getEntries({
    content_type: 'lien',
    limit: 1000,
  })

  return entries.items.map((entry) => ({
    id: entry.sys.id,
    titre: (entry.fields.titre as { fr: string })?.fr ?? '',
    url: (entry.fields.url as { fr: string } | undefined)?.fr,
    hasFichier: !!entry.fields.fichier,
    statut: entry.sys.publishedAt ? 'published' : 'draft' as const,
    updatedAt: entry.sys.updatedAt,
    // estVide = true si ni url ni fichier → c'est le bug à corriger
    estVide: !entry.fields.url && !entry.fields.fichier,
  }))
}

export const getLienById = async (id: string) => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)

  return {
    id: entry.sys.id,
    titre: (entry.fields.titre as { fr: string })?.fr ?? '',
    url: (entry.fields.url as { fr: string } | undefined)?.fr ?? '',
    hasFichier: !!entry.fields.fichier,
    statut: entry.sys.publishedAt ? 'published' : 'draft' as const,
    estVide: !entry.fields.url && !entry.fields.fichier,
  }
}

export const createLienInContentful = async (data: CreateLienData) => {
  const environment = await getEnvironment()

  const entry = await environment.createEntry('lien', {
    fields: {
      titre: { fr: data.titre },
      ...(data.url ? { url: { fr: data.url } } : {}),
    },
  })

  return { id: entry.sys.id }
}

export const updateLienInContentful = async (
  id: string,
  data: Partial<CreateLienData>,
): Promise<void> => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)

  if (data.titre !== undefined) entry.fields.titre = { fr: data.titre }
  if (data.url !== undefined) {
    entry.fields.url = { fr: data.url }
    // Si on met une URL, on retire le fichier (choix exclusif)
    delete entry.fields.fichier
  }

  await entry.update()
}

export const publishLien = async (id: string): Promise<void> => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)

  // Vérification : on refuse de publier un lien vide
  const hasUrl = !!(entry.fields.url as { fr: string } | undefined)?.fr
  const hasFichier = !!entry.fields.fichier

  if (!hasUrl && !hasFichier) {
    throw new Error('Impossible de publier un lien sans URL ni fichier.')
  }

  await entry.publish()
}

// ─── FICHES ────────────────────────────────────────────────────────────────

export const listFiches = async () => {
  const environment = await getEnvironment()
  const entries = await environment.getEntries({
    content_type: 'fiche',
    limit: 1000,
  })

  return entries.items.map((entry) => {
    // Récupère l'URL de l'illustration si elle existe
    const illustrationAsset = entry.fields.illustration as { fr: { fields: { file: { fr: { url: string } } } } } | undefined
    const rawUrl = illustrationAsset?.fr?.fields?.file?.fr?.url
    // Contentful renvoie des URLs sans protocole (//images.ctfassets.net/...)
    const illustrationUrl = rawUrl ? `https:${rawUrl}` : undefined

    return {
      id: entry.sys.id,
      titre: (entry.fields.titre as { fr: string })?.fr ?? '',
      slug: (entry.fields.slug as { fr: string })?.fr ?? '',
      categorie: (entry.fields.categorie as { fr: string })?.fr ?? '',
      tags: (entry.fields.tags as { fr: string[] } | undefined)?.fr ?? [],
      illustrationUrl,
      statut: entry.sys.publishedAt ? 'published' : 'draft' as const,
      updatedAt: entry.sys.updatedAt,
      contentfulUrl: `https://app.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENVIRONMENT ?? 'master'}/entries/${entry.sys.id}`,
    }
  })
}

export const getFicheById = async (id: string) => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)

  // Pour les champs rich text, on récupère juste le texte brut pour l'édition
  // Le rendu HTML est géré par le site public, pas l'admin
  const extractPlainText = (richTextDoc: any): string => {
    if (!richTextDoc?.content) return ''
    return richTextDoc.content
      .flatMap((node: any) => node.content ?? [])
      .filter((n: any) => n.nodeType === 'text')
      .map((n: any) => n.value)
      .join('\n')
  }

  return {
    id: entry.sys.id,
    titre: (entry.fields.titre as { fr: string })?.fr ?? '',
    slug: (entry.fields.slug as { fr: string })?.fr ?? '',
    categorie: (entry.fields.categorie as { fr: string })?.fr ?? '',
    tags: (entry.fields.tags as { fr: string[] } | undefined)?.fr ?? [],
    description: (entry.fields.description as { fr: string } | undefined)?.fr ?? '',
    resume: extractPlainText((entry.fields.resume as { fr: any } | undefined)?.fr),
    contenu: extractPlainText((entry.fields.contenu as { fr: any } | undefined)?.fr),
    typeDispositif: (entry.fields.typeDispositif as { fr: string[] } | undefined)?.fr ?? [],
    illustrationId: (entry.fields.illustration as { fr: { sys: { id: string } } } | undefined)?.fr?.sys?.id,
    statut: entry.sys.publishedAt ? 'published' : 'draft' as const,
  }
}

export type UpdateFicheData = {
  titre?: string
  categorie?: string
  tags?: string[]
  description?: string
  resume?: string
  contenu?: string
  typeDispositif?: string[]
  // illustration gérée séparément (upload d'asset)
}

// Crée une nouvelle fiche dans Contentful
export type CreateFicheData = {
  titre: string
  slug: string
  categorie: string
  tags: string[]
  description: string
  resume: string
  contenu: string
  typeDispositif: string[]
}

export const createFicheInContentful = async (data: CreateFicheData) => {
  const environment = await getEnvironment()

  const entry = await environment.createEntry('fiche', {
    fields: {
      titre: { fr: data.titre },
      slug: { fr: data.slug },
      categorie: { fr: data.categorie },
      tags: { fr: data.tags },
      description: { fr: data.description },
      typeDispositif: { fr: data.typeDispositif },
      resume: { fr: await richTextFromMarkdown(data.resume || '_À rédiger_') },
      contenu: { fr: await richTextFromMarkdown(data.contenu || '_À rédiger_') },
    },
  })

  return { id: entry.sys.id }
}

export const updateFicheInContentful = async (
  id: string,
  data: UpdateFicheData,
): Promise<void> => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)

  if (data.titre !== undefined) entry.fields.titre = { fr: data.titre }
  if (data.categorie !== undefined) entry.fields.categorie = { fr: data.categorie }
  if (data.tags !== undefined) entry.fields.tags = { fr: data.tags }
  if (data.description !== undefined) entry.fields.description = { fr: data.description }
  if (data.typeDispositif !== undefined) entry.fields.typeDispositif = { fr: data.typeDispositif }

  // Conversion Markdown → Rich Text Contentful
  if (data.resume !== undefined) {
    entry.fields.resume = { fr: await richTextFromMarkdown(data.resume) }
  }
  if (data.contenu !== undefined) {
    entry.fields.contenu = { fr: await richTextFromMarkdown(data.contenu) }
  }

  await entry.update()
}

export const publishFiche = async (id: string): Promise<void> => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)
  await entry.publish()
}

// ─── SUPPRESSION (communes aux 3 entités) ──────────────────────────────────

// Supprime définitivement une entrée.
// Si elle est publiée, il faut d'abord la dépublier avant de supprimer.
const deleteEntry = async (id: string): Promise<void> => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(id)

  // Si publiée → dépublier d'abord, sinon Contentful refuse la suppression
  if (entry.sys.publishedAt) {
    await entry.unpublish()
  }

  await entry.delete()
}

export const deleteStructure = deleteEntry
export const deleteLien = deleteEntry
export const deleteFiche = deleteEntry

// Récupère les structures filtrées par types de dispositif
// Utilisé dans l'éditeur pour afficher la carte avec les vraies données
export const getStructuresByTypes = async (types: string[]) => {
  if (!types || types.length === 0) return []

  const environment = await getEnvironment()

  const entries = await environment.getEntries({
    content_type: 'structure',
    // Filtre par type — équivalent de 'fields.type[in]' dans Delivery API
    'fields.type[in]': types.join(','),
    limit: 500,
  })

  return entries.items.map((entry) => ({
    id: entry.sys.id,
    nom: (entry.fields.nom as { fr: string })?.fr ?? '',
    adresse: (entry.fields.adresse as { fr: string })?.fr ?? '',
    type: (entry.fields.type as { fr: string })?.fr ?? '',
    email: (entry.fields.email as { fr: string } | undefined)?.fr,
    tel: (entry.fields.tel as { fr: string } | undefined)?.fr,
    latLon: (entry.fields.latLon as { fr: { lat: number; lon: number } } | undefined)?.fr,
  }))
}

// ─── ASSETS (illustrations, PDFs) ─────────────────────────────────────────

// Upload un fichier local comme Asset Contentful
// Retourne l'id de l'asset créé
export const uploadAssetToContentful = async (
  file: File,
  titre: string,
): Promise<{ id: string; url: string }> => {
  const environment = await getEnvironment()

  // 1. Crée l'asset avec les métadonnées
  const asset = await environment.createAsset({
    fields: {
      title: { fr: titre },
      file: {
        fr: {
          contentType: file.type,
          fileName: file.name,
          // Contentful attend un upload via une URL signée
          // On utilise l'API de upload d'abord
          upload: await uploadFileToContentful(environment, file),
        },
      },
    },
  })

  // 2. Traite l'asset (génère les variantes d'images)
  const processed = await asset.processForAllLocales()

  // 3. Publie l'asset pour qu'il soit accessible
  const published = await processed.publish()

  const url = published.fields.file?.fr?.url
  const finalUrl = url ? `https:${url}` : ''

  return { id: published.sys.id, url: finalUrl }
}

// Fonction interne : upload les bytes du fichier
async function uploadFileToContentful(environment: any, file: File): Promise<string> {
  const buffer = await file.arrayBuffer()

  const upload = await environment.createUpload({
    file: Buffer.from(buffer),
    contentType: file.type,
  })

  return upload.sys.id
}

// Liste tous les assets existants (pour le picker d'assets dans l'éditeur)
export const listAssets = async (search?: string) => {
  const environment = await getEnvironment()

  const query: Record<string, any> = { limit: 100 }
  if (search) query['fields.title[match]'] = search

  const assets = await environment.getAssets(query)

  return assets.items.map((asset: any) => ({
    id: asset.sys.id,
    titre: asset.fields.title?.fr ?? '',
    url: asset.fields.file?.fr?.url ? `https:${asset.fields.file.fr.url}` : '',
    contentType: asset.fields.file?.fr?.contentType ?? '',
    fileName: asset.fields.file?.fr?.fileName ?? '',
  }))
}

// Met à jour l'illustration d'une fiche (lien vers un asset existant)
export const setFicheIllustration = async (
  ficheId: string,
  assetId: string,
): Promise<void> => {
  const environment = await getEnvironment()
  const entry = await environment.getEntry(ficheId)

  entry.fields.illustration = {
    fr: {
      sys: {
        type: 'Link',
        linkType: 'Asset',
        id: assetId,
      },
    },
  }

  await entry.update()
}
