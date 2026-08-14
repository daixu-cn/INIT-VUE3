declare namespace Model {
  namespace User {
    /** 用户数据 */
    interface Data {
      userId: string
      email: string
      role: "ADMIN" | "OFFICIAL" | "USER"
    }

    namespace Params {}
  }
}
