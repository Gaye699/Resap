'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useEditor } from '@/components/admin/editor/EditorContext'
import { EditorToolbar } from '@/components/admin/editor/EditorToolbar'
import { InspectorPanel } from '@/components/admin/editor/InspectorPanel'
import { FicheEditorView } from './FicheEditorView'

const PANEL_MIN = 300
const PANEL_MAX = 800
const PANEL_DEFAULT = 380

export function EditorLayout({ titre, backHref }: { titre: string; backHref: string }) {
  const { selectedField } = useEditor()
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT)
  const [isExpanded, setIsExpanded] = useState(false)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  // Expand automatique pour richtext
  useEffect(() => {
    if (selectedField?.type === 'richtext') {
      setIsExpanded(true)
      setPanelWidth(Math.min(PANEL_MAX, window.innerWidth * 0.55))
    } else {
      setIsExpanded(false)
      setPanelWidth(PANEL_DEFAULT)
    }
  }, [selectedField?.type])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    startX.current = e.clientX
    startW.current = panelWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [panelWidth])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const delta = startX.current - e.clientX
      const next = Math.min(PANEL_MAX, Math.max(PANEL_MIN, startW.current + delta))
      setPanelWidth(next)
    }
    const onUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <EditorToolbar titre={titre} backHref={backHref} />

      <div className="flex flex-1 overflow-hidden">

        {/* Preview — réduit si panneau élargi */}
        <div
          className="min-h-0 flex-1 overflow-y-auto bg-white transition-all duration-200"
          style={{
            minWidth: isExpanded ? 280 : undefined,
          }}
        >
          {/* Aperçu format téléphone si panneau très large */}
          {isExpanded && panelWidth > 560 ? (
            <div className="flex justify-center py-6 bg-gray-100 min-h-full">
              <div
                className="bg-white rounded-2xl shadow-xl overflow-y-auto border border-gray-200"
                style={{ width: 375, maxHeight: '100%' }}
              >
                <FicheEditorView ficheId="" />
              </div>
            </div>
          ) : (
            <FicheEditorView ficheId="" />
          )}
        </div>

        {/* Poignée de redimensionnement */}
        <div
          onMouseDown={onMouseDown}
          className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-400 active:bg-blue-500 transition-colors flex-shrink-0 relative group"
          title="Glisser pour redimensionner"
        >
          {/* Points visuels au centre de la poignée */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {[0,1,2].map(i => (
                <div key={i} className="w-1 h-1 rounded-full bg-blue-500" />
              ))}
            </div>
          </div>
        </div>

        {/* Panneau inspector */}
        <div
          className="border-l border-gray-200 bg-white flex flex-col overflow-hidden flex-shrink-0"
          style={{ width: panelWidth }}
        >
          <InspectorPanel />
        </div>
      </div>
    </div>
  )
}
