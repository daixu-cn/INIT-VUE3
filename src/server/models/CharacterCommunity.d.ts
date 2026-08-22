declare namespace Model {
  namespace CharacterCommunity {
    type Status = "ACTIVE" | "ARCHIVED" | "SUSPENDED"
    type ContentStatus = "VISIBLE" | "DELETED" | "MODERATION_HIDDEN"

    interface UserSummary {
      userId: string
      displayName?: string | null
      handle?: string | null
      email?: string | null
    }

    interface ListItem {
      characterCommunityId: string
      characterDefinitionId: string
      ownerUserId?: string | null
      status: Status
      postCount: number
      commentCount: number
      lastPostAt?: string | null
      suspensionReason?: string | null
      createdAt: string
      updatedAt: string
      characterDefinition: { profile?: { name: string } | null }
      owner?: UserSummary | null
      _count: {
        bans: number
        moderationActions: number
        moderators: number
        posts: number
        tags: number
      }
    }

    interface AuthorSnapshot {
      userId?: string | null
      displayName: string
      avatarUrl?: string | null
    }

    interface Tag {
      characterCommunityTagId: string
      displayName: string
      normalizedName?: string
      usageCount: number
    }

    interface Post {
      characterCommunityPostId: string
      characterCommunityId: string
      clientPostId: string
      author: AuthorSnapshot
      status: ContentStatus
      title: string | null
      text: string
      likeCount: number
      commentCount: number
      pinned: boolean
      pinnedAt?: string | null
      moderationReason?: string | null
      media: Array<{ mediaAssetId: string; mimeType: string; url: string }>
      tags: Tag[]
      createdAt: string
      updatedAt: string
      canDelete: boolean
      canReport: boolean
      canModerate: boolean
      ownedByCurrentUser: boolean
      likedByCurrentUser: boolean
    }

    interface Comment {
      characterCommunityPostCommentId: string
      characterCommunityPostId: string
      clientCommentId: string
      authorUserId?: string | null
      authorDisplayNameSnapshot: string
      authorAvatarUrlSnapshot?: string | null
      status: ContentStatus
      text: string
      rootCommentId?: string | null
      replyToCommentId?: string | null
      replyCount: number
      moderationReason?: string | null
      createdAt: string
      updatedAt: string
      post: { characterCommunityPostId: string; text: string; title: string | null }
    }

    interface Moderator {
      characterCommunityModeratorId: string
      userId: string
      appointedByUserId?: string | null
      createdAt: string
      user: UserSummary
    }

    interface Ban {
      characterCommunityBanId: string
      userId: string
      actorUserId?: string | null
      reason?: string | null
      createdAt: string
      user: UserSummary
    }

    interface ModerationAction {
      characterCommunityModerationActionId: string
      characterCommunityPostId?: string | null
      characterCommunityPostCommentId?: string | null
      actorUserId?: string | null
      targetUserId?: string | null
      action: string
      reason?: string | null
      createdAt: string
      actor?: UserSummary | null
      targetUser?: UserSummary | null
    }

    interface Detail extends Omit<ListItem, "_count"> {
      posts: Post[]
      recentComments: Comment[]
      moderators: Moderator[]
      bans: Ban[]
      tags: Tag[]
      moderationActions: ModerationAction[]
    }

    interface ListData {
      items: ListItem[]
    }

    interface ListParams {
      query?: string
      status?: Status | "ALL"
      limit?: number
    }
  }
}
