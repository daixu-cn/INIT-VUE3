<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>系统表情</h1>
        <p>全局目录 revision {{ catalogRevision }}。发布与下架会在下一次角色生成中立即生效。</p>
      </div>
      <button type="button" :disabled="loading" @click="load">
        {{ loading ? "刷新中…" : "刷新" }}
      </button>
    </header>

    <form class="create-panel" @submit.prevent="createSticker">
      <label
        >稳定编码<input v-model.trim="createForm.code" required placeholder="CUTE_HUG"
      /></label>
      <label>排序<input v-model.number="createForm.sortOrder" type="number" /></label>
      <label class="file-field"
        >图片<input
          ref="createFileInput"
          type="file"
          accept="image/png,image/webp,image/gif"
          required
          @change="selectCreateFile"
      /></label>
      <button type="submit" :disabled="processing || !createFile">建立草稿并上传</button>
    </form>

    <div v-if="uploadProgress !== null" class="progress" role="status">
      <span :style="{ width: `${Math.round(uploadProgress * 100)}%` }"></span>
      <strong>{{ uploadLabel }} {{ Math.round(uploadProgress * 100) }}%</strong>
    </div>

    <div class="filters">
      <label>搜索<input v-model.trim="query" placeholder="编码或语义" @keyup.enter="load" /></label>
      <label
        >状态<select v-model="status" @change="load">
          <option value="">全部</option>
          <option v-for="item in statuses" :key="item" :value="item">{{ item }}</option>
        </select></label
      >
      <button type="button" @click="load">查询</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>预览</th>
            <th>编码</th>
            <th>状态</th>
            <th>当前版本</th>
            <th>语义</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sticker in items" :key="sticker.systemStickerId">
            <td>
              <img
                v-if="mediaUrl(sticker.currentRevision?.posterMedia)"
                class="thumb"
                :src="mediaUrl(sticker.currentRevision?.posterMedia)"
                :alt="sticker.currentRevision?.localizedMetadata?.zh_CN?.alt || sticker.code"
              />
              <span v-else class="thumb-empty">草稿</span>
            </td>
            <td>
              <strong>{{ sticker.code }}</strong
              ><code>{{ sticker.systemStickerId }}</code>
            </td>
            <td>
              <span class="chip" :data-status="sticker.status">{{ sticker.status }}</span>
            </td>
            <td>
              {{
                sticker.currentRevision ? `v${sticker.currentRevision.revisionNumber}` : "未发布"
              }}
            </td>
            <td class="semantic">{{ sticker.currentRevision?.semanticText || "—" }}</td>
            <td>{{ formatTime(sticker.updatedAt) }}</td>
            <td class="actions">
              <button type="button" @click="openHistory(sticker)">版本历史</button>
              <label class="button-label"
                >替换版本<input
                  type="file"
                  accept="image/png,image/webp,image/gif"
                  :disabled="processing"
                  @change="event => createReplacement(sticker, event)"
              /></label>
              <button
                v-if="sticker.status !== 'HIDDEN'"
                type="button"
                :disabled="processing"
                @click="hide(sticker)"
              >
                隐藏
              </button>
              <button
                v-if="sticker.status !== 'BLOCKED'"
                type="button"
                class="danger"
                :disabled="processing"
                @click="block(sticker)"
              >
                安全封禁
              </button>
            </td>
          </tr>
          <tr v-if="!loading && items.length === 0">
            <td colspan="7" class="empty">没有符合条件的表情。</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination">
      <span>共 {{ total }} 个</span>
      <button type="button" :disabled="page <= 1 || loading" @click="changePage(page - 1)">
        上一页
      </button>
      <strong>{{ page }}</strong>
      <button
        type="button"
        :disabled="page * pageSize >= total || loading"
        @click="changePage(page + 1)"
      >
        下一页
      </button>
    </footer>

    <div v-if="selectedSticker" class="overlay" @click.self="closeHistory">
      <section class="dialog" role="dialog" aria-modal="true" aria-label="表情版本历史">
        <header>
          <div>
            <h2>{{ selectedSticker.code }} 版本历史</h2>
            <p>发布版本不可变；修改媒体或语义请建立新版本。</p>
          </div>
          <button type="button" @click="closeHistory">关闭</button>
        </header>

        <div class="dialog-body">
          <nav class="revision-list" aria-label="版本列表">
            <button
              v-for="revision in revisions"
              :key="revision.systemStickerRevisionId"
              type="button"
              :class="{
                active:
                  revision.systemStickerRevisionId === editingRevision?.systemStickerRevisionId,
              }"
              @click="editRevision(revision)"
            >
              <strong>v{{ revision.revisionNumber }}</strong>
              <span>{{ revision.publishedAt ? "已发布" : revision.annotationStatus }}</span>
              <small>{{ formatTime(revision.createdAt) }}</small>
            </button>
          </nav>

          <div v-if="editingRevision" class="revision-detail">
            <div class="preview-grid">
              <figure>
                <figcaption>无限循环预览</figcaption>
                <img
                  v-if="mediaUrl(editingRevision.media)"
                  :src="mediaUrl(editingRevision.media)"
                  :alt="metadata.localizedMetadata.zh_CN.alt"
                />
                <div v-else class="preview-empty">等待媒体分析</div>
              </figure>
              <figure>
                <figcaption>静态首帧</figcaption>
                <img
                  v-if="mediaUrl(editingRevision.posterMedia)"
                  :src="mediaUrl(editingRevision.posterMedia)"
                  :alt="metadata.localizedMetadata.zh_CN.alt"
                />
                <div v-else class="preview-empty">等待首帧</div>
              </figure>
              <dl>
                <div>
                  <dt>尺寸</dt>
                  <dd>{{ dimensions(editingRevision) }}</dd>
                </div>
                <div>
                  <dt>帧数</dt>
                  <dd>{{ editingRevision.frameCount ?? "—" }}</dd>
                </div>
                <div>
                  <dt>单轮时长</dt>
                  <dd>{{ duration(editingRevision) }}</dd>
                </div>
                <div>
                  <dt>审核</dt>
                  <dd>{{ editingRevision.moderationStatus }}</dd>
                </div>
                <div>
                  <dt>AI 标注</dt>
                  <dd>{{ editingRevision.annotationStatus }}</dd>
                </div>
                <div>
                  <dt>向量</dt>
                  <dd>{{ embeddingStatus(editingRevision) }}</dd>
                </div>
              </dl>
            </div>

            <div class="revision-actions">
              <button
                type="button"
                :disabled="
                  processing ||
                  Boolean(editingRevision.publishedAt) ||
                  Boolean(editingRevision.media) ||
                  editingRevision.annotationStatus === 'BLOCKED'
                "
                @click="analyze"
              >
                {{
                  editingRevision.annotationStatus === "FAILED" ? "重试分析" : "处理媒体并 AI 标注"
                }}
              </button>
              <button
                type="button"
                :disabled="processing || !canConfirmMetadata"
                @click="confirmMetadata"
              >
                确认语义并生成向量
              </button>
              <button
                type="button"
                class="primary"
                :disabled="processing || !canPublish"
                @click="publish"
              >
                发布此版本
              </button>
            </div>

            <form class="metadata-form" @submit.prevent="confirmMetadata">
              <label class="wide"
                >语义描述<textarea v-model.trim="metadata.semanticText" rows="3" required />
              </label>
              <label>情绪<input v-model.trim="metadata.emotion" required /></label>
              <label>表达意图<input v-model.trim="metadata.expressionIntent" required /></label>
              <label>关系语气<input v-model.trim="metadata.relationshipTone" required /></label>
              <label
                >强度<input
                  v-model.number="metadata.intensity"
                  type="number"
                  min="1"
                  max="5"
                  required
              /></label>
              <label class="wide"
                >搜索标签（逗号分隔）<input v-model="metadata.searchTags"
              /></label>
              <label class="wide">适用场景（逗号分隔）<input v-model="metadata.scenarios" /></label>
              <fieldset v-for="locale in locales" :key="locale">
                <legend>{{ locale }}</legend>
                <label
                  >名称<input v-model.trim="metadata.localizedMetadata[locale].name" required
                /></label>
                <label
                  >描述<input
                    v-model.trim="metadata.localizedMetadata[locale].description"
                    required
                /></label>
                <label
                  >无障碍文本<input v-model.trim="metadata.localizedMetadata[locale].alt" required
                /></label>
              </fieldset>
            </form>
          </div>
          <div v-else class="empty">正在加载版本…</div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRaw } from "vue"

import {
  analyzeSystemSticker,
  blockSystemSticker,
  createSystemSticker,
  createSystemStickerRevision,
  getSystemStickerMediaAccess,
  getSystemStickerRevisions,
  getSystemStickers,
  hideSystemSticker,
  publishSystemSticker,
  updateSystemStickerMetadata,
  uploadSystemStickerContent,
} from "@/server/api/system-stickers"
import { snackbar } from "@/tools/snackbar"

const statuses: Model.SystemSticker.Status[] = [
  "DRAFT",
  "PROCESSING",
  "ACTIVE",
  "HIDDEN",
  "BLOCKED",
]
const locales = ["zh_CN", "zh_TW", "en_US", "ja_JP", "de_DE"] as const
type Locale = (typeof locales)[number]

const items = ref<Model.SystemSticker.Sticker[]>([])
const catalogRevision = ref(0)
const total = ref(0)
const page = ref(1)
const pageSize = 30
const query = ref("")
const status = ref("")
const loading = ref(false)
const processing = ref(false)
const createFileInput = ref<HTMLInputElement>()
const createFile = ref<File>()
const uploadProgress = ref<number | null>(null)
const uploadLabel = ref("")
const createForm = reactive({ code: "", sortOrder: 0 })
const mediaUrls = reactive<Record<string, string>>({})
const selectedSticker = ref<Model.SystemSticker.Sticker>()
const revisions = ref<Model.SystemSticker.Revision[]>([])
const editingRevision = ref<Model.SystemSticker.Revision>()

function blankLocalized(): Record<Locale, Model.SystemSticker.LocalizedMetadata> {
  return Object.fromEntries(
    locales.map(locale => [locale, { name: "", description: "", alt: "" }]),
  ) as Record<Locale, Model.SystemSticker.LocalizedMetadata>
}

const metadata = reactive({
  semanticText: "",
  emotion: "",
  expressionIntent: "",
  relationshipTone: "",
  intensity: 1,
  searchTags: "",
  scenarios: "",
  localizedMetadata: blankLocalized(),
})

const canConfirmMetadata = computed(
  () =>
    Boolean(editingRevision.value?.media) &&
    !editingRevision.value?.publishedAt &&
    metadata.semanticText.trim().length > 0 &&
    metadata.emotion.trim().length > 0 &&
    metadata.expressionIntent.trim().length > 0 &&
    metadata.relationshipTone.trim().length > 0 &&
    locales.every(locale => Object.values(metadata.localizedMetadata[locale]).every(Boolean)),
)
const canPublish = computed(() => {
  const revision = editingRevision.value
  if (!revision || revision.publishedAt) return false
  return (
    revision.moderationStatus === "APPROVED" &&
    revision.annotationStatus === "COMPLETED" &&
    Boolean(revision.metadataConfirmedAt) &&
    Boolean(revision.contentHash && revision.semanticContentHash) &&
    revision.embeddings.some(
      item => item.status === "COMPLETED" && item.contentHash === revision.semanticContentHash,
    )
  )
})

onMounted(load)

async function load() {
  loading.value = true
  try {
    const response = await getSystemStickers({
      page: page.value,
      pageSize,
      query: query.value || undefined,
      status: status.value || undefined,
    })
    items.value = response.data.items
    total.value = response.data.total
    catalogRevision.value = response.data.catalogRevision
    await primePreviews(items.value.map(item => item.currentRevision).filter(Boolean))
  } finally {
    loading.value = false
  }
}

function changePage(next: number) {
  page.value = next
  void load()
}

function selectCreateFile(event: Event) {
  createFile.value = (event.target as HTMLInputElement).files?.[0]
}

function descriptor(file: File): Model.SystemSticker.UploadDescriptor | null {
  if (!["image/png", "image/webp", "image/gif"].includes(file.type)) {
    snackbar.error("只支持 PNG、WebP、GIF；服务端还会校验真实文件签名。")
    return null
  }
  const animatedLimit = 10 * 1024 * 1024
  const staticLimit = 4 * 1024 * 1024
  if (file.size <= 0 || file.size > animatedLimit) {
    snackbar.error("文件必须小于或等于 10 MiB。静图的 4 MiB 限制会由服务端严格校验。")
    return null
  }
  if (file.type === "image/png" && file.size > staticLimit) {
    snackbar.error("静态 PNG 必须小于或等于 4 MiB。")
    return null
  }
  return {
    filename: file.name,
    mimeType: file.type as Model.SystemSticker.UploadDescriptor["mimeType"],
    byteLength: file.size,
  }
}

async function createSticker() {
  const file = createFile.value
  const uploadDescriptor = file ? descriptor(file) : null
  if (!file || !uploadDescriptor || !/^[A-Z][A-Z0-9_]{1,63}$/.test(createForm.code.toUpperCase())) {
    if (file && uploadDescriptor) snackbar.error("编码必须是 2–64 位大写字母、数字或下划线。")
    return
  }
  processing.value = true
  try {
    const created = await createSystemSticker({
      ...uploadDescriptor,
      code: createForm.code.toUpperCase(),
      sortOrder: createForm.sortOrder,
    })
    await upload(
      created.data.sticker.systemStickerId,
      created.data.revision.systemStickerRevisionId,
      file,
      `上传 ${createForm.code.toUpperCase()}`,
    )
    createForm.code = ""
    createForm.sortOrder = 0
    createFile.value = undefined
    if (createFileInput.value) createFileInput.value.value = ""
    snackbar.success("草稿和源文件已建立，请进入版本历史执行媒体处理与 AI 标注。")
    await load()
  } finally {
    processing.value = false
    uploadProgress.value = null
  }
}

async function createReplacement(sticker: Model.SystemSticker.Sticker, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  const uploadDescriptor = file ? descriptor(file) : null
  input.value = ""
  if (!file || !uploadDescriptor) return
  processing.value = true
  try {
    const created = await createSystemStickerRevision(sticker.systemStickerId, uploadDescriptor)
    await upload(
      sticker.systemStickerId,
      created.data.systemStickerRevisionId,
      file,
      `上传 ${sticker.code} 替换版本`,
    )
    snackbar.success("替换版本已上传，当前线上版本未受影响。")
    await openHistory(sticker, created.data.systemStickerRevisionId)
  } finally {
    processing.value = false
    uploadProgress.value = null
  }
}

async function upload(stickerId: string, revisionId: string, file: File, label: string) {
  uploadLabel.value = label
  uploadProgress.value = 0
  await uploadSystemStickerContent(stickerId, revisionId, file, value => {
    uploadProgress.value = Math.max(uploadProgress.value ?? 0, value)
  })
  uploadProgress.value = 1
}

async function openHistory(sticker: Model.SystemSticker.Sticker, preferredRevisionId?: string) {
  selectedSticker.value = sticker
  const response = await getSystemStickerRevisions(sticker.systemStickerId)
  revisions.value = response.data
  await primePreviews(revisions.value)
  editRevision(
    revisions.value.find(item => item.systemStickerRevisionId === preferredRevisionId) ??
      revisions.value[0],
  )
}

function closeHistory() {
  selectedSticker.value = undefined
  editingRevision.value = undefined
  revisions.value = []
}

function editRevision(revision?: Model.SystemSticker.Revision) {
  editingRevision.value = revision
  if (!revision) return
  metadata.semanticText = revision.semanticText ?? ""
  metadata.emotion = revision.emotion ?? ""
  metadata.expressionIntent = revision.expressionIntent ?? ""
  metadata.relationshipTone = revision.relationshipTone ?? ""
  metadata.intensity = revision.intensity ?? 1
  metadata.searchTags = (revision.searchTags ?? []).join(", ")
  metadata.scenarios = (revision.applicableScenarios ?? []).join(", ")
  metadata.localizedMetadata = blankLocalized()
  for (const locale of locales) {
    Object.assign(metadata.localizedMetadata[locale], revision.localizedMetadata?.[locale] ?? {})
  }
}

async function refreshHistory(preferredRevisionId?: string) {
  if (!selectedSticker.value) return
  await openHistory(selectedSticker.value, preferredRevisionId)
  await load()
}

async function analyze() {
  const sticker = selectedSticker.value
  const revision = editingRevision.value
  if (!sticker || !revision) return
  processing.value = true
  try {
    await analyzeSystemSticker(sticker.systemStickerId, revision.systemStickerRevisionId)
    snackbar.success("媒体已规范化为 WebP，首帧、审核结果和 AI 标注已生成。")
    await refreshHistory(revision.systemStickerRevisionId)
  } finally {
    processing.value = false
  }
}

async function confirmMetadata() {
  const sticker = selectedSticker.value
  const revision = editingRevision.value
  if (!sticker || !revision || !canConfirmMetadata.value) return
  processing.value = true
  try {
    await updateSystemStickerMetadata(sticker.systemStickerId, revision.systemStickerRevisionId, {
      semanticText: metadata.semanticText,
      emotion: metadata.emotion,
      expressionIntent: metadata.expressionIntent,
      relationshipTone: metadata.relationshipTone,
      intensity: metadata.intensity,
      searchTags: splitList(metadata.searchTags),
      applicableScenarios: splitList(metadata.scenarios),
      localizedMetadata: structuredClone(toRaw(metadata.localizedMetadata)),
      confirmed: true,
    })
    snackbar.success("语义已确认，实时选择所需的 embedding 已生成。")
    await refreshHistory(revision.systemStickerRevisionId)
  } finally {
    processing.value = false
  }
}

async function publish() {
  const sticker = selectedSticker.value
  const revision = editingRevision.value
  if (!sticker || !revision || !canPublish.value) return
  if (
    !window.confirm(`确认发布 ${sticker.code} v${revision.revisionNumber}？下一次生成将立即可选。`)
  )
    return
  processing.value = true
  try {
    const response = await publishSystemSticker(
      sticker.systemStickerId,
      revision.systemStickerRevisionId,
    )
    catalogRevision.value = response.data.catalogRevision
    snackbar.success(`已发布，目录 revision ${response.data.catalogRevision}。`)
    await refreshHistory(revision.systemStickerRevisionId)
  } finally {
    processing.value = false
  }
}

async function hide(sticker: Model.SystemSticker.Sticker) {
  if (!window.confirm(`隐藏 ${sticker.code}？历史消息仍可展示，但下一次生成将不再选择。`)) return
  processing.value = true
  try {
    await hideSystemSticker(sticker.systemStickerId)
    snackbar.success("已隐藏；操作等价于普通删除，不会物理删除历史媒体。")
    await load()
  } finally {
    processing.value = false
  }
}

async function block(sticker: Model.SystemSticker.Sticker) {
  if (!window.confirm(`安全封禁 ${sticker.code}？历史消息将撤销媒体并显示回退文本。`)) return
  processing.value = true
  try {
    await blockSystemSticker(sticker.systemStickerId)
    snackbar.success("已安全封禁。")
    await load()
  } finally {
    processing.value = false
  }
}

async function primePreviews(values: Array<Model.SystemSticker.Revision | null | undefined>) {
  const media = values.flatMap(item => (item ? [item.media, item.posterMedia] : [])).filter(Boolean)
  await Promise.all(media.map(item => ensureMediaUrl(item!)))
}

async function ensureMediaUrl(media: Model.SystemSticker.Media) {
  if (mediaUrls[media.mediaAssetId]) return
  try {
    mediaUrls[media.mediaAssetId] = (await getSystemStickerMediaAccess(media.mediaAssetId)).data.url
  } catch {
    // A revoked or incomplete asset intentionally renders as an empty preview.
  }
}

function mediaUrl(media?: Model.SystemSticker.Media | null) {
  return media ? mediaUrls[media.mediaAssetId] : undefined
}

function splitList(value: string) {
  return value
    .split(/[,，]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function dimensions(revision: Model.SystemSticker.Revision) {
  return revision.width && revision.height ? `${revision.width} × ${revision.height}` : "—"
}

function duration(revision: Model.SystemSticker.Revision) {
  return revision.cycleDurationMs == null
    ? "—"
    : `${(revision.cycleDurationMs / 1000).toFixed(2)} 秒`
}

function embeddingStatus(revision: Model.SystemSticker.Revision) {
  return revision.embeddings[0]?.status ?? "缺失"
}

function formatTime(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(value),
      )
    : "—"
}
</script>

<style scoped>
.page {
  padding: 28px;
  color: #2b3738;
}
.page-header,
.filters,
.create-panel,
.dialog > header,
.revision-actions,
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-header {
  justify-content: space-between;
  margin-bottom: 18px;
}
h1,
h2,
p {
  margin: 0;
}
.page-header p,
.dialog header p {
  margin-top: 6px;
  color: #738083;
}
button,
.button-label {
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid #d7dfe0;
  border-radius: 5px;
  background: #fff;
  color: #526063;
  cursor: pointer;
  font: inherit;
}
button:disabled {
  cursor: wait;
  opacity: 0.5;
}
button.primary {
  border-color: var(--color-admin-accent);
  background: var(--color-admin-accent);
  color: #fff;
}
button.danger {
  color: #a23e42;
}
label {
  display: grid;
  gap: 6px;
  color: #697577;
  font-size: 13px;
}
input,
select,
textarea {
  min-height: 38px;
  padding: 7px 10px;
  border: 1px solid #d8e0e1;
  border-radius: 4px;
  background: #fff;
  color: #293334;
  font: inherit;
}
.create-panel,
.filters {
  padding: 14px;
  border: 1px solid #dce3e4;
  background: #fff;
}
.create-panel {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) 100px minmax(240px, 1fr) auto;
  margin-bottom: 12px;
}
.filters {
  margin: 14px 0;
}
.filters label:first-child {
  min-width: 260px;
}
.file-field input {
  padding: 5px;
}
.progress {
  position: relative;
  height: 34px;
  overflow: hidden;
  border-radius: 5px;
  background: #e6ebec;
}
.progress span {
  position: absolute;
  inset: 0 auto 0 0;
  background: #afccca;
  transition: width 120ms ease;
}
.progress strong {
  position: relative;
  z-index: 1;
  display: grid;
  height: 100%;
  place-items: center;
  font-size: 12px;
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid #dce3e4;
  background: #fff;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 12px;
  border-bottom: 1px solid #e8edee;
  text-align: left;
  vertical-align: middle;
}
th {
  color: #758083;
  font-size: 12px;
  font-weight: 600;
}
td code {
  display: block;
  margin-top: 4px;
  color: #8a9496;
  font-size: 10px;
}
.semantic {
  min-width: 220px;
  max-width: 360px;
}
.thumb,
.thumb-empty {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  object-fit: contain;
  background: #f5f7f7;
  color: #9aa3a4;
  font-size: 11px;
}
.chip {
  display: inline-flex;
  padding: 4px 7px;
  border-radius: 999px;
  background: #edf1f2;
  font-size: 11px;
}
.chip[data-status="ACTIVE"] {
  background: #dceee7;
  color: #24684e;
}
.chip[data-status="BLOCKED"] {
  background: #f4dddd;
  color: #91373b;
}
.actions {
  display: flex;
  min-width: 300px;
  flex-wrap: wrap;
  gap: 6px;
}
.actions button,
.button-label {
  min-height: 32px;
  padding: 0 9px;
  font-size: 12px;
}
.button-label {
  display: inline-flex;
  align-items: center;
}
.button-label input {
  display: none;
}
.pagination {
  justify-content: flex-end;
  margin-top: 14px;
}
.empty {
  padding: 40px;
  color: #899395;
  text-align: center;
}
.overlay {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  padding: 24px;
  place-items: center;
  background: rgb(18 27 28 / 55%);
}
.dialog {
  width: min(1180px, 96vw);
  max-height: 92vh;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f7f8;
  box-shadow: 0 24px 70px rgb(0 0 0 / 25%);
}
.dialog > header {
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #dde3e4;
  background: #fff;
}
.dialog-body {
  display: grid;
  grid-template-columns: 170px 1fr;
  max-height: calc(92vh - 78px);
  overflow: hidden;
}
.revision-list {
  overflow-y: auto;
  padding: 10px;
  border-right: 1px solid #dce3e4;
  background: #fff;
}
.revision-list button {
  display: grid;
  width: 100%;
  height: auto;
  margin-bottom: 7px;
  padding: 10px;
  gap: 3px;
  text-align: left;
}
.revision-list button.active {
  border-color: var(--color-admin-accent);
  background: #edf5f4;
}
.revision-list span,
.revision-list small {
  font-size: 11px;
}
.revision-detail {
  overflow-y: auto;
  padding: 18px;
}
.preview-grid {
  display: grid;
  grid-template-columns: 220px 220px 1fr;
  gap: 14px;
}
figure {
  margin: 0;
  padding: 12px;
  border: 1px solid #dce3e4;
  background: #fff;
}
figcaption {
  margin-bottom: 8px;
  color: #798486;
  font-size: 12px;
}
figure img,
.preview-empty {
  display: grid;
  width: 196px;
  height: 196px;
  place-items: center;
  object-fit: contain;
  background: #f7f9f9;
  color: #96a0a1;
}
dl {
  margin: 0;
  padding: 12px 16px;
  border: 1px solid #dce3e4;
  background: #fff;
}
dl div {
  display: grid;
  grid-template-columns: 90px 1fr;
  padding: 7px 0;
  border-bottom: 1px solid #edf0f1;
}
dt {
  color: #7b8688;
}
dd {
  margin: 0;
}
.revision-actions {
  margin: 14px 0;
}
.metadata-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
  border: 1px solid #dce3e4;
  background: #fff;
}
.metadata-form .wide,
fieldset {
  grid-column: 1 / -1;
}
fieldset {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  border: 1px solid #e0e6e7;
}
legend {
  color: #647173;
  font-weight: 600;
}
textarea {
  resize: vertical;
}
@media (max-width: 900px) {
  .page {
    padding: 16px;
  }
  .create-panel,
  .preview-grid,
  .metadata-form,
  fieldset {
    grid-template-columns: 1fr;
  }
  .dialog-body {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
  .revision-list {
    display: flex;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid #dce3e4;
  }
  .revision-list button {
    min-width: 130px;
  }
  .revision-detail {
    overflow: visible;
  }
  .metadata-form .wide,
  fieldset {
    grid-column: auto;
  }
}
</style>
