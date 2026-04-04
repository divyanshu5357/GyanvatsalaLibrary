import React from 'react'
import { getEbookLocationLabel, getEbookPrimaryLabel, normalizeEbook } from '../../utils/ebooks'

const FALLBACK_THUMBNAIL = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=60'

export default function EbookCard({ ebook, onRead, onEdit, onDelete, showActions = false, animationDelay = 0 }) {
  const item = normalizeEbook(ebook)
  const primaryLabel = getEbookPrimaryLabel(item)
  const locationLabel = getEbookLocationLabel(item)

  return (
    <article
      className="card-hover glass rounded-2xl p-4 border border-slate-700/60 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10 transition animate-slideInUp"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="rounded-xl overflow-hidden bg-slate-800 mb-3 aspect-[16/10]">
        <img
          src={ebook.thumbnail_url || FALLBACK_THUMBNAIL}
          alt={ebook.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <div
            className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${
              item.category_type === 'school'
                ? 'bg-indigo-600/30 border-indigo-400/40 text-indigo-100'
                : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100'
            }`}
          >
            {item.category_type === 'school' ? 'School' : 'Other'}
          </div>

          <div className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-slate-800/80 border border-slate-600 text-slate-200">
            {item.category_type === 'school' ? `Class ${item.class}` : item.custom_category}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold line-clamp-1">{item.title}</h3>
          <p className="text-sm text-slate-300 line-clamp-1">{primaryLabel}</p>
          <p className="text-xs text-slate-500 line-clamp-2">{locationLabel}</p>
        </div>
      </div>

      {item.description && (
        <p className="text-xs text-slate-400 mt-3 line-clamp-2">{item.description}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onRead?.(item)}
          className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium"
        >
          📖 Read
        </button>

        {showActions && (
          <>
            <button
              onClick={() => onEdit?.(item)}
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete?.(item)}
              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm"
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>
    </article>
  )
}
