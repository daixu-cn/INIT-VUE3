<template>
  <section class="feedback-page">
    <header class="page-header">
      <div>
        <h1>意见与反馈</h1>
        <span>查看用户反馈、记录处理进度并发送正式回复。</span>
      </div>
    </header>

    <div class="query-bar">
      <label class="keyword-field">
        <span>关键词</span>
        <input
          v-model="filters.keyword"
          type="search"
          placeholder="反馈编号、内容或用户邮箱"
          @keyup.enter="loadFeedback(true)"
        />
      </label>
      <label>
        <span>状态</span>
        <select v-model="filters.status">
          <option value="ALL">全部状态</option>
          <option value="OPEN">待处理</option>
          <option value="IN_REVIEW">处理中</option>
          <option value="RESOLVED">已回复</option>
          <option value="CANCELLED">已撤销</option>
        </select>
      </label>
      <label>
        <span>分类</span>
        <select v-model="filters.category">
          <option value="">全部分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ categoryLabel(category) }}
          </option>
        </select>
      </label>
      <label>
        <span>开始日期</span>
        <input v-model="dateFrom" type="date" />
      </label>
      <label>
        <span>结束日期</span>
        <input v-model="dateTo" type="date" />
      </label>
      <button class="query-button" type="button" :disabled="loading" @click="loadFeedback(true)">
        查询
      </button>
      <button class="reset-button" type="button" :disabled="loading" @click="resetFilters">
        重置
      </button>
      <button class="refresh-button" type="button" :disabled="loading" @click="loadFeedback(true)">
        <AppIcon :path="mdiRefresh" :class="{ spinning: loading }" />
        刷新
      </button>
    </div>

    <div class="table-wrap">
      <table class="feedback-table">
        <thead>
          <tr>
            <th>状态</th>
            <th>反馈内容</th>
            <th>用户</th>
            <th>附件</th>
            <th>提交时间</th>
            <th><span class="sr-only">操作</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in feedback" :key="item.id" @click="openFeedback(item.id)">
            <td>
              <span class="status-chip" :data-status="item.status">{{
                statusLabel(item.status)
              }}</span>
            </td>
            <td>
              <strong>{{ categoryLabel(item.category) }}</strong>
              <small>{{ item.body }}</small>
            </td>
            <td>
              <strong>{{ item.user.email }}</strong>
              <small>{{ localeLabel(item.locale) }}</small>
            </td>
            <td>{{ item.attachmentCount ? `${item.attachmentCount} 张` : "—" }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <button
                class="open-detail"
                type="button"
                :aria-label="`查看反馈 ${item.id}`"
                @click.stop="openFeedback(item.id)"
              >
                <AppIcon :path="mdiChevronRight" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="loading && !feedback.length" class="table-state">
        <AppIcon class="spinning" :path="mdiLoading" />
        正在加载反馈…
      </div>
      <div v-else-if="!feedback.length" class="table-state">
        <AppIcon :path="mdiMessageCheckOutline" />
        当前筛选条件下没有反馈
      </div>
      <button
        v-if="nextCursor"
        class="load-more"
        type="button"
        :disabled="loading"
        @click="loadFeedback(false)"
      >
        {{ loading ? "加载中…" : "加载更多" }}
      </button>
    </div>

    <Transition name="drawer">
      <div v-if="selectedId" class="drawer-layer" @click.self="closeDrawer">
        <aside class="feedback-drawer">
          <header>
            <div>
              <span v-if="selected" class="status-chip" :data-status="selected.status">
                {{ statusLabel(selected.status) }}
              </span>
              <h2>{{ selected ? categoryLabel(selected.category) : "反馈详情" }}</h2>
            </div>
            <button type="button" aria-label="关闭" @click="closeDrawer">
              <AppIcon :path="mdiClose" />
            </button>
          </header>

          <div v-if="detailLoading" class="drawer-state">
            <AppIcon class="spinning" :path="mdiLoading" />
            正在读取反馈…
          </div>

          <template v-else-if="selected">
            <dl>
              <div>
                <dt>反馈编号</dt>
                <dd>{{ selected.id }}</dd>
              </div>
              <div>
                <dt>用户</dt>
                <dd>{{ selected.user.email }}</dd>
              </div>
              <div>
                <dt>提交语言</dt>
                <dd>{{ localeLabel(selected.locale) }}</dd>
              </div>
              <div>
                <dt>提交时间</dt>
                <dd>{{ formatDate(selected.createdAt, true) }}</dd>
              </div>
              <div v-if="selected.assignedAdmin">
                <dt>处理管理员</dt>
                <dd>{{ selected.assignedAdmin.email }}</dd>
              </div>
              <div v-if="selected.cancelledAt">
                <dt>撤销时间</dt>
                <dd>{{ formatDate(selected.cancelledAt, true) }}</dd>
              </div>
            </dl>

            <section class="detail-section">
              <h3>用户反馈</h3>
              <p class="feedback-copy">{{ selected.body }}</p>
            </section>

            <section v-if="selected.attachments.length" class="detail-section">
              <h3>截图附件</h3>
              <div class="attachment-grid">
                <button
                  v-for="attachment in selected.attachments"
                  :key="attachment.id"
                  type="button"
                  @click="previewAttachment = attachment"
                >
                  <img :src="attachment.url" alt="用户反馈截图" />
                </button>
              </div>
            </section>

            <details v-if="diagnosticEntries.length" class="diagnostics">
              <summary>基础诊断信息</summary>
              <dl>
                <div v-for="entry in diagnosticEntries" :key="entry[0]">
                  <dt>{{ diagnosticLabel(entry[0]) }}</dt>
                  <dd>{{ entry[1] }}</dd>
                </div>
              </dl>
            </details>

            <section v-if="selected.reply" class="reply-result">
              <div>
                <strong>Echo 已回复</strong>
                <span>{{ formatDate(selected.reply.repliedAt, true) }}</span>
              </div>
              <p>{{ selected.reply.body }}</p>
              <div class="delivery-state">
                <span data-status="SENT">站内通知已创建</span>
                <span :data-status="selected.emailDelivery?.status ?? 'PENDING'">
                  邮件{{ emailStatusLabel(selected.emailDelivery?.status) }}
                </span>
                <small v-if="selected.emailDelivery?.lastError">{{
                  selected.emailDelivery.lastError
                }}</small>
              </div>
              <button
                v-if="selected.emailDelivery?.status === 'FAILED'"
                class="retry-email"
                type="button"
                :disabled="processing"
                @click="handleRetryEmail"
              >
                重试邮件
              </button>
            </section>

            <template v-else-if="selected.status !== 'CANCELLED'">
              <label class="reply-field">
                <span>用户可见回复</span>
                <textarea
                  v-model="replyBody"
                  minlength="2"
                  maxlength="4000"
                  placeholder="请输入将同步到站内通知和账户邮箱的正式回复"
                />
                <small>{{ replyBody.length }}/4000 · 发送后立即结单且不可编辑</small>
              </label>

              <footer>
                <button
                  v-if="selected.status === 'OPEN'"
                  class="secondary-action"
                  type="button"
                  :disabled="processing"
                  @click="handleInReview"
                >
                  标记处理中
                </button>
                <button
                  class="reply-action"
                  type="button"
                  :disabled="processing || replyBody.trim().length < 2"
                  @click="handleReply"
                >
                  {{ processing ? "提交中…" : "确认回复并结单" }}
                </button>
              </footer>
            </template>
            <section v-else class="cancelled-result">
              <strong>用户已撤销</strong>
              <p>该反馈已停止处理，不能再标记处理中或发送正式回复。</p>
            </section>
          </template>
        </aside>
      </div>
    </Transition>

    <div v-if="previewAttachment" class="image-preview" @click="previewAttachment = undefined">
      <button type="button" aria-label="关闭预览" @click="previewAttachment = undefined">
        <AppIcon :path="mdiClose" />
      </button>
      <img :src="previewAttachment.url" alt="用户反馈截图大图" @click.stop />
    </div>
  </section>
</template>

<script setup lang="ts">
import { mdiChevronRight, mdiClose, mdiLoading, mdiMessageCheckOutline, mdiRefresh } from "@mdi/js"
import { computed, onMounted, reactive, ref } from "vue"

import AppIcon from "@/components/AppIcon.vue"
import {
  getFeedback,
  listFeedback,
  markFeedbackInReview,
  replyFeedback,
  retryFeedbackEmail,
} from "@/server/api/feedback"
import { snackbar } from "@/tools/snackbar"

const categories: Model.Feedback.Category[] = [
  "FEATURE_REQUEST",
  "USAGE_QUESTION",
  "BUG",
  "ACCOUNT",
  "BILLING",
  "CHARACTER_CONTENT",
  "OTHER",
]
const filters = reactive<Model.Feedback.ListParams>({
  status: "ALL",
  category: "",
  keyword: "",
  limit: 20,
})
const dateFrom = ref("")
const dateTo = ref("")
const feedback = ref<Model.Feedback.Summary[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(false)
const detailLoading = ref(false)
const processing = ref(false)
const selectedId = ref<string>()
const selected = ref<Model.Feedback.Detail>()
const replyBody = ref("")
const previewAttachment = ref<Model.Feedback.Attachment>()

const diagnosticEntries = computed(() => Object.entries(selected.value?.diagnostics ?? {}))

function categoryLabel(category: Model.Feedback.Category) {
  return {
    FEATURE_REQUEST: "功能建议",
    USAGE_QUESTION: "使用问题",
    BUG: "故障与异常",
    ACCOUNT: "账号与登录",
    BILLING: "会员/积分/支付",
    CHARACTER_CONTENT: "角色与内容",
    OTHER: "其他",
  }[category]
}

function statusLabel(status: Model.Feedback.Status) {
  return { OPEN: "待处理", IN_REVIEW: "处理中", RESOLVED: "已回复", CANCELLED: "已撤销" }[status]
}

function emailStatusLabel(status?: Model.Feedback.EmailStatus) {
  return { PENDING: "待发送", PROCESSING: "发送中", SENT: "已发送", FAILED: "发送失败" }[
    status ?? "PENDING"
  ]
}

function localeLabel(locale: string) {
  return (
    { zh_CN: "简体中文", zh_TW: "繁體中文", en_US: "English", ja_JP: "日本語", de_DE: "Deutsch" }[
      locale
    ] ?? locale
  )
}

function diagnosticLabel(key: string) {
  return (
    {
      appVersion: "APP 版本",
      buildNumber: "构建号",
      platform: "平台",
      systemVersion: "系统版本",
      locale: "语言",
      deviceType: "设备类型",
    }[key] ?? key
  )
}

function formatDate(value: string, detailed = false) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...(detailed ? { year: "numeric" } : {}),
  }).format(new Date(value))
}

function dateBoundary(value: string, end = false) {
  if (!value) return undefined
  const date = new Date(`${value}T${end ? "23:59:59.999" : "00:00:00.000"}`)
  return date.toISOString()
}

async function loadFeedback(reset: boolean) {
  if (loading.value) return
  loading.value = true
  try {
    const response = await listFeedback({
      ...filters,
      createdFrom: dateBoundary(dateFrom.value),
      createdTo: dateBoundary(dateTo.value, true),
      cursor: reset ? undefined : (nextCursor.value ?? undefined),
      keyword: filters.keyword?.trim() || undefined,
    })
    feedback.value = reset ? response.data.items : [...feedback.value, ...response.data.items]
    nextCursor.value = response.data.nextCursor
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.status = "ALL"
  filters.category = ""
  filters.keyword = ""
  dateFrom.value = ""
  dateTo.value = ""
  loadFeedback(true)
}

async function openFeedback(feedbackId: string) {
  selectedId.value = feedbackId
  selected.value = undefined
  replyBody.value = ""
  detailLoading.value = true
  try {
    selected.value = (await getFeedback(feedbackId)).data
  } finally {
    detailLoading.value = false
  }
}

function closeDrawer() {
  selectedId.value = undefined
  selected.value = undefined
  replyBody.value = ""
}

function syncSummary(detail: Model.Feedback.Detail) {
  const index = feedback.value.findIndex(item => item.id === detail.id)
  if (index < 0) return
  const current = feedback.value[index]
  feedback.value[index] = {
    ...current,
    body: detail.body,
    category: detail.category,
    emailDeliveryStatus: detail.emailDelivery?.status ?? null,
    repliedAt: detail.reply?.repliedAt ?? null,
    cancelledAt: detail.cancelledAt,
    status: detail.status,
    updatedAt: detail.updatedAt,
  }
}

async function handleInReview() {
  if (!selected.value || processing.value) return
  processing.value = true
  try {
    selected.value = (await markFeedbackInReview(selected.value.id)).data
    syncSummary(selected.value)
    snackbar.success("已标记为处理中")
  } catch (error) {
    if (!(await refreshAfterConflict(error))) snackbar.error("标记处理中失败，请稍后重试")
  } finally {
    processing.value = false
  }
}

function requestId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `feedback-reply-${Date.now()}-${Math.random().toString(16).slice(2)}`
  )
}

async function handleReply() {
  if (!selected.value || processing.value || replyBody.value.trim().length < 2) return
  if (
    !globalThis.confirm("确认发送这条正式回复吗？发送后将立即结单，并同步创建站内通知和邮件任务。")
  )
    return
  processing.value = true
  try {
    selected.value = (
      await replyFeedback(selected.value.id, {
        replyRequestId: requestId(),
        body: replyBody.value.trim(),
      })
    ).data
    syncSummary(selected.value)
    replyBody.value = ""
    snackbar.success("回复已保存，站内通知已创建，邮件正在投递")
  } catch (error) {
    if (!(await refreshAfterConflict(error))) snackbar.error("回复失败，请稍后重试")
  } finally {
    processing.value = false
  }
}

async function refreshAfterConflict(error: unknown) {
  const status = (error as { response?: { status?: number } }).response?.status
  if (status !== 409 || !selected.value) return false
  const feedbackId = selected.value.id
  selected.value = (await getFeedback(feedbackId)).data
  syncSummary(selected.value)
  replyBody.value = ""
  snackbar.error(
    selected.value.status === "CANCELLED"
      ? "用户已撤销，无法继续处理"
      : "反馈状态已变更，请查看最新结果",
  )
  return true
}

async function handleRetryEmail() {
  if (!selected.value || processing.value) return
  processing.value = true
  try {
    selected.value = (await retryFeedbackEmail(selected.value.id)).data
    syncSummary(selected.value)
    snackbar.success("邮件已重新进入投递队列")
  } finally {
    processing.value = false
  }
}

onMounted(() => loadFeedback(true))
</script>

<style scoped>
.feedback-page {
  min-height: 100svh;
  padding: 20px;
  color: #293334;
}
.page-header {
  min-height: 50px;
}
.page-header h1 {
  margin: 0;
  font-size: 22px;
  line-height: 1.3;
}
.page-header span {
  display: block;
  margin-top: 5px;
  color: #7b8582;
  font-size: 13px;
}
.query-bar {
  display: flex;
  align-items: end;
  gap: 10px;
  margin: 18px 0 14px;
  padding: 14px;
  border: 1px solid #dfe5e6;
  border-radius: 6px;
  background: #fff;
}
.query-bar label {
  display: grid;
  min-width: 130px;
  gap: 6px;
  color: #6f7a7c;
  font-size: 12px;
}
.query-bar .keyword-field {
  flex: 1;
  min-width: 210px;
}
.query-bar input,
.query-bar select,
.reply-field textarea {
  width: 100%;
  border: 1px solid #cfd7da;
  border-radius: 4px;
  background: #fff;
  color: #293334;
  font: inherit;
  outline: none;
}
.query-bar input,
.query-bar select {
  height: 38px;
  padding: 0 10px;
}
.query-bar input:focus,
.query-bar select:focus,
.reply-field textarea:focus {
  border-color: var(--color-admin-accent);
  box-shadow: 0 0 0 2px rgb(22 142 147 / 10%);
}
.query-button,
.reset-button,
.refresh-button,
.load-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  gap: 6px;
  padding: 0 16px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
.query-button {
  border: 1px solid var(--color-admin-accent);
  background: var(--color-admin-accent);
  color: #fff;
}
.reset-button,
.refresh-button,
.load-more {
  border: 1px solid #cfd7da;
  background: #fff;
  color: #526063;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.table-wrap {
  overflow: hidden;
  border: 1px solid #dfe5e6;
  border-radius: 6px;
  background: #fff;
}
.feedback-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.feedback-table th {
  height: 42px;
  padding: 0 14px;
  border-bottom: 1px solid #e6ebec;
  background: #f7f9f9;
  color: #788386;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
}
.feedback-table th:nth-child(1) {
  width: 100px;
}
.feedback-table th:nth-child(3) {
  width: 210px;
}
.feedback-table th:nth-child(4) {
  width: 72px;
}
.feedback-table th:nth-child(5) {
  width: 130px;
}
.feedback-table th:last-child {
  width: 52px;
}
.feedback-table td {
  height: 68px;
  padding: 10px 14px;
  border-bottom: 1px solid #edf0f1;
  color: #4b5759;
  font-size: 13px;
  vertical-align: middle;
}
.feedback-table tbody tr {
  cursor: pointer;
}
.feedback-table tbody tr:hover {
  background: #f7fbfa;
}
.feedback-table strong,
.feedback-table small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.feedback-table strong {
  color: #334042;
  font-size: 13px;
}
.feedback-table small {
  margin-top: 5px;
  color: #899294;
}
.status-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: #eef1f2;
  color: #697477;
  font-size: 12px;
}
.status-chip[data-status="IN_REVIEW"] {
  background: #fff4dc;
  color: #9a6a11;
}
.status-chip[data-status="RESOLVED"] {
  background: #e7f4ef;
  color: #277b67;
}
.status-chip[data-status="CANCELLED"] {
  background: #eef1f2;
  color: #697477;
}
.open-detail {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  background: transparent;
  color: #8c9698;
  cursor: pointer;
}
.table-state {
  display: grid;
  place-items: center;
  min-height: 240px;
  gap: 10px;
  color: #879194;
  font-size: 14px;
}
.table-state .app-icon {
  font-size: 28px;
  color: var(--color-admin-accent);
}
.load-more {
  display: flex;
  margin: 14px auto;
}
.drawer-layer {
  position: fixed;
  z-index: 60;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  background: rgb(28 39 40 / 28%);
}
.feedback-drawer {
  width: min(600px, 94vw);
  height: 100%;
  overflow-y: auto;
  padding: 22px;
  background: #fff;
  box-shadow: -12px 0 36px rgb(30 48 49 / 12%);
}
.feedback-drawer > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e8ecec;
}
.feedback-drawer h2 {
  margin: 10px 0 0;
  font-size: 22px;
}
.feedback-drawer > header button,
.image-preview > button {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: #f1f4f4;
  color: #596567;
  cursor: pointer;
}
.feedback-drawer > dl,
.diagnostics dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
  margin: 20px 0;
}
.feedback-drawer dl div {
  min-width: 0;
}
.feedback-drawer dt {
  color: #8a9496;
  font-size: 12px;
}
.feedback-drawer dd {
  overflow-wrap: anywhere;
  margin: 5px 0 0;
  color: #465254;
  font-size: 13px;
}
.detail-section {
  margin-top: 20px;
}
.detail-section h3 {
  margin: 0 0 10px;
  font-size: 14px;
}
.feedback-copy {
  margin: 0;
  padding: 16px;
  border: 1px solid #e1e6e7;
  border-radius: 6px;
  background: #f8f9f9;
  color: #465254;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}
.attachment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.attachment-grid button {
  aspect-ratio: 1;
  overflow: hidden;
  padding: 0;
  border: 1px solid #dfe5e6;
  border-radius: 6px;
  background: #f4f6f6;
  cursor: zoom-in;
}
.attachment-grid img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.diagnostics {
  margin-top: 20px;
  border: 1px solid #e1e6e7;
  border-radius: 6px;
  background: #fff;
}
.diagnostics summary {
  padding: 14px 16px;
  color: #536063;
  font-size: 14px;
  cursor: pointer;
}
.diagnostics dl {
  margin: 0;
  padding: 0 16px 16px;
}
.reply-field {
  display: grid;
  gap: 8px;
  margin-top: 24px;
  color: #465254;
  font-size: 14px;
  font-weight: 600;
}
.reply-field textarea {
  min-height: 180px;
  resize: vertical;
  padding: 12px;
  line-height: 1.65;
}
.reply-field small {
  color: #8a9496;
  font-size: 12px;
  font-weight: 400;
  text-align: right;
}
.feedback-drawer footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
.secondary-action,
.reply-action,
.retry-email {
  min-height: 40px;
  padding: 0 18px;
  border-radius: 4px;
  cursor: pointer;
}
.secondary-action,
.retry-email {
  border: 1px solid #cbd4d6;
  background: #fff;
  color: #526063;
}
.reply-action {
  border: 1px solid var(--color-admin-accent);
  background: var(--color-admin-accent);
  color: #fff;
}
.reply-result {
  margin-top: 24px;
  padding: 18px;
  border: 1px solid #d5e8e2;
  border-radius: 8px;
  background: #f0f7f4;
}
.reply-result > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #367c6d;
  font-size: 13px;
}
.reply-result p {
  margin: 14px 0 0;
  color: #34423f;
  line-height: 1.75;
  white-space: pre-wrap;
}
.delivery-state {
  display: grid;
  gap: 5px;
  margin-top: 16px;
  color: #77827f;
  font-size: 12px;
}
.delivery-state span[data-status="SENT"] {
  color: #277b67;
}
.delivery-state span[data-status="FAILED"] {
  color: #b14a43;
}
.delivery-state small {
  overflow-wrap: anywhere;
}
.retry-email {
  margin-top: 12px;
}
.cancelled-result {
  margin-top: 24px;
  padding: 18px;
  border: 1px solid #dfe5e6;
  border-radius: 8px;
  background: #f5f7f7;
  color: #697477;
}
.cancelled-result strong {
  color: #4f5a5c;
  font-size: 14px;
}
.cancelled-result p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.65;
}
.drawer-state {
  display: grid;
  place-items: center;
  min-height: 300px;
  gap: 10px;
  color: #879194;
}
.image-preview {
  position: fixed;
  z-index: 90;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 40px;
  background: rgb(10 16 17 / 82%);
}
.image-preview > button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgb(255 255 255 / 14%);
  color: #fff;
}
.image-preview img {
  max-width: min(1100px, 92vw);
  max-height: 88vh;
  object-fit: contain;
}
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 180ms ease;
}
.drawer-enter-active .feedback-drawer,
.drawer-leave-active .feedback-drawer {
  transition: transform 180ms ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .feedback-drawer,
.drawer-leave-to .feedback-drawer {
  transform: translateX(24px);
}
.spinning {
  animation: spin 850ms linear infinite;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 980px) {
  .query-bar {
    flex-wrap: wrap;
  }
  .feedback-table th:nth-child(4),
  .feedback-table td:nth-child(4) {
    display: none;
  }
}
@media (max-width: 700px) {
  .feedback-page {
    padding: 14px;
  }
  .query-bar label,
  .query-bar .keyword-field {
    flex: 1 1 100%;
  }
  .feedback-table th:nth-child(3),
  .feedback-table td:nth-child(3),
  .feedback-table th:nth-child(5),
  .feedback-table td:nth-child(5) {
    display: none;
  }
  .feedback-drawer {
    width: 100%;
    padding: 18px;
  }
  .feedback-drawer > dl,
  .diagnostics dl {
    grid-template-columns: 1fr;
  }
  .attachment-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .feedback-drawer footer {
    flex-direction: column-reverse;
  }
  .feedback-drawer footer button {
    width: 100%;
  }
}
</style>
