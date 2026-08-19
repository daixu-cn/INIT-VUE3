declare namespace Model {
  namespace Billing {
    type Platform = "APPLE" | "GOOGLE"
    type RefundState =
      | "REQUESTED"
      | "EVIDENCE_SENT"
      | "APPROVED"
      | "DECLINED"
      | "REVERSED"
      | "UNMATCHED"
      | "MANUAL_REVIEW"
      | "CLOSED"
    type EventStatus =
      "PENDING" | "PROCESSING" | "APPLIED" | "RETRY" | "DEAD_LETTER" | "UNMATCHED" | "MANUAL_REVIEW"
    type RiskState = "GOOD_STANDING" | "PAYMENT_DEBT" | "UNDER_REVIEW" | "PAYMENT_SUSPENDED"

    interface RefundSummary {
      refundCaseId: string
      userId?: string | null
      platform: Platform
      kind: "POINT_PURCHASE" | "SUBSCRIPTION"
      state: RefundState
      storeTransactionId: string
      productId?: string | null
      requestedPoints: number
      refundedPoints: number
      recoveredPoints: number
      debtCreatedPoints: number
      riskEvent: boolean
      confirmedCollusion: boolean
      createdAt: string
      updatedAt: string
      user?: {
        displayName?: string | null
        email?: string | null
        handle?: string | null
        userId?: string
      } | null
      debtLots: Array<{ remainingPoints: number }>
      _count: {
        adminActions?: number
        debtLots: number
        events: number
        recoveries: number
        storeEvents: number
      }
    }

    interface Recovery {
      refundRecoveryAllocationId: string
      source: string
      sourceId: string
      points: number
      createdAt: string
    }

    interface DebtLot {
      pointDebtLotId: string
      userId: string
      originalPoints: number
      remainingPoints: number
      paidPoints: number
      waivedPoints: number
      createdAt: string
      settledAt?: string | null
    }

    interface CaseEvent {
      refundCaseEventId: string
      platformEventId: string
      eventType: string
      state: RefundState
      occurredAt: string
      createdAt: string
    }

    interface AdminAction {
      billingAdminActionId: string
      actorUserId: string
      action: string
      reason: string
      createdAt: string
    }

    interface RefundDetail extends RefundSummary {
      adminActions: AdminAction[]
      debtLots: DebtLot[]
      events: CaseEvent[]
      recoveries: Recovery[]
      storeEvents: StoreEvent[]
      evidenceSnapshot: Record<string, unknown>
    }

    interface StoreEvent {
      storeEventInboxId: string
      platform: Platform
      eventId: string
      eventType: string
      eventAt: string
      status: EventStatus
      attemptCount: number
      lastError?: string | null
      processedAt?: string | null
      refundCaseId?: string | null
      createdAt: string
      updatedAt: string
    }

    interface RefundListParams {
      limit?: number
      platform?: Platform | ""
      state?: RefundState | ""
      userId?: string
    }

    interface EventListParams {
      limit?: number
      status?: EventStatus | ""
    }

    interface ReasonParams {
      reason: string
    }
  }
}
