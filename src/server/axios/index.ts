import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from "axios"

import router from "@/router"
import useStore from "@/store"
import { snackbar } from "@/tools/snackbar"

import type { HTTPRequestConfig, InternalHTTPRequestConfig } from "./types"

const SUCCESS_CODE_MIN = 200
const SUCCESS_CODE_MAX = 300
const AUTH_ERROR_CODES = new Set([401, 403])
const DEFAULT_ERROR_MESSAGE = "请求失败，请稍后重试"

function isSuccessCode(code: number) {
  return code >= SUCCESS_CODE_MIN && code < SUCCESS_CODE_MAX
}

class HTTP {
  // axios实例
  instance: AxiosInstance
  // 刷新令牌专用实例，避免响应拦截器递归触发
  refreshInstance: AxiosInstance
  // 进行中的请求
  actives = new Map<string, AbortController>()
  // 刷新令牌中的请求
  refreshTokenPromise: Promise<string> | null = null

  constructor(config: HTTPRequestConfig) {
    this.instance = axios.create(config)
    this.refreshInstance = axios.create(config)
    this.instance.interceptors.request.use(
      config => {
        const requestConfig = config as InternalHTTPRequestConfig

        if (requestConfig.dedupe) {
          const requestKey = this.getRequestKey(requestConfig)
          requestConfig._requestKey = requestKey
          this.cancel(requestKey)

          const controller = new AbortController()
          requestConfig.signal = controller.signal
          this.actives.set(requestKey, controller)
        }

        const token = useStore().user.token
        if (!requestConfig.skipAuth && token) {
          requestConfig.headers.set("Authorization", `Bearer ${token}`)
        }

        return requestConfig
      },
      error => Promise.reject(error),
    )
    // 响应拦截器
    this.instance.interceptors.response.use(
      async (response: AxiosResponse<Model.Base.Response>) => {
        this.clear(response.config as InternalHTTPRequestConfig)

        const { code, message } = response.data
        const requestConfig = response.config as InternalHTTPRequestConfig

        // 登录过期/Token异常
        if (AUTH_ERROR_CODES.has(code)) {
          if (requestConfig.skipAuth) {
            const errorMessage = this.normalizeMessage(message)
            if (!requestConfig.skipErrorHandler) snackbar.error(errorMessage)
            return Promise.reject(
              new AxiosError(errorMessage, undefined, requestConfig, response.request, response),
            )
          }
          return this.retryWithRefresh(response, this.normalizeMessage(message))
        }

        if (!isSuccessCode(code)) {
          const errorMessage = this.normalizeMessage(message)
          if (!requestConfig.skipErrorHandler) snackbar.error(errorMessage)

          return Promise.reject(
            new AxiosError(errorMessage, undefined, requestConfig, response.request, response),
          )
        }

        return response
      },
      async error => {
        const requestConfig = error.config as InternalHTTPRequestConfig | undefined
        if (requestConfig) {
          this.clear(requestConfig)
        }

        if (error instanceof AxiosError && error.code === "ERR_CANCELED") {
          return Promise.reject(error)
        }

        const response = error?.response as AxiosResponse<Model.Base.Response> | undefined
        if (response && AUTH_ERROR_CODES.has(response.status)) {
          if (requestConfig?.skipAuth) {
            error.message = this.normalizeMessage(response.data?.message)
            if (!requestConfig.skipErrorHandler) snackbar.error(error.message)
            return Promise.reject(error)
          }
          return this.retryWithRefresh(response)
        }

        const statusText = error?.response?.statusText
        const errorMessage = statusText
          ? `${error?.response.status} (${statusText})`
          : error.message || DEFAULT_ERROR_MESSAGE
        error.message = errorMessage

        if (!requestConfig?.skipErrorHandler) {
          snackbar.error(errorMessage)
        }

        return Promise.reject(error)
      },
    )
  }

  private normalizeMessage(message?: string | string[]) {
    if (Array.isArray(message)) {
      return message.filter(Boolean).join(", ") || DEFAULT_ERROR_MESSAGE
    }

    return message || DEFAULT_ERROR_MESSAGE
  }

  private clear(config?: InternalHTTPRequestConfig) {
    const requestKey = config?._requestKey
    if (!requestKey) {
      return
    }

    this.actives.delete(requestKey)
  }

  private isRefreshRequest(config?: InternalHTTPRequestConfig) {
    return config?.url?.includes("/auth/refresh") ?? false
  }

  private async refreshAccessToken() {
    if (!this.refreshTokenPromise) {
      const refreshToken = useStore().user.refreshToken
      this.refreshTokenPromise = this.refreshInstance
        .post<
          Model.Base.Response<Model.Auth.Data>,
          AxiosResponse<Model.Base.Response<Model.Auth.Data>>,
          Record<string, never>
        >(
          "/auth/refresh",
          {},
          {
            headers: refreshToken ? { Authorization: `Bearer ${refreshToken}` } : undefined,
            withCredentials: true,
          },
        )
        .then(response => {
          const { code, data, message } = response.data
          if (!isSuccessCode(code)) throw new Error(this.normalizeMessage(message))

          useStore().user.setSession(data)
          return data.accessToken
        })
        .finally(() => {
          this.refreshTokenPromise = null
        })
    }

    return this.refreshTokenPromise
  }

  private resetAuthState(message?: string) {
    this.cancelAll()
    useStore().user.reset()

    if (message) {
      snackbar.error(message)
    }

    if (router.currentRoute.value.name !== "AdminLogin") {
      router.replace({ name: "AdminLogin" }).catch(() => undefined)
    }
  }

  private async retryWithRefresh(
    response: AxiosResponse<Model.Base.Response>,
    fallbackMessage?: string,
  ) {
    const requestConfig = response.config as InternalHTTPRequestConfig

    if (
      requestConfig.retryOnAuthError === false ||
      requestConfig._retried ||
      this.isRefreshRequest(requestConfig)
    ) {
      this.resetAuthState(fallbackMessage ?? this.normalizeMessage(response.data?.message))
      return Promise.reject(
        new AxiosError(
          fallbackMessage ?? this.normalizeMessage(response.data?.message),
          undefined,
          requestConfig,
          response.request,
          response,
        ),
      )
    }

    try {
      const token = await this.refreshAccessToken()
      requestConfig._retried = true
      requestConfig.headers.set("Authorization", `Bearer ${token}`)

      return this.instance.request(requestConfig)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (fallbackMessage ?? this.normalizeMessage(response.data?.message))
      this.resetAuthState(errorMessage)
      return Promise.reject(error)
    }
  }

  /**
   * @description 获取请求唯一Key
   * @return {string}
   */
  getRequestKey({
    baseURL,
    url,
    method,
    data,
    params,
    dedupeKey,
  }: InternalHTTPRequestConfig): string {
    if (dedupeKey) {
      return dedupeKey
    }

    const methodString = method ? method.toUpperCase() : ""
    const dataString = data ? JSON.stringify(data) : ""
    const paramsString = params ? JSON.stringify(params) : ""

    return `${methodString} ${baseURL}${url} ${dataString} ${paramsString}`
  }

  /**
   * @description 取消进行中的请求
   * @param {string | AxiosRequestConfig} config 请求的唯一Key或配置对象
   */
  cancel(config: string | InternalHTTPRequestConfig) {
    const key = typeof config === "string" ? config : this.getRequestKey(config)

    if (this.actives.has(key)) {
      const abortController = this.actives.get(key)
      abortController?.abort(key)
      this.actives.delete(key)
    }
  }

  /**
   * @description 取消/重置所有进行中的请求
   * @param {AxiosRequestConfig} config
   */
  cancelAll() {
    this.actives.forEach(abortController => abortController?.abort())
    this.actives.clear()
  }

  async request<T = unknown, D = unknown>(
    config: HTTPRequestConfig<D>,
  ): Promise<Model.Base.Response<T>> {
    const response = await this.instance.request<
      Model.Base.Response<T>,
      AxiosResponse<Model.Base.Response<T>>,
      D
    >(config)

    return response.data
  }

  get<T = unknown, D = unknown>(url: string, params?: D, config: HTTPRequestConfig<D> = {}) {
    return this.request<T, D>({ url, params, ...config, method: "GET" })
  }

  post<T = unknown, D = unknown>(url: string, data?: D, config: HTTPRequestConfig<D> = {}) {
    return this.request<T, D>({ url, data, ...config, method: "POST" })
  }

  delete<T = unknown, D = unknown>(url: string, params?: D, config: HTTPRequestConfig<D> = {}) {
    return this.request<T, D>({ url, params, ...config, method: "DELETE" })
  }

  patch<T = unknown, D = unknown>(url: string, data?: D, config: HTTPRequestConfig<D> = {}) {
    return this.request<T, D>({ url, data, ...config, method: "PATCH" })
  }

  put<T = unknown, D = unknown>(url: string, data?: D, config: HTTPRequestConfig<D> = {}) {
    return this.request<T, D>({ url, data, ...config, method: "PUT" })
  }
}
export default HTTP
