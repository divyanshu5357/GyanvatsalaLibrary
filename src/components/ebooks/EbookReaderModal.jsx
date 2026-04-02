import React, { useEffect, useMemo, useState } from 'react'
import { authFetch } from '../../utils/api'
import { buildGoogleViewerUrl, isPdfUrl, normalizePdfReadUrl } from '../../utils/cloudinaryUpload'
import { normalizeEbook } from '../../utils/ebooks'

export default function EbookReaderModal({ ebook, onClose }) {
	const [viewerSrc, setViewerSrc] = useState('')
	const [openHref, setOpenHref] = useState('')
	const [loading, setLoading] = useState(false)
	const [loadError, setLoadError] = useState('')
	const item = useMemo(() => (ebook ? normalizeEbook(ebook) : null), [ebook])

	useEffect(() => {
		let cancelled = false

		async function resolveReaderSource() {
			if (!item) {
				setViewerSrc('')
				setOpenHref('')
				setLoadError('')
				setLoading(false)
				return
			}

			const normalizedPdfUrl = normalizePdfReadUrl(item.file_url)
			const pdf = isPdfUrl(normalizedPdfUrl)

			setOpenHref(normalizedPdfUrl)
			setLoadError('')

			if (!pdf) {
				setViewerSrc('')
				setLoading(false)
				return
			}

			setViewerSrc('')
				setLoading(true)

				try {
					if (item.upload_type === 'cloudinary') {
						const response = await authFetch(`/api/ebooks/${item.id}/read-url`)
						if (!response.ok) {
							const body = await response.json().catch(() => ({}))
							throw new Error(body?.error || 'Failed to prepare ebook reader')
					}

					const data = await response.json()
					if (cancelled) return

					const signedUrl = data?.url || normalizedPdfUrl
					setViewerSrc(buildGoogleViewerUrl(signedUrl))
					setOpenHref(signedUrl)
				} else {
					setViewerSrc(buildGoogleViewerUrl(normalizedPdfUrl))
				}
			} catch (err) {
				if (cancelled) return

				setViewerSrc('')
				setLoadError(err.message || 'Failed to load this PDF')
			} finally {
				if (!cancelled) {
					setLoading(false)
				}
			}
		}

		resolveReaderSource()

		return () => {
			cancelled = true
		}
	}, [item])

	if (!item) return null

	const normalizedPdfUrl = normalizePdfReadUrl(item.file_url)
	const isPdf = isPdfUrl(normalizedPdfUrl)
	const actionHref = item.upload_type === 'cloudinary' ? openHref || viewerSrc : viewerSrc || openHref
	const actionLabel = item.upload_type === 'cloudinary' ? 'Open PDF in New Tab' : 'Open with Google Viewer'
	const subtitle = item.category_type === 'school'
		? `${item.subject} · Class ${item.class}`
		: `${item.custom_category} · Other Study Materials`

	return (
		<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-2 sm:p-4">
			<div className="w-full h-full glass border border-slate-700 rounded-2xl overflow-hidden flex flex-col animate-scaleIn">
				<div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-700 bg-slate-900/70">
					<div className="min-w-0">
						<h3 className="font-semibold truncate">{item.title}</h3>
						<p className="text-xs text-slate-400 truncate">{subtitle}</p>
					</div>
					<button onClick={onClose} className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-sm">✖ Close</button>
				</div>

				{!isPdf ? (
					<div className="p-6 m-4 rounded-xl border border-amber-400/40 bg-amber-500/10 text-amber-100 space-y-3">
						<h4 className="font-semibold">This file is not a PDF</h4>
						<p className="text-sm">Reading is restricted to PDF files only. Please upload a PDF or use a direct PDF URL.</p>
						<a
							href={normalizedPdfUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-block px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm"
						>
							Open original link
						</a>
					</div>
				) : loadError ? (
					<div className="p-6 m-4 rounded-xl border border-red-400/40 bg-red-500/10 text-red-100 space-y-3">
						<h4 className="font-semibold">Unable to open this PDF</h4>
						<p className="text-sm">{loadError}</p>
						{openHref && (
							<a
								href={openHref}
								target="_blank"
								rel="noreferrer"
								className="inline-block px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm"
							>
								Open original link
							</a>
						)}
					</div>
				) : (
					<>
						<div className="px-4 py-2 text-xs text-slate-300 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between">
							<span>{loading ? 'Preparing PDF Reader...' : 'PDF Reader Mode'}</span>
							{actionHref && (
								<a
									href={actionHref}
									target="_blank"
									rel="noreferrer"
									className="text-indigo-300 hover:text-indigo-200 underline"
								>
									{actionLabel}
								</a>
							)}
						</div>

						{loading ? (
							<div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-300 text-sm">
								Preparing your ebook...
							</div>
						) : (
							<iframe
								title={`Read ${item.title}`}
								src={viewerSrc}
								className="w-full flex-1 bg-slate-950"
								allow="autoplay"
							/>
						)}
					</>
				)}
			</div>
		</div>
	)
}
