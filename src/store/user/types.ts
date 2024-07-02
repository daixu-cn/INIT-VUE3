export interface Info {
  userId: string
  userName: string
}

export interface State {
  info: Info | null
  token: string | null
  permission: string[]
}
