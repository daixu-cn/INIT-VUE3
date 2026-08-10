import http from "@/server"

export function getAppOperations() {
  return http.get<Model.AppOperations.Data>("/admin/app-operations", undefined, {
    dedupe: true,
    dedupeKey: "admin/app-operations",
  })
}

export function updateMaintenance(params: Model.AppOperations.UpdateMaintenance) {
  return http.patch<Model.AppOperations.MaintenancePolicy, Model.AppOperations.UpdateMaintenance>(
    "/admin/app-operations/maintenance",
    params,
  )
}
