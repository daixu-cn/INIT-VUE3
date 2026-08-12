import http from "@/server"

export function listNotificationTemplates() {
  return http.get<Model.Notification.Template[]>("/admin/notifications/templates", undefined, {
    dedupe: true,
    dedupeKey: "admin/notifications/templates",
  })
}

export function previewNotification(params: Model.Notification.BroadcastPayload) {
  return http.post<Model.Notification.Preview, Model.Notification.BroadcastPayload>(
    "/admin/notifications/preview",
    params,
  )
}

export function sendNotificationBroadcast(params: Model.Notification.BroadcastPayload) {
  return http.post<Model.Notification.Broadcast, Model.Notification.BroadcastPayload>(
    "/admin/notifications/broadcasts",
    params,
  )
}

export function listNotificationBroadcasts() {
  return http.get<Model.Notification.Broadcast[]>("/admin/notifications/broadcasts", undefined, {
    dedupe: true,
    dedupeKey: "admin/notifications/broadcasts",
  })
}
