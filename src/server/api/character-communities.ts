import http from "@/server"

export function listCharacterCommunities(params: Model.CharacterCommunity.ListParams) {
  const normalized = { ...params, status: params.status === "ALL" ? undefined : params.status }
  return http.get<Model.CharacterCommunity.ListData, typeof normalized>(
    "/admin/character-communities",
    normalized,
    { dedupe: true, dedupeKey: `admin/character-communities:${JSON.stringify(normalized)}` },
  )
}

export function getCharacterCommunity(communityId: string) {
  return http.get<Model.CharacterCommunity.Detail>(
    `/admin/character-communities/${encodeURIComponent(communityId)}`,
  )
}

export function updateCharacterCommunityStatus(
  communityId: string,
  params: { status: Model.CharacterCommunity.Status; reason?: string },
) {
  return http.patch<Model.CharacterCommunity.ListItem, typeof params>(
    `/admin/character-communities/${encodeURIComponent(communityId)}/status`,
    params,
  )
}

export function moderateCharacterCommunityPost(
  communityId: string,
  postId: string,
  params: { action: "HIDE" | "RESTORE"; reason?: string },
) {
  return http.post<
    { characterCommunityPostId: string; status: Model.CharacterCommunity.ContentStatus },
    typeof params
  >(
    `/admin/character-communities/${encodeURIComponent(communityId)}/posts/${encodeURIComponent(postId)}/moderation`,
    params,
  )
}

export function moderateCharacterCommunityComment(
  communityId: string,
  commentId: string,
  params: { action: "HIDE" | "RESTORE"; reason?: string },
) {
  return http.post<
    { characterCommunityPostCommentId: string; status: Model.CharacterCommunity.ContentStatus },
    typeof params
  >(
    `/admin/character-communities/${encodeURIComponent(communityId)}/comments/${encodeURIComponent(commentId)}/moderation`,
    params,
  )
}

export function addCharacterCommunityModerator(communityId: string, userId: string) {
  return http.put<Model.CharacterCommunity.Moderator, undefined>(
    `/character-communities/${encodeURIComponent(communityId)}/moderators/${encodeURIComponent(userId)}`,
    undefined,
  )
}

export function removeCharacterCommunityModerator(communityId: string, userId: string) {
  return http.delete<{ moderator: false; userId: string }>(
    `/character-communities/${encodeURIComponent(communityId)}/moderators/${encodeURIComponent(userId)}`,
  )
}

export function banCharacterCommunityUser(communityId: string, userId: string, reason?: string) {
  return http.put<{ banned: true; userId: string }, { reason?: string }>(
    `/character-communities/${encodeURIComponent(communityId)}/bans/${encodeURIComponent(userId)}`,
    { reason },
  )
}

export function unbanCharacterCommunityUser(communityId: string, userId: string) {
  return http.delete<{ banned: false; userId: string }>(
    `/character-communities/${encodeURIComponent(communityId)}/bans/${encodeURIComponent(userId)}`,
  )
}
