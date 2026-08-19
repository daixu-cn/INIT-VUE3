import http from "@/server"

export function listRefundCases(params: Model.Billing.RefundListParams) {
  const normalized = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined),
  ) as Model.Billing.RefundListParams
  return http.get<Model.Billing.RefundSummary[], Model.Billing.RefundListParams>(
    "/admin/billing/refunds",
    normalized,
    { dedupe: true, dedupeKey: `admin/billing/refunds:${JSON.stringify(normalized)}` },
  )
}

export function getRefundCase(refundCaseId: string) {
  return http.get<Model.Billing.RefundDetail>(
    `/admin/billing/refunds/${encodeURIComponent(refundCaseId)}`,
  )
}

export function listStoreEvents(params: Model.Billing.EventListParams) {
  const normalized = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined),
  ) as Model.Billing.EventListParams
  return http.get<Model.Billing.StoreEvent[], Model.Billing.EventListParams>(
    "/admin/billing/events",
    normalized,
    { dedupe: true, dedupeKey: `admin/billing/events:${JSON.stringify(normalized)}` },
  )
}

export function reprocessStoreEvent(storeEventInboxId: string, reason: string) {
  return http.post<{ accepted: true }, Model.Billing.ReasonParams>(
    `/admin/billing/events/${encodeURIComponent(storeEventInboxId)}/reprocess`,
    { reason },
  )
}

export function waiveRefundDebt(refundCaseId: string, reason: string, points?: number) {
  return http.post<Model.Billing.RefundDetail, Model.Billing.ReasonParams & { points?: number }>(
    `/admin/billing/refunds/${encodeURIComponent(refundCaseId)}/waive-debt`,
    { points, reason },
  )
}

export function markAccountCompromise(refundCaseId: string, reason: string) {
  return http.post<Model.Billing.RefundDetail, Model.Billing.ReasonParams>(
    `/admin/billing/refunds/${encodeURIComponent(refundCaseId)}/account-compromise`,
    { reason },
  )
}

export function confirmRefundCollusion(
  refundCaseId: string,
  params: Model.Billing.ReasonParams & { points: number; recipientUserId: string },
) {
  return http.post<Model.Billing.RefundDetail, typeof params>(
    `/admin/billing/refunds/${encodeURIComponent(refundCaseId)}/confirm-collusion`,
    params,
  )
}

export function setPaymentRiskState(
  userId: string,
  state: Model.Billing.RiskState,
  reason: string,
) {
  return http.patch<unknown, Model.Billing.ReasonParams & { state: Model.Billing.RiskState }>(
    `/admin/billing/users/${encodeURIComponent(userId)}/risk-state`,
    { reason, state },
  )
}
