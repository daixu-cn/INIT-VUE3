declare namespace Model {
  namespace SystemSticker {
    type Status = "DRAFT" | "PROCESSING" | "ACTIVE" | "HIDDEN" | "BLOCKED"

    interface Media {
      mediaAssetId: string
      mimeType: string
      byteLength: number | null
      status: string
      processingStatus: string
    }

    interface LocalizedMetadata {
      name: string
      description: string
      alt: string
    }

    interface Embedding {
      systemStickerEmbeddingId: string
      provider: string
      model: string
      dimensions: number
      indexVersion: string
      contentHash: string
      status: string
    }

    interface Revision {
      systemStickerRevisionId: string
      systemStickerId: string
      revisionNumber: number
      sourceMimeType: string
      width: number | null
      height: number | null
      frameCount: number | null
      cycleDurationMs: number | null
      isAnimated: boolean
      contentHash: string | null
      semanticContentHash: string | null
      semanticText: string | null
      emotion: string | null
      expressionIntent: string | null
      relationshipTone: string | null
      intensity: number | null
      searchTags: string[]
      applicableScenarios: string[]
      localizedMetadata: Record<string, LocalizedMetadata>
      moderationStatus: string
      annotationStatus: string
      metadataConfirmedAt: string | null
      publishedAt: string | null
      createdAt: string
      media: Media | null
      posterMedia: Media | null
      sourceMedia: Media | null
      embeddings: Embedding[]
    }

    interface Sticker {
      systemStickerId: string
      code: string
      currentRevisionId: string | null
      sortOrder: number
      status: Status
      createdAt: string
      updatedAt: string
      currentRevision: Revision | null
    }

    interface ListData {
      catalogRevision: number
      items: Sticker[]
      page: number
      pageSize: number
      total: number
    }

    interface UploadDescriptor {
      filename: string
      mimeType: "image/png" | "image/webp" | "image/gif"
      byteLength: number
    }

    interface MetadataInput {
      semanticText: string
      emotion: string
      expressionIntent: string
      relationshipTone: string
      intensity: number
      searchTags: string[]
      applicableScenarios: string[]
      localizedMetadata: Record<string, LocalizedMetadata>
      confirmed: true
    }
  }
}
