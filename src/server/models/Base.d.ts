declare namespace Model {
  namespace Base {
    /** 响应格式 */
    interface Response<T = unknown> {
      traceId: string | string[]
      code: number
      message: string | string[]
      data: T
    }
  }
}
