function getCloudinaryConfig() {
	const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dghcsoc48'
	const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'
	return { cloudName, uploadPreset }
}

function ensureCloudinaryConfig() {
	const { cloudName, uploadPreset } = getCloudinaryConfig()
	if (!cloudName || !uploadPreset) {
		throw new Error('Cloudinary config missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env')
	}
	return { cloudName, uploadPreset }
}

export function isPdfUrl(fileUrl = '') {
	if (!fileUrl) return false

	try {
		const url = new URL(fileUrl)
		const pathname = url.pathname.toLowerCase()
		const search = `${url.search}`.toLowerCase()

		return (
			pathname.endsWith('.pdf') ||
			pathname.includes('/pdf') ||
			search.includes('.pdf') ||
			search.includes('format=pdf') ||
			search.includes('mime=application/pdf')
		)
	} catch (_) {
		const raw = String(fileUrl).toLowerCase()
		return raw.includes('.pdf')
	}
}

export function normalizePdfReadUrl(fileUrl = '') {
	if (!fileUrl) return ''

	try {
		return new URL(fileUrl).toString()
	} catch (_) {
		return String(fileUrl).trim()
	}
}

export async function uploadFileToCloudinary(file, { resourceType = 'auto', folder } = {}) {
	if (!file) throw new Error('No file selected for upload')

	if (file.type && file.type !== 'application/pdf' && resourceType !== 'image') {
		throw new Error('Only PDF files are allowed for ebook upload')
	}

	const { cloudName, uploadPreset } = ensureCloudinaryConfig()

	const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
	const formData = new FormData()
	formData.append('file', file)
	formData.append('upload_preset', uploadPreset)
	if (folder) formData.append('folder', folder)

	const response = await fetch(endpoint, {
		method: 'POST',
		body: formData,
	})

	const data = await response.json()
	if (!response.ok) {
		throw new Error(data?.error?.message || 'Cloudinary upload failed')
	}

	return {
		secureUrl: data.secure_url,
		publicId: data.public_id,
		originalFilename: data.original_filename,
		resourceType: data.resource_type,
	}
}

export function buildGoogleViewerUrl(fileUrl) {
	if (!fileUrl) return ''
	// Ensure URL is properly encoded
	const encodedUrl = encodeURIComponent(fileUrl)
	return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`
}
