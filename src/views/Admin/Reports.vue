<template>
  <section class="reports-page">
    <header class="reports-header">
      <div>
        <h1>举报处理</h1>
        <span>查看用户举报、核对目标并记录处置结果。</span>
      </div>
    </header>

    <div class="query-bar">
      <label class="keyword-field">
        <span>关键词</span>
        <input
          v-model="searchKeyword"
          type="search"
          placeholder="举报原因、目标编号或举报人"
          @keyup.enter="applyFilters"
        />
      </label>
      <label>
        <span>状态</span>
        <select v-model="filters.status">
          <option v-for="item in statusOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>
      <label>
        <span>目标类型</span>
        <select v-model="filters.targetType">
          <option value="">全部类型</option>
          <option v-for="type in targetTypes" :key="type" :value="type">
            {{ targetLabel(type) }}
          </option>
        </select>
      </label>
      <button class="query-button" type="button" :disabled="loading" @click="applyFilters">
        查询
      </button>
      <button class="reset-button" type="button" :disabled="loading" @click="resetFilters">
        重置
      </button>
      <button class="refresh-button" type="button" :disabled="loading" @click="loadReports(true)">
        <AppIcon :path="mdiRefresh" :class="{ spinning: loading }" />
        刷新
      </button>
    </div>

    <div class="report-table-wrap">
      <table class="report-table">
        <thead>
          <tr>
            <th>状态</th>
            <th>举报原因</th>
            <th>目标</th>
            <th>举报人</th>
            <th>提交时间</th>
            <th><span class="sr-only">操作</span></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="report in displayedReports"
            :key="report.reportId"
            @click="selectedReport = report"
          >
            <td>
              <span class="status-chip" :data-status="report.status">{{
                statusLabel(report.status)
              }}</span>
            </td>
            <td>
              <strong>{{ report.category }}</strong>
              <small>{{ report.details || "未填写补充说明" }}</small>
            </td>
            <td>
              <strong>{{ targetLabel(report.targetType) }}</strong>
              <small>{{ report.targetId }}</small>
            </td>
            <td>{{ report.reporter.email }}</td>
            <td>{{ formatDate(report.createdAt) }}</td>
            <td>
              <button
                class="open-report"
                type="button"
                :aria-label="`查看举报 ${report.reportId}`"
                @click.stop="selectedReport = report"
              >
                <AppIcon :path="mdiChevronRight" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="loading && !reports.length" class="table-state">
        <AppIcon class="spinning" :path="mdiLoading" />
        正在加载举报…
      </div>
      <div v-else-if="!displayedReports.length" class="table-state">
        <AppIcon :path="mdiCheckCircleOutline" />
        当前筛选条件下没有举报
      </div>
      <button
        v-if="nextCursor"
        class="load-more"
        type="button"
        :disabled="loading"
        @click="loadReports(false)"
      >
        {{ loading ? "加载中…" : "加载更多" }}
      </button>
    </div>

    <Transition name="drawer">
      <div v-if="selectedReport" class="report-drawer-layer" @click.self="closeDrawer">
        <aside class="report-drawer">
          <header>
            <div>
              <span class="status-chip" :data-status="selectedReport.status">
                {{ statusLabel(selectedReport.status) }}
              </span>
              <h2>{{ selectedReport.category }}</h2>
            </div>
            <button type="button" aria-label="关闭" @click="closeDrawer">
              <AppIcon :path="mdiClose" />
            </button>
          </header>

          <dl>
            <div>
              <dt>举报编号</dt>
              <dd>{{ selectedReport.reportId }}</dd>
            </div>
            <div>
              <dt>目标类型</dt>
              <dd>{{ targetLabel(selectedReport.targetType) }}</dd>
            </div>
            <div>
              <dt>目标编号</dt>
              <dd>{{ selectedReport.targetId }}</dd>
            </div>
            <div>
              <dt>举报人</dt>
              <dd>{{ selectedReport.reporter.email }}</dd>
            </div>
            <div>
              <dt>提交时间</dt>
              <dd>{{ formatDate(selectedReport.createdAt, true) }}</dd>
            </div>
          </dl>

          <section
            v-if="isCommunitySnapshot(selectedReport.targetSnapshot)"
            class="target-snapshot"
          >
            <div class="snapshot-heading">
              <div>
                <span>真人社区审核快照</span>
                <h3>{{ selectedReport.targetSnapshot.characterName || "角色社区" }}</h3>
              </div>
              <span class="availability-chip" :data-status="selectedReport.targetSnapshot.status">
                {{ selectedReport.targetSnapshot.status }}
              </span>
            </div>
            <dl>
              <div>
                <dt>角色</dt>
                <dd>{{ selectedReport.targetSnapshot.characterName || "—" }}</dd>
              </div>
              <div>
                <dt>社区</dt>
                <dd>
                  {{
                    selectedReport.targetSnapshot.characterCommunityId || selectedReport.targetId
                  }}
                </dd>
              </div>
              <div v-if="selectedReport.targetSnapshot.authorDisplayName">
                <dt>内容作者</dt>
                <dd>{{ selectedReport.targetSnapshot.authorDisplayName }}</dd>
              </div>
              <div v-if="selectedReport.targetSnapshot.postId">
                <dt>所在帖子</dt>
                <dd>{{ selectedReport.targetSnapshot.postId }}</dd>
              </div>
            </dl>
            <div v-if="selectedReport.targetSnapshot.title" class="snapshot-content">
              <h4>帖子标题</h4>
              <p>{{ selectedReport.targetSnapshot.title }}</p>
            </div>
            <div v-if="selectedReport.targetSnapshot.text" class="snapshot-content">
              <h4>内容正文</h4>
              <p>{{ selectedReport.targetSnapshot.text }}</p>
            </div>
            <div v-if="selectedReport.targetSnapshot.tags?.length" class="snapshot-content">
              <h4>帖子标签</h4>
              <p>{{ selectedReport.targetSnapshot.tags.map(tag => `#${tag}`).join(" ") }}</p>
            </div>
          </section>

          <section class="report-details">
            <h3>补充说明</h3>
            <p>{{ selectedReport.details || "举报人未填写补充说明。" }}</p>
          </section>

          <label class="review-note">
            <span>处置备注</span>
            <textarea
              v-model="reviewNote"
              maxlength="1000"
              placeholder="记录判断依据，便于后续审计（可选）"
            />
            <small>{{ reviewNote.length }}/1000</small>
          </label>

          <footer>
            <button
              v-if="selectedReport.status === 'OPEN'"
              type="button"
              class="secondary-action"
              :disabled="processing"
              @click="handleReview('IN_REVIEW')"
            >
              标记处理中
            </button>
            <button
              v-if="
                selectedReport.targetType === 'COMMUNITY_POST' &&
                isCommunitySnapshot(selectedReport.targetSnapshot) &&
                selectedReport.targetSnapshot.status === 'VISIBLE'
              "
              type="button"
              class="take-down-action"
              :disabled="processing || !reviewNote.trim()"
              @click="handleCommunityModeration('HIDE_POST')"
            >
              隐藏帖子并处理
            </button>
            <button
              v-if="
                selectedReport.targetType === 'COMMUNITY_POST_COMMENT' &&
                isCommunitySnapshot(selectedReport.targetSnapshot) &&
                selectedReport.targetSnapshot.status === 'VISIBLE'
              "
              type="button"
              class="take-down-action"
              :disabled="processing || !reviewNote.trim()"
              @click="handleCommunityModeration('HIDE_COMMENT')"
            >
              隐藏评论并处理
            </button>
            <button
              v-if="
                selectedReport.targetType === 'CHARACTER_COMMUNITY' &&
                isCommunitySnapshot(selectedReport.targetSnapshot) &&
                selectedReport.targetSnapshot.status !== 'SUSPENDED'
              "
              type="button"
              class="take-down-action"
              :disabled="processing || !reviewNote.trim()"
              @click="handleCommunityModeration('SUSPEND_COMMUNITY')"
            >
              暂停社区并处理
            </button>
            <button
              type="button"
              class="dismiss-action"
              :disabled="processing"
              @click="handleReview('DISMISSED')"
            >
              驳回举报
            </button>
            <button
              type="button"
              class="resolve-action"
              :disabled="processing"
              @click="handleReview('RESOLVED')"
            >
              {{ processing ? "提交中…" : "确认处理" }}
            </button>
          </footer>
        </aside>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { mdiCheckCircleOutline, mdiChevronRight, mdiClose, mdiLoading, mdiRefresh } from "@mdi/js"
import { computed, onMounted, reactive, ref } from "vue"

import AppIcon from "@/components/AppIcon.vue"
import {
  moderateCharacterCommunityComment,
  moderateCharacterCommunityPost,
  updateCharacterCommunityStatus,
} from "@/server/api/character-communities"
import { listReports, reviewReport } from "@/server/api/reports"
import { snackbar } from "@/tools/snackbar"

const statusOptions: Array<{ label: string; value: Model.Report.ListParams["status"] }> = [
  { label: "全部", value: "ALL" },
  { label: "待处理", value: "OPEN" },
  { label: "处理中", value: "IN_REVIEW" },
  { label: "已处理", value: "RESOLVED" },
  { label: "已驳回", value: "DISMISSED" },
]
const targetTypes = [
  "CHARACTER_DEFINITION",
  "CHARACTER_INSTANCE",
  "MESSAGE",
  "CONVERSATION",
  "AUTHOR_MESSAGE",
  "CHARACTER_COMMUNITY",
  "COMMUNITY_POST",
  "COMMUNITY_POST_COMMENT",
]

const filters = reactive<Model.Report.ListParams>({ status: "ALL", targetType: "", limit: 20 })
const reports = ref<Model.Report.Item[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(false)
const processing = ref(false)
const selectedReport = ref<Model.Report.Item>()
const reviewNote = ref("")
const searchKeyword = ref("")
const appliedKeyword = ref("")
const displayedReports = computed(() => {
  const keyword = appliedKeyword.value.trim().toLocaleLowerCase()
  if (!keyword) return reports.value
  return reports.value.filter(report =>
    [
      report.category,
      report.details,
      report.targetId,
      report.targetType,
      report.reporter.email,
      ...snapshotSearchTerms(report.targetSnapshot),
    ].some(value => value?.toLocaleLowerCase().includes(keyword)),
  )
})

function statusLabel(status: Model.Report.Status) {
  return { OPEN: "待处理", IN_REVIEW: "处理中", RESOLVED: "已处理", DISMISSED: "已驳回" }[status]
}

function targetLabel(type: string) {
  return (
    {
      CHARACTER_DEFINITION: "公开角色",
      CHARACTER_INSTANCE: "角色实例",
      MESSAGE: "单条消息",
      CONVERSATION: "完整对话",
      AUTHOR_MESSAGE: "作者留言",
      CHARACTER_COMMUNITY: "角色真人社区",
      COMMUNITY_POST: "社区帖子",
      COMMUNITY_POST_COMMENT: "帖子评论",
    }[type] ?? type
  )
}

function isCommunitySnapshot(
  snapshot: Model.Report.Item["targetSnapshot"],
): snapshot is Model.Report.CommunityTargetSnapshot {
  return Boolean(snapshot && "characterDefinitionId" in snapshot)
}

function snapshotSearchTerms(snapshot: Model.Report.Item["targetSnapshot"]) {
  if (!snapshot) return []
  return [
    snapshot.characterName,
    snapshot.title,
    snapshot.text,
    snapshot.authorDisplayName,
    snapshot.postId,
    ...(snapshot.tags ?? []),
  ]
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

function applyFilters() {
  appliedKeyword.value = searchKeyword.value
  loadReports(true)
}

function resetFilters() {
  searchKeyword.value = ""
  appliedKeyword.value = ""
  filters.status = "ALL"
  filters.targetType = ""
  loadReports(true)
}

async function loadReports(reset: boolean) {
  if (loading.value) return
  loading.value = true
  try {
    const response = await listReports({
      ...filters,
      cursor: reset ? undefined : (nextCursor.value ?? undefined),
    })
    reports.value = reset ? response.data.items : [...reports.value, ...response.data.items]
    nextCursor.value = response.data.nextCursor
  } finally {
    loading.value = false
  }
}

function closeDrawer() {
  selectedReport.value = undefined
  reviewNote.value = ""
}

async function handleReview(
  status: Model.Report.ReviewParams["status"],
  publicationAction: Model.Report.ReviewParams["publicationAction"] = "NONE",
) {
  if (!selectedReport.value || processing.value) return
  processing.value = true
  try {
    const response = await reviewReport(selectedReport.value.reportId, {
      status,
      note: reviewNote.value.trim() || undefined,
      publicationAction,
    })
    const updated = response.data

    const index = reports.value.findIndex(report => report.reportId === updated.reportId)
    if (index >= 0) {
      const currentSnapshot = selectedReport.value.targetSnapshot
      reports.value[index] = {
        ...selectedReport.value,
        ...updated,
        targetSnapshot: currentSnapshot ?? null,
      }
    }
    snackbar.success(
      status === "RESOLVED" ? "举报已处理" : status === "DISMISSED" ? "举报已驳回" : "已标记处理中",
    )
    closeDrawer()
    if (filters.status !== "ALL" && filters.status !== status) await loadReports(true)
  } finally {
    processing.value = false
  }
}

async function handleCommunityModeration(
  action: "HIDE_POST" | "HIDE_COMMENT" | "SUSPEND_COMMUNITY",
) {
  const report = selectedReport.value
  const snapshot = report?.targetSnapshot
  if (!report || !isCommunitySnapshot(snapshot) || processing.value) return
  processing.value = true
  try {
    const reason = reviewNote.value.trim()
    if (action === "HIDE_POST") {
      if (!snapshot.characterCommunityId) throw new Error("举报快照缺少社区编号")
      await moderateCharacterCommunityPost(snapshot.characterCommunityId, report.targetId, {
        action: "HIDE",
        reason,
      })
    } else if (action === "HIDE_COMMENT") {
      if (!snapshot.characterCommunityId) throw new Error("举报快照缺少社区编号")
      await moderateCharacterCommunityComment(snapshot.characterCommunityId, report.targetId, {
        action: "HIDE",
        reason,
      })
    } else {
      await updateCharacterCommunityStatus(report.targetId, { status: "SUSPENDED", reason })
    }
    await reviewReport(report.reportId, { status: "RESOLVED", note: reason })
    snackbar.success("社区内容已处置，举报已结案")
    closeDrawer()
    await loadReports(true)
  } finally {
    processing.value = false
  }
}

onMounted(() => loadReports(true))
</script>

<style scoped>
.reports-page {
  min-height: 100svh;
  padding: 20px;
}

.reports-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 50px;
  gap: 20px;
}

.reports-header h1 {
  margin: 0;
  font-size: 22px;
  line-height: 1.3;
}

.reports-header span {
  display: block;
  margin-top: 5px;
  color: #7b8582;
  font-size: 13px;
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
  padding: 0 18px;
  border-radius: 4px;
  cursor: pointer;
}

.query-button {
  border: 1px solid var(--color-admin-accent);
  background: var(--color-admin-accent);
  color: #fff;
}

.reset-button,
.refresh-button {
  border: 1px solid #cfd7da;
  background: #fff;
  color: #5e696c;
}

.refresh-button .app-icon {
  font-size: 16px;
}

.query-bar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin: 18px 0;
  padding: 14px 16px;
  border: 1px solid #e0e6e8;
  background: #fff;
}

.query-bar label {
  display: grid;
  gap: 6px;
}

.query-bar label > span {
  color: #687477;
  font-size: 12px;
}

.query-bar input,
.query-bar select {
  height: 38px;
  padding: 0 10px;
  border: 1px solid #ced7da;
  border-radius: 3px;
  background: #fff;
  color: #3f4a4c;
}

.query-bar select {
  min-width: 140px;
}

.keyword-field {
  width: min(300px, 28vw);
}

.query-bar p {
  display: inline-flex;
  align-items: center;
  align-self: center;
  gap: 5px;
  margin: 18px 0 0 auto;
  color: #7b8587;
  font-size: 12px;
}

.report-table-wrap {
  overflow: hidden;
  border: 1px solid #dfe5e7;
  background: #fff;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.report-table th {
  padding: 12px 14px;
  border-bottom: 1px solid #e2e6e4;
  background: #edf1f5;
  color: #778184;
  font-size: 12px;
  font-weight: 600;
}

.report-table td {
  max-width: 280px;
  padding: 12px 14px;
  border-bottom: 1px solid #e7ecee;
  color: #5e6966;
  font-size: 13px;
}

.report-table tbody tr {
  cursor: pointer;
  transition: background-color 160ms ease;
}

.report-table tbody tr:hover {
  background: #f2fbfb;
}

.open-report {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #6b7774;
  cursor: pointer;
}

.open-report:hover,
.open-report:focus-visible {
  background: #eaf3ef;
  color: #347663;
  outline: none;
}

.report-table td strong,
.report-table td small {
  display: block;
}

.report-table td strong {
  overflow: hidden;
  color: #273431;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-table td small {
  overflow: hidden;
  margin-top: 0.35rem;
  color: #919996;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.34rem 0.55rem;
  border-radius: 999px;
  background: #eef1ef;
  color: #697370;
  font-size: 0.65rem;
  font-weight: 800;
  white-space: nowrap;
}

.status-chip[data-status="OPEN"] {
  background: #fff0da;
  color: #9b5b13;
}
.status-chip[data-status="IN_REVIEW"] {
  background: #e6f0ff;
  color: #32649c;
}
.status-chip[data-status="RESOLVED"] {
  background: #e1f4eb;
  color: #347663;
}
.status-chip[data-status="DISMISSED"] {
  background: #f0efee;
  color: #74706c;
}

.table-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  gap: 0.65rem;
  color: #82908c;
}

.table-state .app-icon {
  color: var(--color-echo-accent);
  font-size: 1.6rem;
}

.load-more {
  min-width: 128px;
  margin: 1.2rem auto;
  padding: 0.7rem 1rem;
}

.report-drawer-layer {
  position: fixed;
  z-index: 50;
  inset: 0;
  background: rgb(8 19 17 / 36%);
  backdrop-filter: blur(4px);
}

.report-drawer {
  position: absolute;
  inset: 0 0 0 auto;
  display: flex;
  flex-direction: column;
  width: min(560px, 100%);
  padding: 2rem;
  overflow-y: auto;
  background: #fff;
  box-shadow: -18px 0 50px rgb(7 18 15 / 16%);
}

.report-drawer > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.report-drawer h2 {
  margin: 0.85rem 0 0;
  font-size: 2rem;
  letter-spacing: -0.04em;
}

.report-drawer > header > button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid #dce2df;
  border-radius: 50%;
  background: #fff;
  color: #596562;
  cursor: pointer;
}

.report-drawer dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1.2rem;
  background: #f5f7f5;
}

.report-drawer dl div {
  min-width: 0;
}

.report-drawer dt {
  color: #89928f;
  font-size: 0.65rem;
}

.report-drawer dd {
  overflow-wrap: anywhere;
  margin: 0.35rem 0 0;
  color: #34413e;
  font-size: 0.78rem;
}

.report-details h3,
.review-note > span {
  margin: 0 0 0.65rem;
  color: #50605c;
  font-size: 0.75rem;
}

.target-snapshot {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #dce5e1;
  background: #f8faf9;
}

.snapshot-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.snapshot-heading span {
  color: #7b8783;
  font-size: 0.7rem;
}

.snapshot-heading h3 {
  margin: 0.3rem 0 0;
  font-size: 1.15rem;
}

.target-snapshot dl {
  margin: 1rem 0;
  background: #fff;
}

.snapshot-content h4 {
  margin: 1rem 0 0.3rem;
  color: #53615d;
  font-size: 0.72rem;
}

.snapshot-content p {
  margin: 0;
  color: #45524f;
  line-height: 1.65;
}

.snapshot-content details {
  margin-top: 1rem;
}

.snapshot-content pre {
  max-height: 300px;
  padding: 0.8rem;
  overflow: auto;
  background: #17201e;
  color: #e8f2ee;
  font-size: 0.7rem;
  white-space: pre-wrap;
}

.availability-chip {
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  background: #e1f4eb;
  color: #347663 !important;
  white-space: nowrap;
}

.availability-chip[data-status="TAKEN_DOWN"] {
  background: #f8e5e2;
  color: #a3483e !important;
}

.report-details p {
  margin: 0;
  color: #505d5a;
  line-height: 1.8;
}

.review-note {
  display: grid;
  margin-top: 2rem;
}

.review-note textarea {
  min-height: 120px;
  padding: 0.9rem;
  border: 1px solid #d5dcda;
  border-radius: 0.55rem;
  resize: vertical;
}

.review-note small {
  justify-self: end;
  margin-top: 0.4rem;
  color: #969e9c;
}

.report-drawer > footer {
  display: flex;
  gap: 0.7rem;
  margin-top: auto;
  padding-top: 2rem;
}

.report-drawer > footer button {
  flex: 1;
  padding: 0.82rem 0.7rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 700;
}

.secondary-action {
  border: 1px solid #cdd6d2;
  background: #fff;
  color: #56625f;
}
.dismiss-action {
  border: 1px solid #e0c9c5;
  background: #fff5f2;
  color: #9b4b40;
}
.resolve-action {
  border: 1px solid var(--color-echo-accent);
  background: var(--color-echo-accent);
  color: #fff;
}

.take-down-action {
  border: 1px solid #a3483e;
  background: #a3483e;
  color: #fff;
}

.restore-action {
  border: 1px solid #347663;
  background: #e7f4ee;
  color: #286451;
}

.spinning {
  animation: spin 0.9s linear infinite;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 220ms ease;
}

.drawer-enter-active .report-drawer,
.drawer-leave-active .report-drawer {
  transition: transform 260ms ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .report-drawer,
.drawer-leave-to .report-drawer {
  transform: translateX(100%);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .reports-page {
    padding: 16px;
  }

  .query-bar {
    flex-wrap: wrap;
  }

  .keyword-field {
    width: 260px;
  }

  .query-bar p {
    width: 100%;
    margin: 0;
  }

  .report-table-wrap {
    overflow-x: auto;
  }

  .report-table {
    min-width: 840px;
  }
}

@media (max-width: 620px) {
  .query-bar label,
  .keyword-field {
    width: 100%;
  }

  .query-bar select {
    width: 100%;
  }

  .report-drawer {
    padding: 1.2rem;
  }

  .report-drawer dl {
    grid-template-columns: 1fr;
  }

  .report-drawer > footer {
    flex-direction: column;
  }
}
</style>
