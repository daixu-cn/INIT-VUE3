export interface State {
  info: Model.User.Data | null
  refreshToken: string | null
  token: string | null
  permission: string[]
}
