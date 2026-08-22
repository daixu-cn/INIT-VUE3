import http from "@/server"

export function getSystemStickers(params: {
  page?: number
  pageSize?: number
  query?: string
  status?: string
}) {
  return http.get<Model.SystemSticker.ListData, typeof params>("/admin/system-stickers", params, {
    dedupe: true,
    dedupeKey: `admin/system-stickers:${JSON.stringify(params)}`,
  })
}

export function createSystemSticker(
  params: Model.SystemSticker.UploadDescriptor & { code: string; sortOrder: number },
) {
  return http.post<
    { sticker: Model.SystemSticker.Sticker; revision: Model.SystemSticker.Revision },
    typeof params
  >("/admin/system-stickers", params)
}

export function createSystemStickerRevision(
  systemStickerId: string,
  params: Model.SystemSticker.UploadDescriptor,
) {
  return http.post<Model.SystemSticker.Revision, typeof params>(
    `/admin/system-stickers/${encodeURIComponent(systemStickerId)}/revisions`,
    params,
  )
}

export function uploadSystemStickerContent(
  systemStickerId: string,
  systemStickerRevisionId: string,
  file: File,
  onProgress?: (progress: number) => void,
) {
  return http.put<unknown, File>(
    `/admin/system-stickers/${encodeURIComponent(systemStickerId)}/revisions/${encodeURIComponent(systemStickerRevisionId)}/content`,
    file,
    {
      headers: { "Content-Type": file.type },
      onUploadProgress: event =>
        onProgress?.(event.progress ?? (event.total ? event.loaded / event.total : 0)),
    },
  )
}

export function analyzeSystemSticker(systemStickerId: string, revisionId: string) {
  return http.post<Model.SystemSticker.Revision>(
    `/admin/system-stickers/${encodeURIComponent(systemStickerId)}/revisions/${encodeURIComponent(revisionId)}/analyze`,
  )
}

export function updateSystemStickerMetadata(
  systemStickerId: string,
  revisionId: string,
  params: Model.SystemSticker.MetadataInput,
) {
  return http.patch<Model.SystemSticker.Revision, Model.SystemSticker.MetadataInput>(
    `/admin/system-stickers/${encodeURIComponent(systemStickerId)}/revisions/${encodeURIComponent(revisionId)}/metadata`,
    params,
  )
}

export function publishSystemSticker(systemStickerId: string, revisionId: string) {
  return http.post<{ catalogRevision: number; sticker: Model.SystemSticker.Sticker }>(
    `/admin/system-stickers/${encodeURIComponent(systemStickerId)}/revisions/${encodeURIComponent(revisionId)}/publish`,
  )
}

export function hideSystemSticker(systemStickerId: string) {
  return http.post<{ catalogRevision: number; sticker: Model.SystemSticker.Sticker }>(
    `/admin/system-stickers/${encodeURIComponent(systemStickerId)}/hide`,
  )
}

export function blockSystemSticker(systemStickerId: string) {
  return http.post<{ catalogRevision: number; sticker: Model.SystemSticker.Sticker }>(
    `/admin/system-stickers/${encodeURIComponent(systemStickerId)}/block`,
  )
}

export function getSystemStickerRevisions(systemStickerId: string) {
  return http.get<Model.SystemSticker.Revision[]>(
    `/admin/system-stickers/${encodeURIComponent(systemStickerId)}/revisions`,
  )
}

export function getSystemStickerMediaAccess(mediaAssetId: string) {
  return http.get<{ url: string; expiresAt?: string }>(
    `/admin/system-stickers/media/${encodeURIComponent(mediaAssetId)}/access`,
  )
}
