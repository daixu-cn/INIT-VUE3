import http from "@/server"

export function requestAdminEmailLink(params: Model.Auth.Params.EmailLinkRequest) {
  return http.post<Model.Auth.EmailLinkRequest, Model.Auth.Params.EmailLinkRequest>(
    "/auth/admin/email-link",
    params,
    {
      dedupe: true,
      dedupeKey: "auth/admin/email-link",
      retryOnAuthError: false,
      skipAuth: true,
      skipErrorHandler: true,
    },
  )
}

export function getAdminEmailLinkStatus(params: Model.Auth.Params.EmailLinkStatus) {
  return http.post<Model.Auth.EmailLinkStatus, Model.Auth.Params.EmailLinkStatus>(
    "/auth/admin/email-link/status",
    params,
    {
      dedupe: true,
      dedupeKey: "auth/admin/email-link/status",
      retryOnAuthError: false,
      skipAuth: true,
      skipErrorHandler: true,
    },
  )
}

export function refreshToken() {
  return http.post<Model.Auth.Data, Record<string, never>>(
    "/auth/refresh",
    {},
    {
      dedupe: true,
      dedupeKey: "auth/refresh",
      retryOnAuthError: false,
      skipAuth: true,
      skipErrorHandler: true,
      withCredentials: true,
    },
  )
}

export function logout() {
  return http.post<{ loggedOut: boolean }, Record<string, never>>(
    "/auth/logout",
    {},
    { retryOnAuthError: false, withCredentials: true },
  )
}
