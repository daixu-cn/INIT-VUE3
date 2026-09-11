import http from "@/server"

export function getReportMedia(reportId: string) {
  return http.get<Model.Report.Media[]>(
    `/admin/reports/${encodeURIComponent(reportId)}/media`,
    undefined,
    {
      skipErrorHandler: true,
    },
  )
}

export function listReports(params: Model.Report.ListParams) {
  const normalized = { ...params, status: params.status === "ALL" ? undefined : params.status }
  return http.get<Model.Report.ListData, Model.Report.ListParams>("/admin/reports", normalized, {
    dedupe: true,
    dedupeKey: `admin/reports:${JSON.stringify(normalized)}`,
  })
}

export function reviewReport(reportId: string, params: Model.Report.ReviewParams) {
  return http.patch<Model.Report.Item, Model.Report.ReviewParams>(
    `/admin/reports/${encodeURIComponent(reportId)}`,
    params,
  )
}
