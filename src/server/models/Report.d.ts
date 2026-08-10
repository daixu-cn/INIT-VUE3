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
    }

    interface ListData {
      items: Item[]
      nextCursor: string | null
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
    }
  }
}
