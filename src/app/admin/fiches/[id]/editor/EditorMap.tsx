'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix le bug des icônes Leaflet qui ne s'affichent pas en Next.js
const fixLeafletIcons = () => {
  // eslint-disable-next-line no-underscore-dangle
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

type Structure = {
  id: string
  nom: string
  adresse: string
  type: string
  tel?: string
  email?: string
  latLon?: { lat: number; lon: number }
}

export default function EditorMap({ structures }: { structures: Structure[] }) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  // Filtre les structures avec des coordonnées valides
  const structuresAvecCoords = structures.filter(
    (s) => s.latLon && s.latLon.lat !== 0 && s.latLon.lon !== 0,
  )

  // Centre de la carte sur Auvergne-Rhône-Alpes
  const center: [number, number] = [45.5, 4.5]

  return (
    <div className="flex gap-4 flex-wrap lg:flex-nowrap">
      {/* Carte */}
      <div className="w-full lg:w-7/12 rounded-xl overflow-hidden border border-gray-200" style={{ height: 400 }}>
        <MapContainer
          center={center}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {structuresAvecCoords.map((s) => (
            <Marker
              key={s.id}
              position={[s.latLon!.lat, s.latLon!.lon]}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{s.nom}</p>
                  <p className="text-gray-500 text-xs">{s.type}</p>
                  <p className="text-xs mt-1">{s.adresse}</p>
                  {s.tel && <p className="text-xs">📞 {s.tel}</p>}
                  {s.email && <p className="text-xs">✉️ {s.email}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Liste des structures — identique au vrai site */}
      <div className="w-full lg:w-5/12 overflow-y-auto" style={{ maxHeight: 400 }}>
        {structures.map((s) => (
          <div key={s.id} className="pb-4 mb-4 border-b border-gray-100 last:border-0">
            <p className="font-semibold text-gray-800 text-sm">{s.nom}</p>
            <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mt-1">
              {s.type}
            </span>
            {s.adresse && (
              <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                <span>📍</span> {s.adresse}
              </p>
            )}
            {s.tel && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>📞</span> {s.tel}
              </p>
            )}
            {s.email && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>✉️</span> {s.email}
              </p>
            )}
          </div>
        ))}
        {structures.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-8">
            Sélectionnez des types de dispositif pour voir les structures associées.
          </p>
        )}
      </div>
    </div>
  )
}
