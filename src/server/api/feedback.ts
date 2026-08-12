import http from "@/server"

export function listFeedback(params: Model.Feedback.ListParams) {
  const normalized = {
    ...params,
    category: params.category || undefined,
    status: params.status === "ALL" ? undefined : params.status,
  }
  return http.get<Model.Feedback.ListData, Model.Feedback.ListParams>(
    "/admin/feedback",
    normalized,
    {
      dedupe: true,
      dedupeKey: `admin/feedback:${JSON.stringify(normalized)}`,
    },
  )
}

export function getFeedback(feedbackId: string) {
  return http.get<Model.Feedback.Detail>(`/admin/feedback/${encodeURIComponent(feedbackId)}`)
}

export function markFeedbackInReview(feedbackId: string) {
  return http.patch<Model.Feedback.Detail, { status: "IN_REVIEW" }>(
    `/admin/feedback/${encodeURIComponent(feedbackId)}/status`,
    { status: "IN_REVIEW" },
    { skipErrorHandler: true },
  )
}

export function replyFeedback(feedbackId: string, params: Model.Feedback.ReplyParams) {
  return http.post<Model.Feedback.Detail, Model.Feedback.ReplyParams>(
    `/admin/feedback/${encodeURIComponent(feedbackId)}/reply`,
    params,
    { skipErrorHandler: true },
  )
}

export function retryFeedbackEmail(feedbackId: string) {
  return http.post<Model.Feedback.Detail>(
    `/admin/feedback/${encodeURIComponent(feedbackId)}/email/retry`,
  )
}
