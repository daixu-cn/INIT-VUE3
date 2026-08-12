declare namespace Model {
  namespace Feedback {
    type Status = "OPEN" | "IN_REVIEW" | "RESOLVED" | "CANCELLED"
    type Category =
      | "FEATURE_REQUEST"
      | "USAGE_QUESTION"
      | "BUG"
      | "ACCOUNT"
      | "BILLING"
      | "CHARACTER_CONTENT"
      | "OTHER"
    type EmailStatus = "PENDING" | "PROCESSING" | "SENT" | "FAILED"

    interface Summary {
      id: string
      user: { email: string; userId: string }
      category: Category
      body: string
      locale: string
      status: Status
      attachmentCount: number
      emailDeliveryStatus: EmailStatus | null
      repliedAt: string | null
      cancelledAt: string | null
      createdAt: string
      updatedAt: string
    }

    interface Attachment {
      id: string
      mimeType: string
      url: string
      expiresAt: string
    }

    interface Detail {
      id: string
      user: { email: string; userId: string }
      assignedAdmin: { email: string; userId: string } | null
      repliedBy: { email: string; userId: string } | null
      category: Category
      body: string
      locale: string
      diagnostics: Record<string, string>
      status: Status
      attachments: Attachment[]
      reply: { body: string; repliedAt: string } | null
      emailDelivery: {
        status: EmailStatus
        attemptCount: number
        lastError?: string | null
        sentAt: string | null
      } | null
      cancelledAt: string | null
      createdAt: string
      updatedAt: string
    }

    interface ListData {
      items: Summary[]
      nextCursor: string | null
    }

    interface ListParams {
      cursor?: string
      limit?: number
      status?: Status | "ALL"
      category?: Category | ""
      keyword?: string
      createdFrom?: string
      createdTo?: string
    }

    interface ReplyParams {
      replyRequestId: string
      body: string
    }
  }
}
