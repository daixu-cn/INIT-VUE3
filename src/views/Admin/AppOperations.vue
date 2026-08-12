<template>
  <section class="operations-page">
    <header class="page-header">
      <div>
        <h1>应用运维</h1>
        <p>统一管理 APP 维护窗口、紧急状态和站内通知广播。</p>
      </div>
      <button type="button" class="refresh" :disabled="loading" @click="load">
        <AppIcon :path="mdiRefresh" :class="{ spinning: loading }" />
        刷新
      </button>
    </header>

    <div v-if="loading && !loaded" class="loading-state">
      <AppIcon :path="mdiLoading" class="spinning" />
      正在读取运维策略…
    </div>

    <template v-else>
      <form class="policy-card maintenance-card" @submit.prevent="saveMaintenance">
        <div class="card-heading">
          <div>
            <span class="eyebrow">全局服务</span>
            <h2>系统维护</h2>
          </div>
          <span class="state-chip" :data-state="maintenanceState">{{ maintenanceStateLabel }}</span>
        </div>

        <div class="toggle-row danger-toggle">
          <div>
            <strong>紧急维护开关</strong>
            <small>开启后立即阻断 APP 业务功能，不受定时计划限制。</small>
          </div>
          <input v-model="maintenance.manualActive" type="checkbox" />
        </div>

        <div class="toggle-row">
          <div>
            <strong>启用定时维护</strong>
            <small>到达设定时间后由 SERVER 自动切换状态。</small>
          </div>
          <input v-model="maintenance.scheduleEnabled" type="checkbox" />
        </div>

        <div class="form-grid">
          <label>
            <span>弹窗提示开始时间（北京时间）</span>
            <input v-model="maintenance.noticeStartsAt" type="datetime-local" />
          </label>
          <label>
            <span>维护开始时间（北京时间）</span>
            <input v-model="maintenance.startsAt" type="datetime-local" />
          </label>
          <label>
            <span>预计结束时间（北京时间）</span>
            <input v-model="maintenance.endsAt" type="datetime-local" />
          </label>
        </div>

        <div class="copy-grid">
          <fieldset>
            <legend>中文弹窗</legend>
            <label
              ><span>标题</span><input v-model.trim="maintenance.titleZh" maxlength="80"
            /></label>
            <label>
              <span>正文</span>
              <textarea v-model.trim="maintenance.messageZh" maxlength="500" rows="4" />
            </label>
          </fieldset>
          <fieldset>
            <legend>English dialog</legend>
            <label
              ><span>Title</span><input v-model.trim="maintenance.titleEn" maxlength="80"
            /></label>
            <label>
              <span>Message</span>
              <textarea v-model.trim="maintenance.messageEn" maxlength="500" rows="4" />
            </label>
          </fieldset>
        </div>

        <footer class="card-footer">
          <small>{{ maintenanceAudit }}</small>
          <button type="submit" class="primary" :disabled="savingMaintenance">
            {{ savingMaintenance ? "保存中…" : "保存维护策略" }}
          </button>
        </footer>
      </form>

      <section class="policy-card notification-card">
        <div class="card-heading">
          <div>
            <span class="eyebrow">通知中心</span>
            <h2>通知广播</h2>
          </div>
          <span class="state-chip">仅代码模板</span>
        </div>

        <p class="card-description">
          只向确认发送时已经存在的用户广播；不支持自由文本、机器翻译、草稿或定时发布。
        </p>

        <div class="broadcast-form">
          <label>
            <span>通知模板</span>
            <select v-model="selectedTemplateKey" @change="resetNotificationForm">
              <option value="" disabled>请选择模板</option>
              <option
                v-for="template in notificationTemplates"
                :key="template.key"
                :value="template.key"
              >
                {{ template.label }} · {{ template.key }}
              </option>
            </select>
          </label>

          <div v-if="selectedTemplate" class="form-grid dynamic-fields">
            <label v-for="field in selectedTemplate.fields" :key="field.key">
              <span>{{ field.label }}</span>
              <select v-if="field.type === 'ENUM'" v-model="notificationVariables[field.key]">
                <option value="" disabled>请选择</option>
                <option v-for="option in field.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <input v-else v-model="notificationVariables[field.key]" type="datetime-local" />
            </label>
          </div>

          <div class="broadcast-actions">
            <button
              type="button"
              class="refresh"
              :disabled="!notificationFormValid || previewing"
              @click="previewBroadcast"
            >
              {{ previewing ? "生成中…" : "预览五种语言" }}
            </button>
            <button
              type="button"
              class="primary"
              :disabled="!notificationPreview || sendingBroadcast"
              @click="sendBroadcast"
            >
              {{ sendingBroadcast ? "发送中…" : "确认并立即广播" }}
            </button>
          </div>
        </div>

        <div v-if="notificationPreview" class="preview-grid">
          <article v-for="locale in notificationLocales" :key="locale">
            <strong>{{ localeLabels[locale] }}</strong>
            <h3>{{ notificationPreview[locale].title }}</h3>
            <p>{{ notificationPreview[locale].body }}</p>
          </article>
        </div>

        <div class="history-heading">
          <h3>最近发送</h3>
          <small>成功数量包含已由幂等键确认存在的通知记录。</small>
        </div>
        <div v-if="!notificationBroadcasts.length" class="empty-history">尚无广播记录</div>
        <div v-else class="history-table-wrap">
          <table>
            <thead>
              <tr>
                <th>模板</th>
                <th>创建时间</th>
                <th>管理员</th>
                <th>预计 / 成功 / 失败</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in notificationBroadcasts" :key="item.notificationDispatchTaskId">
                <td>
                  <code>{{ item.templateKey }}</code>
                </td>
                <td>{{ formatShanghai(item.createdAt) }}</td>
                <td>{{ item.createdByUserId || "—" }}</td>
                <td>
                  {{ item.expectedRecipientCount ?? "—" }} / {{ item.deliveredCount }} /
                  {{ item.failedCount }}
                </td>
                <td>
                  <span class="state-chip" :data-state="item.status">{{
                    broadcastStatusLabel(item.status)
                  }}</span>
                  <small v-if="item.errorCode" class="task-error">{{ item.errorCode }}</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { mdiLoading, mdiRefresh } from "@mdi/js"
import { computed, onMounted, reactive, ref, watch } from "vue"

import AppIcon from "@/components/AppIcon.vue"
import { getAppOperations, updateMaintenance } from "@/server/api/app-operations"
import {
  listNotificationBroadcasts,
  listNotificationTemplates,
  previewNotification,
  sendNotificationBroadcast,
} from "@/server/api/notifications"
import { snackbar } from "@/tools/snackbar"

type MaintenanceForm = Omit<
  Model.AppOperations.MaintenancePolicy,
  "noticeStartsAt" | "startsAt" | "endsAt"
> & {
  noticeStartsAt: string
  startsAt: string
  endsAt: string
}

const loading = ref(false)
const loaded = ref(false)
const savingMaintenance = ref(false)
const previewing = ref(false)
const sendingBroadcast = ref(false)
const notificationTemplates = ref<Model.Notification.Template[]>([])
const notificationBroadcasts = ref<Model.Notification.Broadcast[]>([])
const selectedTemplateKey = ref("")
const notificationVariables = reactive<Record<string, string>>({})
const notificationPreview = ref<Model.Notification.Preview | null>(null)
const notificationLocales: Model.Notification.Locale[] = [
  "zh_CN",
  "zh_TW",
  "en_US",
  "ja_JP",
  "de_DE",
]
const localeLabels: Record<Model.Notification.Locale, string> = {
  zh_CN: "简体中文",
  zh_TW: "繁體中文",
  en_US: "English",
  ja_JP: "日本語",
  de_DE: "Deutsch",
}

const maintenance = reactive<MaintenanceForm>({
  scheduleEnabled: false,
  manualActive: false,
  noticeStartsAt: "",
  startsAt: "",
  endsAt: "",
  titleZh: "服务升级通知",
  messageZh: "服务升级期间所有功能将暂停使用。",
  titleEn: "Service maintenance",
  messageEn: "All features will be unavailable during the maintenance window.",
  updatedByUserId: null,
  updatedAt: "",
})

const maintenanceState = computed(() => {
  if (maintenance.manualActive) return "ACTIVE"
  if (!maintenance.scheduleEnabled) return "NORMAL"
  const now = Date.now()
  const startsAt = fromShanghaiInput(maintenance.startsAt)?.getTime()
  const endsAt = fromShanghaiInput(maintenance.endsAt)?.getTime()
  const noticeAt = fromShanghaiInput(maintenance.noticeStartsAt)?.getTime()
  if (startsAt && endsAt && now >= startsAt && now < endsAt) return "ACTIVE"
  if (noticeAt && startsAt && now >= noticeAt && now < startsAt) return "SCHEDULED"
  return "NORMAL"
})
const maintenanceStateLabel = computed(
  () => ({ ACTIVE: "维护中", SCHEDULED: "预告中", NORMAL: "正常" })[maintenanceState.value],
)
const maintenanceAudit = computed(() =>
  auditText(maintenance.updatedByUserId, maintenance.updatedAt),
)
const selectedTemplate = computed(() =>
  notificationTemplates.value.find(item => item.key === selectedTemplateKey.value),
)
const notificationFormValid = computed(() =>
  Boolean(
    selectedTemplate.value &&
    selectedTemplate.value.fields.every(field => notificationVariables[field.key]?.trim()),
  ),
)

onMounted(load)
watch(notificationVariables, () => (notificationPreview.value = null))

async function load() {
  if (loading.value) return
  loading.value = true
  try {
    const [operations, templates, broadcasts] = await Promise.all([
      getAppOperations(),
      listNotificationTemplates(),
      listNotificationBroadcasts(),
    ])
    hydrate(operations.data)
    notificationTemplates.value = templates.data
    notificationBroadcasts.value = broadcasts.data
    loaded.value = true
  } finally {
    loading.value = false
  }
}

function resetNotificationForm() {
  for (const key of Object.keys(notificationVariables)) delete notificationVariables[key]
  for (const field of selectedTemplate.value?.fields ?? []) {
    notificationVariables[field.key] =
      field.type === "ENUM" ? (field.options?.[0]?.value ?? "") : ""
  }
  notificationPreview.value = null
}

function notificationPayload(): Model.Notification.BroadcastPayload {
  const variables = Object.fromEntries(
    (selectedTemplate.value?.fields ?? []).map(field => [
      field.key,
      field.type === "DATETIME"
        ? new Date(notificationVariables[field.key]).toISOString()
        : notificationVariables[field.key],
    ]),
  )
  return { templateKey: selectedTemplateKey.value, variables }
}

async function previewBroadcast() {
  if (!notificationFormValid.value) return
  previewing.value = true
  try {
    notificationPreview.value = (await previewNotification(notificationPayload())).data
  } finally {
    previewing.value = false
  }
}

async function sendBroadcast() {
  if (!notificationPreview.value || !notificationFormValid.value) return
  if (!window.confirm("确认立即向当前全部用户发送这条五语模板通知？发送后不可撤回。")) return
  sendingBroadcast.value = true
  try {
    await sendNotificationBroadcast(notificationPayload())
    snackbar.success("广播任务已创建，Worker 正在分批发送。")
    notificationBroadcasts.value = (await listNotificationBroadcasts()).data
    notificationPreview.value = null
  } finally {
    sendingBroadcast.value = false
  }
}

function broadcastStatusLabel(status: Model.Notification.Broadcast["status"]) {
  return { PENDING: "等待中", PROCESSING: "发送中", COMPLETED: "已完成" }[status]
}

function hydrate(data: Model.AppOperations.Data) {
  Object.assign(maintenance, {
    ...data.maintenance,
    noticeStartsAt: toShanghaiInput(data.maintenance.noticeStartsAt),
    startsAt: toShanghaiInput(data.maintenance.startsAt),
    endsAt: toShanghaiInput(data.maintenance.endsAt),
  })
}

async function saveMaintenance() {
  if (maintenance.scheduleEnabled && !validSchedule()) {
    return snackbar.error("请确保提示时间 ≤ 维护开始时间 < 维护结束时间。")
  }
  if (
    !window.confirm(
      maintenance.manualActive
        ? "确认保存？紧急维护开关将立即影响 APP 用户。"
        : "确认保存当前维护策略？",
    )
  )
    return
  savingMaintenance.value = true
  try {
    await updateMaintenance({
      scheduleEnabled: maintenance.scheduleEnabled,
      manualActive: maintenance.manualActive,
      noticeStartsAt: toIso(maintenance.noticeStartsAt),
      startsAt: toIso(maintenance.startsAt),
      endsAt: toIso(maintenance.endsAt),
      titleZh: maintenance.titleZh,
      messageZh: maintenance.messageZh,
      titleEn: maintenance.titleEn,
      messageEn: maintenance.messageEn,
    })
    snackbar.success("维护策略已生效。")
    await load()
  } finally {
    savingMaintenance.value = false
  }
}

function validSchedule() {
  const notice = fromShanghaiInput(maintenance.noticeStartsAt)?.getTime()
  const start = fromShanghaiInput(maintenance.startsAt)?.getTime()
  const end = fromShanghaiInput(maintenance.endsAt)?.getTime()
  return Boolean(notice && start && end && notice <= start && start < end)
}

function auditText(userId: string | null, updatedAt: string) {
  if (!updatedAt) return "尚未修改"
  return `最后修改：${formatShanghai(updatedAt)}${userId ? ` · ${userId}` : ""}`
}

function toShanghaiInput(value: string | null) {
  if (!value) return ""
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(item => item.type === type)?.value ?? ""
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`
}

function fromShanghaiInput(value: string) {
  return value ? new Date(`${value}:00+08:00`) : null
}

function toIso(value: string) {
  return fromShanghaiInput(value)?.toISOString() ?? null
}

function formatShanghai(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}
</script>

<style scoped>
.operations-page {
  padding: 28px;
}
.page-header,
.card-heading,
.card-footer,
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.page-header {
  margin-bottom: 22px;
}
.page-header h1,
.card-heading h2 {
  margin: 0;
  color: #273334;
}
.page-header p {
  margin: 6px 0 0;
  color: #788487;
  font-size: 14px;
}
.refresh,
.primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 700;
}
.refresh {
  border: 1px solid #d9e1e2;
  background: #fff;
  color: #536164;
}
.primary {
  background: #168e93;
  color: #fff;
}
button:disabled {
  cursor: wait;
  opacity: 0.6;
}
.loading-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 6px;
}
.loading-state {
  min-height: 180px;
  justify-content: center;
  color: #738083;
}
.policy-card {
  margin-bottom: 22px;
  padding: 24px;
  border: 1px solid #dde4e5;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 5px 18px rgb(43 65 69 / 5%);
}
.card-heading {
  margin-bottom: 22px;
}
.eyebrow {
  display: block;
  margin-bottom: 4px;
  color: #168e93;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.state-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: #e8f5f2;
  color: #237a69;
  font-size: 12px;
  font-weight: 800;
}
.state-chip[data-state="ACTIVE"] {
  background: #fdeaea;
  color: #b23d3d;
}
.state-chip[data-state="SCHEDULED"] {
  background: #fff4d8;
  color: #8d6816;
}
.toggle-row {
  margin: 14px 0;
  padding: 15px 16px;
  border: 1px solid #e5eaeb;
  border-radius: 6px;
  background: #fafcfc;
}
.danger-toggle {
  border-color: #f0cccc;
  background: #fff8f8;
}
.toggle-row div {
  display: grid;
  gap: 4px;
}
.toggle-row small,
.card-footer small {
  color: #828d8f;
}
.toggle-row input {
  width: 20px;
  height: 20px;
  accent-color: #168e93;
}
.form-grid,
.copy-grid {
  display: grid;
  gap: 16px;
}
.form-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 20px 0;
}
.copy-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 20px;
}
label {
  display: grid;
  gap: 7px;
  color: #536164;
  font-size: 13px;
  font-weight: 700;
}
input,
textarea,
select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d9e1e2;
  border-radius: 5px;
  background: #fff;
  color: #263234;
  font: inherit;
}
input {
  min-height: 42px;
  padding: 0 12px;
}
textarea {
  resize: vertical;
  padding: 11px 12px;
  line-height: 1.55;
}
input:focus,
textarea:focus,
select:focus {
  border-color: #168e93;
  outline: 2px solid rgb(22 142 147 / 12%);
}
.card-description {
  margin: -8px 0 22px;
  color: #738083;
  font-size: 14px;
  line-height: 1.65;
}
.broadcast-form {
  display: grid;
  gap: 18px;
}
.dynamic-fields {
  margin: 0;
}
.broadcast-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 22px;
}
.preview-grid article {
  padding: 16px;
  border: 1px solid #e1e7e8;
  border-radius: 6px;
  background: #fafcfc;
}
.preview-grid strong {
  color: #168e93;
  font-size: 12px;
}
.preview-grid h3 {
  margin: 10px 0 6px;
  color: #273334;
  font-size: 16px;
}
.preview-grid p {
  margin: 0;
  color: #657275;
  font-size: 14px;
  line-height: 1.55;
}
.history-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #edf0f1;
}
.history-heading h3 {
  margin: 0;
}
.history-heading small,
.empty-history {
  color: #828d8f;
}
.empty-history {
  padding: 30px 0 10px;
  text-align: center;
}
.history-table-wrap {
  overflow-x: auto;
  margin-top: 14px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th,
td {
  padding: 12px 10px;
  border-bottom: 1px solid #edf0f1;
  text-align: left;
  white-space: nowrap;
}
th {
  color: #697679;
  font-size: 12px;
}
code {
  color: #536164;
}
.task-error {
  display: block;
  max-width: 260px;
  margin-top: 6px;
  overflow: hidden;
  color: #b23d3d;
  text-overflow: ellipsis;
}
fieldset {
  min-width: 0;
  margin: 0;
  padding: 16px;
  border: 1px solid #e1e7e8;
  border-radius: 6px;
}
fieldset label + label {
  margin-top: 13px;
}
legend {
  padding: 0 7px;
  color: #168e93;
  font-size: 13px;
  font-weight: 800;
}
.card-footer {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #edf0f1;
}
.spinning {
  animation: spin 800ms linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 760px) {
  .operations-page {
    padding: 18px 14px;
  }
  .page-header,
  .card-footer {
    align-items: stretch;
    flex-direction: column;
  }
  .page-header .refresh,
  .card-footer .primary {
    width: 100%;
  }
  .policy-card {
    padding: 18px 14px;
  }
  .form-grid,
  .copy-grid {
    grid-template-columns: 1fr;
  }
  .broadcast-actions,
  .history-heading {
    align-items: stretch;
    flex-direction: column;
  }
  .broadcast-actions button {
    width: 100%;
  }
  .toggle-row {
    align-items: flex-start;
  }
}
</style>
