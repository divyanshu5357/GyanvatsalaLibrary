import React, { useState } from 'react'
import EbookCard from './EbookCard'

function FolderNode({ node, depth = 0, onRead, onEdit, onDelete, showActions = false }) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = Boolean(node.children?.length)
  const hasEbooks = Boolean(node.ebooks?.length)
  const totalCount = node.count || (node.ebooks?.length || 0)
  const folderIcon = expanded ? '📂' : '📁'

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l border-slate-700/70 pl-4' : ''} space-y-3`}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={`w-full text-left rounded-2xl border transition ${
          depth === 0
            ? 'bg-slate-900/50 border-slate-700/80 px-4 py-4 hover:border-indigo-400/50'
            : 'bg-slate-900/35 border-slate-700/60 px-3 py-3 hover:border-slate-500/70'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <span className="text-xl shrink-0">{folderIcon}</span>
            <div className="min-w-0">
              <p className="font-semibold truncate">{node.label}</p>
              {node.description && (
                <p className="text-xs text-slate-400 truncate mt-0.5">{node.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-1 rounded-full text-xs bg-indigo-500/15 border border-indigo-400/30 text-indigo-100">
              {totalCount} item{totalCount === 1 ? '' : 's'}
            </span>
            <span className={`text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`}>›</span>
          </div>
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-4 pb-1">
          {hasChildren && node.children.map((child) => (
            <FolderNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onRead={onRead}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
            />
          ))}

          {hasEbooks && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {node.ebooks.map((ebook, index) => (
                <EbookCard
                  key={ebook.id}
                  ebook={ebook}
                  onRead={onRead}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  showActions={showActions}
                  animationDelay={index * 40}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EbookFolderBrowser({
  tree = [],
  onRead,
  onEdit,
  onDelete,
  showActions = false,
}) {
  if (!tree.length) {
    return null
  }

  return (
    <div className="space-y-4">
      {tree.map((node) => (
        <FolderNode
          key={node.id}
          node={node}
          onRead={onRead}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  )
}
