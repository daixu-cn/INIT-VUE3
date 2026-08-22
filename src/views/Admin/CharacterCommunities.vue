<template>
  <section class="community-page">
    <header class="page-header">
      <div>
        <h1>角色真人社区</h1>
        <p>管理角色绑定的帖子社区、内容审核、版主与封禁用户。</p>
      </div>
      <button type="button" class="secondary" :disabled="loading" @click="load">
        <AppIcon :path="mdiRefresh" :class="{ spinning: loading }" />
        刷新
      </button>
    </header>

    <form class="filters" @submit.prevent="load">
      <label>
        <span>关键词</span>
        <input v-model.trim="filters.query" type="search" placeholder="角色、作者或社区编号" />
      </label>
      <label>
        <span>状态</span>
        <select v-model="filters.status">
          <option value="ALL">全部</option>
          <option value="ACTIVE">正常</option>
          <option value="SUSPENDED">已暂停</option>
          <option value="ARCHIVED">已归档</option>
        </select>
      </label>
      <button type="submit" class="primary" :disabled="loading">查询</button>
    </form>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>角色 / 主持人</th>
            <th>状态</th>
            <th>帖子</th>
            <th>评论</th>
            <th>版主 / 封禁</th>
            <th>最近发帖</th>
            <th><span class="sr-only">操作</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.characterCommunityId" @click="openDetail(item)">
            <td>
              <strong>{{ item.characterDefinition.profile?.name || "未命名角色" }}</strong>
              <small>{{ displayUser(item.owner) }}</small>
              <code>{{ item.characterCommunityId }}</code>
            </td>
            <td><StatusChip :status="item.status" /></td>
            <td>{{ item.postCount }}</td>
            <td>{{ item.commentCount }}</td>
            <td>{{ item._count.moderators }} / {{ item._count.bans }}</td>
            <td>{{ item.lastPostAt ? formatDate(item.lastPostAt) : "尚无帖子" }}</td>
            <td><AppIcon :path="mdiChevronRight" /></td>
          </tr>
        </tbody>
      </table>
      <div v-if="loading && !items.length" class="empty">
        <AppIcon :path="mdiLoading" class="spinning" /> 正在加载…
      </div>
      <div v-else-if="!items.length" class="empty">当前筛选条件下没有社区</div>
    </div>

    <Transition name="drawer">
      <div v-if="selected" class="drawer-layer" @click.self="closeDetail">
        <aside class="drawer">
          <header>
            <div>
              <StatusChip :status="selected.status" />
              <h2>{{ selected.characterDefinition.profile?.name || "未命名角色" }}</h2>
              <small>{{ selected.characterCommunityId }}</small>
            </div>
            <button type="button" aria-label="关闭" @click="closeDetail">
              <AppIcon :path="mdiClose" />
            </button>
          </header>

          <div v-if="detailLoading" class="empty">
            <AppIcon :path="mdiLoading" class="spinning" /> 读取详情…
          </div>
          <template v-else-if="detail">
            <dl class="summary-grid">
              <div>
                <dt>主持人</dt>
                <dd>{{ displayUser(detail.owner) }}</dd>
              </div>
              <div>
                <dt>帖子 / 评论</dt>
                <dd>{{ detail.postCount }} / {{ detail.commentCount }}</dd>
              </div>
              <div>
                <dt>最近发帖</dt>
                <dd>{{ detail.lastPostAt ? formatDate(detail.lastPostAt, true) : "—" }}</dd>
              </div>
              <div>
                <dt>暂停原因</dt>
                <dd>{{ detail.suspensionReason || "—" }}</dd>
              </div>
            </dl>

            <label class="reason-field">
              <span>处置原因</span>
              <textarea
                v-model.trim="reason"
                maxlength="500"
                placeholder="暂停、隐藏、封禁或归档前填写判断依据"
              />
              <small>{{ reason.length }}/500</small>
            </label>

            <div class="community-actions">
              <button
                v-if="detail.status !== 'ACTIVE'"
                class="restore"
                type="button"
                :disabled="processing"
                @click="setCommunityStatus('ACTIVE')"
              >
                恢复社区
              </button>
              <button
                v-if="detail.status !== 'SUSPENDED'"
                class="danger"
                type="button"
                :disabled="processing || !reason"
                @click="setCommunityStatus('SUSPENDED')"
              >
                暂停社区
              </button>
              <button
                v-if="detail.status !== 'ARCHIVED'"
                class="secondary"
                type="button"
                :disabled="processing || !reason"
                @click="setCommunityStatus('ARCHIVED')"
              >
                归档社区
              </button>
            </div>

            <section class="detail-section">
              <div class="section-heading">
                <h3>主持人与版主</h3>
                <small>最多 5 位版主</small>
              </div>
              <div class="inline-form">
                <input v-model.trim="moderatorUserId" placeholder="输入用户 ID 任命版主" />
                <button
                  class="primary"
                  type="button"
                  :disabled="processing || !moderatorUserId"
                  @click="addModerator"
                >
                  任命
                </button>
              </div>
              <ul class="plain-list">
                <li>
                  <strong>主持人</strong><span>{{ displayUser(detail.owner) }}</span>
                </li>
                <li
                  v-for="moderator in detail.moderators"
                  :key="moderator.characterCommunityModeratorId"
                >
                  <strong>版主</strong>
                  <span>{{ displayUser(moderator.user) }}</span>
                  <button
                    class="link danger-text"
                    type="button"
                    :disabled="processing"
                    @click="removeModerator(moderator)"
                  >
                    移除
                  </button>
                </li>
              </ul>
            </section>

            <section class="detail-section">
              <div class="section-heading">
                <h3>封禁用户</h3>
                <small>封禁后仍可浏览，但不能互动</small>
              </div>
              <div class="inline-form">
                <input v-model.trim="banUserId" placeholder="输入需要封禁的用户 ID" />
                <button
                  class="danger"
                  type="button"
                  :disabled="processing || !banUserId || !reason"
                  @click="banUser"
                >
                  封禁
                </button>
              </div>
              <ul class="plain-list">
                <li v-for="ban in detail.bans" :key="ban.characterCommunityBanId">
                  <strong>{{ displayUser(ban.user) }}</strong>
                  <span
                    >{{ ban.reason || "未填写原因" }} · {{ formatDate(ban.createdAt, true) }}</span
                  >
                  <button class="link" type="button" :disabled="processing" @click="unbanUser(ban)">
                    解封
                  </button>
                </li>
                <li v-if="!detail.bans.length" class="muted-row">暂无封禁用户</li>
              </ul>
            </section>

            <section class="detail-section">
              <div class="section-heading">
                <h3>热门标签</h3>
                <small>当前社区内复用</small>
              </div>
              <div class="tag-cloud">
                <span v-for="tag in detail.tags" :key="tag.characterCommunityTagId"
                  >#{{ tag.displayName }} · {{ tag.usageCount }}</span
                >
                <span v-if="!detail.tags.length" class="muted-row">暂无标签</span>
              </div>
            </section>

            <section class="detail-section">
              <div class="section-heading">
                <h3>最近帖子</h3>
                <small>最多显示 100 篇，包含软删除与审核记录</small>
              </div>
              <div class="content-list">
                <article v-for="post in detail.posts" :key="post.characterCommunityPostId">
                  <div class="content-meta">
                    <strong>{{ post.author.displayName }}</strong>
                    <span
                      >{{ formatDate(post.createdAt, true) }} · {{ post.likeCount }} 喜欢 ·
                      {{ post.commentCount }} 评论</span
                    >
                    <StatusChip :status="post.status" />
                    <span v-if="post.pinned" class="pin-chip">已置顶</span>
                  </div>
                  <h4 v-if="post.title" class="post-title">{{ post.title }}</h4>
                  <p>
                    {{
                      post.text ||
                      (post.media.length ? `图片帖（${post.media.length} 张）` : "（内容不可见）")
                    }}
                  </p>
                  <div v-if="post.tags.length" class="tag-cloud compact">
                    <span v-for="tag in post.tags" :key="tag.characterCommunityTagId"
                      >#{{ tag.displayName }}</span
                    >
                  </div>
                  <small v-if="post.moderationReason" class="moderation-reason"
                    >原因：{{ post.moderationReason }}</small
                  >
                  <div class="row-actions">
                    <button
                      v-if="post.status === 'VISIBLE'"
                      class="link danger-text"
                      type="button"
                      :disabled="processing || !reason"
                      @click="moderatePost(post, 'HIDE')"
                    >
                      隐藏帖子
                    </button>
                    <button
                      v-else-if="post.status === 'MODERATION_HIDDEN'"
                      class="link"
                      type="button"
                      :disabled="processing"
                      @click="moderatePost(post, 'RESTORE')"
                    >
                      恢复帖子
                    </button>
                    <button
                      v-if="post.author.userId && post.author.userId !== detail.ownerUserId"
                      class="link danger-text"
                      type="button"
                      :disabled="processing || !reason"
                      @click="banUserById(post.author.userId)"
                    >
                      封禁作者
                    </button>
                  </div>
                </article>
                <div v-if="!detail.posts.length" class="empty">尚无帖子</div>
              </div>
            </section>

            <section class="detail-section">
              <div class="section-heading">
                <h3>最近评论</h3>
                <small>根评论与一级回复</small>
              </div>
              <div class="content-list">
                <article
                  v-for="comment in detail.recentComments"
                  :key="comment.characterCommunityPostCommentId"
                >
                  <div class="content-meta">
                    <strong>{{ comment.authorDisplayNameSnapshot }}</strong>
                    <span
                      >{{ comment.rootCommentId ? "回复" : "根评论" }} ·
                      {{ formatDate(comment.createdAt, true) }}</span
                    >
                    <StatusChip :status="comment.status" />
                  </div>
                  <p>{{ comment.text || "（内容不可见）" }}</p>
                  <small class="context-line"
                    >所在帖子：{{
                      comment.post.title ||
                      comment.post.text ||
                      comment.post.characterCommunityPostId
                    }}</small
                  >
                  <small v-if="comment.moderationReason" class="moderation-reason"
                    >原因：{{ comment.moderationReason }}</small
                  >
                  <div class="row-actions">
                    <button
                      v-if="comment.status === 'VISIBLE'"
                      class="link danger-text"
                      type="button"
                      :disabled="processing || !reason"
                      @click="moderateComment(comment, 'HIDE')"
                    >
                      隐藏评论
                    </button>
                    <button
                      v-else-if="comment.status === 'MODERATION_HIDDEN'"
                      class="link"
                      type="button"
                      :disabled="processing"
                      @click="moderateComment(comment, 'RESTORE')"
                    >
                      恢复评论
                    </button>
                    <button
                      v-if="comment.authorUserId && comment.authorUserId !== detail.ownerUserId"
                      class="link danger-text"
                      type="button"
                      :disabled="processing || !reason"
                      @click="banUserById(comment.authorUserId)"
                    >
                      封禁作者
                    </button>
                  </div>
                </article>
                <div v-if="!detail.recentComments.length" class="empty">尚无评论</div>
              </div>
            </section>

            <section class="detail-section">
              <div class="section-heading"><h3>最近审核记录</h3></div>
              <ul class="plain-list audit-list">
                <li
                  v-for="action in detail.moderationActions"
                  :key="action.characterCommunityModerationActionId"
                >
                  <strong>{{ action.action }}</strong>
                  <span
                    >{{ displayUser(action.actor) }} ·
                    {{ formatDate(action.createdAt, true) }}</span
                  >
                  <small>{{ action.reason || "未填写原因" }}</small>
                </li>
                <li v-if="!detail.moderationActions.length" class="muted-row">暂无审核记录</li>
              </ul>
            </section>
          </template>
        </aside>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { mdiChevronRight, mdiClose, mdiLoading, mdiRefresh } from "@mdi/js"
import { defineComponent, h, onMounted, reactive, ref } from "vue"

import AppIcon from "@/components/AppIcon.vue"
import {
  addCharacterCommunityModerator,
  banCharacterCommunityUser,
  getCharacterCommunity,
  listCharacterCommunities,
  moderateCharacterCommunityComment,
  moderateCharacterCommunityPost,
  removeCharacterCommunityModerator,
  unbanCharacterCommunityUser,
  updateCharacterCommunityStatus,
} from "@/server/api/character-communities"
import { snackbar } from "@/tools/snackbar"

const StatusChip = defineComponent({
  props: { status: { type: String, required: true } },
  setup(props) {
    return () =>
      h(
        "span",
        { class: "state-chip", "data-state": props.status },
        contentStatusLabel(props.status),
      )
  },
})

const filters = reactive<Model.CharacterCommunity.ListParams>({ status: "ALL", limit: 100 })
const items = ref<Model.CharacterCommunity.ListItem[]>([])
const selected = ref<Model.CharacterCommunity.ListItem>()
const detail = ref<Model.CharacterCommunity.Detail>()
const loading = ref(false)
const detailLoading = ref(false)
const processing = ref(false)
const reason = ref("")
const moderatorUserId = ref("")
const banUserId = ref("")

function displayUser(user?: Model.CharacterCommunity.UserSummary | null) {
  return user?.displayName || user?.handle || user?.email || user?.userId || "已注销用户"
}

function contentStatusLabel(status: string) {
  return (
    {
      ACTIVE: "正常",
      SUSPENDED: "已暂停",
      ARCHIVED: "已归档",
      VISIBLE: "可见",
      DELETED: "已删除",
      MODERATION_HIDDEN: "审核隐藏",
    }[status] ?? status
  )
}

function formatDate(value: string, detailed = false) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...(detailed ? { year: "numeric", second: "2-digit" } : {}),
  }).format(new Date(value))
}

async function load() {
  if (loading.value) return
  loading.value = true
  try {
    items.value = (await listCharacterCommunities(filters)).data.items
  } finally {
    loading.value = false
  }
}

async function openDetail(item: Model.CharacterCommunity.ListItem) {
  selected.value = item
  detail.value = undefined
  reason.value = ""
  moderatorUserId.value = ""
  banUserId.value = ""
  await reloadDetail()
}

async function reloadDetail() {
  if (!selected.value || detailLoading.value) return
  detailLoading.value = true
  try {
    detail.value = (await getCharacterCommunity(selected.value.characterCommunityId)).data
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  selected.value = undefined
  detail.value = undefined
  reason.value = ""
}

async function runAction(action: () => Promise<unknown>, success: string) {
  if (processing.value) return
  processing.value = true
  try {
    await action()
    snackbar.success(success)
    await Promise.all([reloadDetail(), load()])
  } finally {
    processing.value = false
  }
}

async function setCommunityStatus(status: Model.CharacterCommunity.Status) {
  if (!detail.value) return
  await runAction(
    () =>
      updateCharacterCommunityStatus(detail.value!.characterCommunityId, {
        status,
        reason: reason.value || undefined,
      }),
    status === "ACTIVE" ? "社区已恢复" : status === "SUSPENDED" ? "社区已暂停" : "社区已归档",
  )
}

async function moderatePost(post: Model.CharacterCommunity.Post, action: "HIDE" | "RESTORE") {
  if (!detail.value) return
  await runAction(
    () =>
      moderateCharacterCommunityPost(
        detail.value!.characterCommunityId,
        post.characterCommunityPostId,
        { action, reason: reason.value || undefined },
      ),
    action === "HIDE" ? "帖子已隐藏" : "帖子已恢复",
  )
}

async function moderateComment(
  comment: Model.CharacterCommunity.Comment,
  action: "HIDE" | "RESTORE",
) {
  if (!detail.value) return
  await runAction(
    () =>
      moderateCharacterCommunityComment(
        detail.value!.characterCommunityId,
        comment.characterCommunityPostCommentId,
        { action, reason: reason.value || undefined },
      ),
    action === "HIDE" ? "评论已隐藏" : "评论已恢复",
  )
}

async function addModerator() {
  if (!detail.value || !moderatorUserId.value) return
  const userId = moderatorUserId.value
  await runAction(
    () => addCharacterCommunityModerator(detail.value!.characterCommunityId, userId),
    "版主已任命",
  )
  moderatorUserId.value = ""
}

async function removeModerator(moderator: Model.CharacterCommunity.Moderator) {
  if (!detail.value) return
  await runAction(
    () => removeCharacterCommunityModerator(detail.value!.characterCommunityId, moderator.userId),
    "版主已移除",
  )
}

async function banUser() {
  if (!banUserId.value) return
  const userId = banUserId.value
  await banUserById(userId)
  banUserId.value = ""
}

async function banUserById(userId: string) {
  if (!detail.value) return
  await runAction(
    () =>
      banCharacterCommunityUser(
        detail.value!.characterCommunityId,
        userId,
        reason.value || undefined,
      ),
    "用户已封禁",
  )
}

async function unbanUser(ban: Model.CharacterCommunity.Ban) {
  if (!detail.value) return
  await runAction(
    () => unbanCharacterCommunityUser(detail.value!.characterCommunityId, ban.userId),
    "用户已解封",
  )
}

onMounted(load)
</script>

<style scoped>
.community-page {
  min-height: 100svh;
  padding: 20px;
  color: #293334;
}
.page-header,
.filters,
.community-actions,
.section-heading,
.content-meta,
.row-actions,
.inline-form {
  display: flex;
  align-items: center;
}
.page-header {
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}
.page-header h1 {
  margin: 0;
  font-size: 24px;
}
.page-header p {
  margin: 6px 0 0;
  color: #6f7c7e;
}
.filters {
  gap: 12px;
  padding: 14px;
  margin-bottom: 16px;
  border: 1px solid #e0e6e7;
  border-radius: 14px;
  background: #fff;
}
.filters label {
  display: grid;
  flex: 1;
  gap: 6px;
  color: #657173;
  font-size: 12px;
}
input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ccd5d7;
  border-radius: 9px;
  padding: 9px 11px;
  background: #fff;
  color: inherit;
  font: inherit;
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  border-radius: 9px;
  padding: 9px 13px;
  cursor: pointer;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}
.primary {
  background: #2d6864;
  color: #fff;
}
.secondary {
  background: #eaf0f0;
  color: #355b59;
}
.danger {
  background: #a34242;
  color: #fff;
}
.restore {
  background: #347357;
  color: #fff;
}
.table-wrap,
.detail-section {
  overflow: hidden;
  border: 1px solid #e0e6e7;
  border-radius: 14px;
  background: #fff;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 13px 14px;
  border-bottom: 1px solid #edf0f1;
  text-align: left;
  vertical-align: middle;
}
th {
  color: #758184;
  font-size: 12px;
  font-weight: 600;
}
tbody tr {
  cursor: pointer;
}
tbody tr:hover {
  background: #f7f9f9;
}
td strong,
td small,
td code {
  display: block;
}
td small,
td code {
  margin-top: 4px;
  color: #7b8789;
  font-size: 11px;
}
.state-chip,
.pin-chip {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 999px;
  background: #edf1f1;
  color: #546365;
  font-size: 11px;
  white-space: nowrap;
}
.state-chip[data-state="ACTIVE"],
.state-chip[data-state="VISIBLE"] {
  background: #def2e8;
  color: #27674a;
}
.state-chip[data-state="SUSPENDED"],
.state-chip[data-state="MODERATION_HIDDEN"] {
  background: #ffe2de;
  color: #943f37;
}
.pin-chip {
  background: #fff1cf;
  color: #8c6416;
}
.empty {
  display: flex;
  min-height: 120px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #7a8688;
}
.drawer-layer {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  background: rgb(25 38 39 / 35%);
}
.drawer {
  width: min(900px, 94vw);
  height: 100%;
  overflow: auto;
  padding: 22px;
  box-sizing: border-box;
  background: #f6f8f8;
  box-shadow: -12px 0 34px rgb(25 38 39 / 14%);
}
.drawer > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.drawer h2 {
  margin: 8px 0 2px;
}
.drawer > header button {
  padding: 7px;
  background: transparent;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 20px 0;
}
.summary-grid div {
  padding: 12px;
  border-radius: 10px;
  background: #fff;
}
dt {
  color: #758184;
  font-size: 12px;
}
dd {
  margin: 5px 0 0;
}
.reason-field {
  display: grid;
  gap: 7px;
}
.reason-field textarea {
  min-height: 78px;
  resize: vertical;
}
.reason-field small {
  justify-self: end;
  color: #849092;
}
.community-actions {
  flex-wrap: wrap;
  gap: 9px;
  margin: 12px 0 20px;
}
.detail-section {
  margin-top: 16px;
}
.section-heading {
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #edf0f1;
}
.section-heading h3 {
  margin: 0;
  font-size: 16px;
}
.section-heading small {
  color: #7b8789;
}
.inline-form {
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #edf0f1;
}
.inline-form input {
  flex: 1;
}
.link {
  padding: 2px;
  background: transparent;
  color: #286964;
}
.danger-text {
  color: #a34242;
}
.content-list {
  display: grid;
  max-height: 620px;
  overflow: auto;
}
.content-list article {
  padding: 13px 16px;
  border-bottom: 1px solid #edf0f1;
}
.content-meta {
  flex-wrap: wrap;
  gap: 8px;
  color: #7a8688;
  font-size: 12px;
}
.content-meta strong {
  color: #293334;
}
.post-title {
  margin: 8px 0 0;
  color: #293334;
  font-size: 15px;
}
.content-list p {
  margin: 8px 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.row-actions {
  justify-content: flex-end;
  gap: 12px;
}
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px;
}
.tag-cloud span {
  padding: 5px 9px;
  border-radius: 999px;
  background: #edf5f3;
  color: #316b65;
  font-size: 12px;
}
.tag-cloud.compact {
  padding: 0 0 8px;
}
.moderation-reason,
.context-line {
  display: block;
  margin: 4px 0 8px;
  color: #7b8789;
}
.plain-list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}
.plain-list li {
  display: grid;
  grid-template-columns: minmax(100px, 0.7fr) 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #edf0f1;
}
.audit-list li {
  grid-template-columns: 1fr;
}
.plain-list small,
.muted-row {
  color: #7b8789;
}
.spinning {
  animation: spin 900ms linear infinite;
}
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.18s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 720px) {
  .community-page {
    padding: 12px;
  }
  .page-header,
  .filters {
    align-items: stretch;
    flex-direction: column;
  }
  .table-wrap {
    overflow-x: auto;
  }
  .table-wrap table {
    min-width: 820px;
  }
  .drawer {
    width: 100vw;
    padding: 16px;
  }
  .summary-grid {
    grid-template-columns: 1fr;
  }
  .plain-list li {
    grid-template-columns: 1fr;
  }
}
</style>
