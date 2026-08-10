declare namespace Model {
  namespace Auth {
    /** 登录数据 */
    interface Data {
      accessToken: string
      accessExpiresIn: number
      refreshToken: string
      refreshExpiresIn: number
      user: Model.User.Data
    }

    interface EmailLinkRequest {
      expiresIn: number
      pollToken: string
      requestId: string
      resendAfter: number
      session?: Data
    }

    interface EmailLinkStatus {
      status: "PENDING" | "CONFIRMED" | "EXPIRED"
      session?: Data
    }

    namespace Params {
      interface EmailLinkRequest {
        email: string
      }

      interface EmailLinkStatus {
        pollToken: string
        requestId: string
      }
    }
  }
}
