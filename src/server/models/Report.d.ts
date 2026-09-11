declare namespace Model {
  namespace Report {
    type Status = "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED"

    interface Item {
      reportId: string
      reporter: {
        email: string
        userId: string
      }
      targetType: string
      targetId: string
      category: string
      details?: string | null
      status: Status
      createdAt: string
      updatedAt: string
      targetSnapshot?: CommunityTargetSnapshot | null
    }

    interface CommunityTargetSnapshot {
      characterCommunityId?: string
      characterDefinitionId?: string
      targetAuthorUserId?: string
      characterName?: string | null
      status: string
      title?: string | null
      text?: string
      authorDisplayName?: string
      authorUserId?: string | null
      postId?: string
      rootCommentId?: string | null
      replyToCommentId?: string | null
      postCount?: number
      commentCount?: number
      likeCount?: number
      suspensionReason?: string | null
      moderationReason?: string | null
      createdAt?: string
      lastPostAt?: string | null
      mediaAssetIds?: string[]
      tags?: string[]
      owner?: {
        displayName?: string | null
        email?: string | null
        userId: string
      } | null
    }

    interface ListData {
      items: Item[]
      nextCursor: string | null
    }

    interface Media {
      mediaAssetId: string
      kind: "IMAGE" | "AUDIO"
      mimeType: string
      url: string
      expiresAt: string
      durationMilliseconds?: number | null
      transcript?: string | null
    }

    interface ListParams {
      cursor?: string
      limit?: number
      status?: Status | "ALL"
      targetType?: string
    }

    interface ReviewParams {
      status: Exclude<Status, "OPEN">
      note?: string
      publicationAction?: "NONE" | "TAKE_DOWN" | "RESTORE"
    }
  }
}
