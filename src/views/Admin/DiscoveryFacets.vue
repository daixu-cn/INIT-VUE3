<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>发现分类</h1>
        <p>管理标准目录、审核长尾候选，并处理自动分类失败。</p>
      </div>
      <button type="button" :disabled="loading" @click="load">
        {{ loading ? "刷新中…" : "刷新" }}
      </button>
    </header>

    <div class="metrics">
      <article>
        <small>分类成功率</small
        ><strong>{{ percent(data.metrics.classificationSuccessRate) }}</strong>
      </article>
      <article>
        <small>目录 P95（15 分钟）</small
        ><strong>{{
          data.metrics.catalogP95Ms15m == null
            ? "—"
            : `${Math.round(data.metrics.catalogP95Ms15m)} ms`
        }}</strong>
      </article>
      <article>
        <small>目录错误率</small><strong>{{ percent(data.metrics.catalogErrorRate15m) }}</strong>
      </article>
      <article>
        <small>零结果筛选率</small
        ><strong>{{ percent(data.metrics.zeroResultFilterRate15m) }}</strong>
      </article>
      <article>
        <small>最老待分类</small><strong>{{ formatTime(data.metrics.oldestPendingAt) }}</strong>
      </article>
      <article>
        <small>30 天候选晋升</small><strong>{{ data.metrics.promotions30d }}</strong>
      </article>
    </div>

    <nav class="tabs" aria-label="发现分类管理区">
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        :class="{ active: tab === item.key }"
        @click="tab = item.key"
      >
        {{ item.label }} <span>{{ item.count }}</span>
      </button>
    </nav>

    <div v-if="loading && !loaded" class="empty">正在加载发现分类…</div>

    <template v-else-if="tab === 'catalog'">
      <div class="filters">
        <label
          >维度
          <select v-model="dimension">
            <option value="">全部</option>
            <option v-for="item in dimensions" :key="item" :value="item">
              {{ dimensionLabel(item) }}
            </option>
          </select>
        </label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>维度 / 编码</th>
              <th>五语名称</th>
              <th>状态</th>
              <th>排序</th>
              <th>角色数</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="facet in filteredFacets" :key="facet.discoveryFacetId">
              <td>
                <strong>{{ dimensionLabel(facet.dimension) }}</strong
                ><code>{{ facet.code }}</code>
              </td>
              <td class="labels">
                <span>{{ facet.labelZhHans }} / {{ facet.labelZhHant }}</span
                ><small>{{ facet.labelEn }} · {{ facet.labelJa }} · {{ facet.labelDe }}</small>
              </td>
              <td>
                <span class="chip" :data-status="facet.status">{{ facet.status }}</span>
              </td>
              <td>{{ facet.sortOrder }}</td>
              <td>{{ facet._count.profiles }}</td>
              <td><button type="button" class="link" @click="editFacet(facet)">编辑</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-else-if="tab === 'candidates'">
      <div class="filters">
        <label
          >维度<select v-model="dimension">
            <option value="">全部</option>
            <option v-for="item in dimensions" :key="item" :value="item">
              {{ dimensionLabel(item) }}
            </option>
          </select></label
        >
        <label
          >资格<select v-model="candidateEligibility">
            <option value="ALL">全部</option>
            <option value="ELIGIBLE">达到 10 角色 / 5 作者</option>
            <option value="COLLECTING">继续收集</option>
          </select></label
        >
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>候选</th>
              <th>维度</th>
              <th>30 天公开角色</th>
              <th>作者</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="candidate in filteredCandidates" :key="candidate.discoveryFacetCandidateId">
              <td>
                <strong>{{ candidate.displayValue }}</strong
                ><code>{{ candidate.normalizedValue }}</code>
              </td>
              <td>{{ dimensionLabel(candidate.dimension) }}</td>
              <td>{{ candidate.roleCount }}</td>
              <td>{{ candidate.authorCount }}</td>
              <td>
                <span
                  class="chip"
                  :data-status="candidate.eligible ? 'ACTIVE' : candidate.status"
                  >{{ candidate.eligible ? "待审资格已达成" : candidate.status }}</span
                >
              </td>
              <td class="actions">
                <button
                  type="button"
                  :disabled="processing || candidate.status === 'REJECTED'"
                  @click="mergeCandidate(candidate)"
                >
                  合并
                </button>
                <button
                  type="button"
                  :disabled="processing || !candidate.eligible"
                  @click="promoteCandidate(candidate)"
                >
                  升级
                </button>
                <button
                  type="button"
                  class="danger"
                  :disabled="processing || candidate.status === 'REJECTED'"
                  @click="rejectCandidate(candidate)"
                >
                  拒绝
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-else>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>角色</th>
              <th>状态</th>
              <th>错误码</th>
              <th>重试次数</th>
              <th>下次重试</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="failure in data.failures" :key="failure.characterProfileId">
              <td>
                <strong>{{ failure.profile.name }}</strong
                ><code>{{ failure.characterProfileId }}</code>
              </td>
              <td>{{ failure.status }}</td>
              <td>{{ failure.errorCode || "—" }}</td>
              <td>{{ failure.attemptCount }}/5</td>
              <td>{{ formatTime(failure.nextAttemptAt) }}</td>
              <td>
                <button type="button" class="link" :disabled="processing" @click="retry(failure)">
                  手动重试
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <form class="correction" @submit.prevent="correctProfile">
        <h2>角色标签纠正</h2>
        <p>覆盖只绑定当前角色内容哈希；角色资料再次实质变化后会重新自动分类。</p>
        <label>角色 Profile ID<input v-model.trim="correction.profileId" required /></label>
        <label v-for="item in dimensions" :key="item"
          >{{ dimensionLabel(item) }}编码（逗号分隔）<input
            v-model.trim="correction[item]"
            placeholder="例如 WARM,DIRECT"
        /></label>
        <button type="submit" :disabled="processing">确认覆盖标签</button>
      </form>
    </template>

    <div v-if="editing" class="overlay" @click.self="editing = null">
      <form class="dialog" @submit.prevent="saveFacet">
        <h2>编辑 {{ editing.code }}</h2>
        <div class="form-grid">
          <label>简体中文<input v-model.trim="editing.labelZhHans" required /></label
          ><label>繁体中文<input v-model.trim="editing.labelZhHant" required /></label
          ><label>English<input v-model.trim="editing.labelEn" required /></label
          ><label>日本語<input v-model.trim="editing.labelJa" required /></label
          ><label>Deutsch<input v-model.trim="editing.labelDe" required /></label
          ><label>排序<input v-model.number="editing.sortOrder" type="number" /></label
          ><label
            >状态<select v-model="editing.status">
              <option value="ACTIVE">ACTIVE</option>
              <option value="HIDDEN">HIDDEN</option>
              <option value="DEPRECATED">DEPRECATED</option>
            </select></label
          ><label>替代分类 ID<input v-model.trim="editing.replacementFacetId" /></label>
        </div>
        <footer>
          <button type="button" @click="editing = null">取消</button
          ><button type="submit" class="primary" :disabled="processing">二次确认并保存</button>
        </footer>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRaw } from "vue"

import {
  correctDiscoveryProfile,
  getDiscoveryFacets,
  retryDiscoveryClassification,
  reviewDiscoveryCandidate,
  updateDiscoveryFacet,
} from "@/server/api/discovery-facets"
import { snackbar } from "@/tools/snackbar"

type Dimension = Model.DiscoveryFacets.Facet["dimension"]
const dimensions: Dimension[] = ["PURPOSE", "PERSONALITY", "RELATIONSHIP", "WORLD"]
const data = reactive<Model.DiscoveryFacets.Overview>({
  facets: [],
  candidates: [],
  failures: [],
  metrics: {
    catalogErrorRate15m: 0,
    catalogP95Ms15m: null,
    classificationSuccessRate: 1,
    eligibleCandidateCount: 0,
    oldestPendingAt: null,
    promotions30d: 0,
    zeroResultFilterRate15m: 0,
  },
})
const loading = ref(false),
  loaded = ref(false),
  processing = ref(false)
const tab = ref<"catalog" | "candidates" | "failures">("catalog")
const dimension = ref<"" | Dimension>("")
const candidateEligibility = ref("ALL")
const editing = ref<Model.DiscoveryFacets.Facet | null>(null)
const correction = reactive<Record<Dimension | "profileId", string>>({
  profileId: "",
  PURPOSE: "",
  PERSONALITY: "",
  RELATIONSHIP: "",
  WORLD: "",
})

const tabs = computed(() => [
  { key: "catalog" as const, label: "分类目录", count: data.facets.length },
  { key: "candidates" as const, label: "候选池", count: data.candidates.length },
  { key: "failures" as const, label: "分类任务", count: data.failures.length },
])
const filteredFacets = computed(() =>
  data.facets.filter(item => !dimension.value || item.dimension === dimension.value),
)
const filteredCandidates = computed(() =>
  data.candidates.filter(
    item =>
      (!dimension.value || item.dimension === dimension.value) &&
      (candidateEligibility.value === "ALL" ||
        (candidateEligibility.value === "ELIGIBLE") === item.eligible),
  ),
)

onMounted(load)
async function load() {
  loading.value = true
  try {
    Object.assign(data, (await getDiscoveryFacets()).data)
    loaded.value = true
  } finally {
    loading.value = false
  }
}
function dimensionLabel(value: Dimension) {
  return {
    PURPOSE: "互动目的",
    PERSONALITY: "角色性格",
    RELATIONSHIP: "关系定位",
    WORLD: "世界背景",
  }[value]
}
function formatTime(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(value),
      )
    : "—"
}
function percent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}
function editFacet(facet: Model.DiscoveryFacets.Facet) {
  editing.value = structuredClone(toRaw(facet))
}

async function saveFacet() {
  if (
    !editing.value ||
    !window.confirm("确认保存分类变更？该操作会立即影响 APP 目录，并写入审计日志。")
  )
    return
  processing.value = true
  try {
    const facet = editing.value
    await updateDiscoveryFacet(facet.discoveryFacetId, {
      confirmed: true,
      labelZhHans: facet.labelZhHans,
      labelZhHant: facet.labelZhHant,
      labelEn: facet.labelEn,
      labelJa: facet.labelJa,
      labelDe: facet.labelDe,
      sortOrder: facet.sortOrder,
      status: facet.status,
      replacementFacetId: facet.replacementFacetId,
    })
    editing.value = null
    snackbar.success("分类已更新，目录缓存已失效。")
    await load()
  } finally {
    processing.value = false
  }
}

async function mergeCandidate(candidate: Model.DiscoveryFacets.Candidate) {
  const code = window.prompt("输入要合并到的标准分类编码")?.trim().toUpperCase()
  if (!code) return
  const target = data.facets.find(
    item =>
      item.dimension === candidate.dimension && item.code === code && item.status === "ACTIVE",
  )
  if (!target) return snackbar.error("未找到同维度的 ACTIVE 分类。")
  if (!window.confirm(`确认把“${candidate.displayValue}”合并到 ${code}？`)) return
  await reviewCandidate(candidate, {
    action: "MERGE",
    confirmed: true,
    discoveryFacetId: target.discoveryFacetId,
  })
}
async function promoteCandidate(candidate: Model.DiscoveryFacets.Candidate) {
  const code = window.prompt("新分类稳定编码（启用后不可改名或复用）")?.trim().toUpperCase()
  if (!code) return
  const labels = {
    labelZhHans: window.prompt("简体中文名称", candidate.displayValue),
    labelZhHant: window.prompt("繁体中文名称"),
    labelEn: window.prompt("English name"),
    labelJa: window.prompt("日本語名"),
    labelDe: window.prompt("Deutscher Name"),
  }
  if (Object.values(labels).some(value => !value?.trim()))
    return snackbar.error("五种语言名称必须全部填写。")
  if (!window.confirm(`确认激活新分类 ${code}？APP 无需发版即可看到它。`)) return
  await reviewCandidate(candidate, {
    action: "PROMOTE",
    confirmed: true,
    code,
    ...Object.fromEntries(Object.entries(labels).map(([key, value]) => [key, value!.trim()])),
  })
}
async function rejectCandidate(candidate: Model.DiscoveryFacets.Candidate) {
  const reason = window.prompt("填写拒绝原因")?.trim()
  if (!reason || !window.confirm(`确认拒绝“${candidate.displayValue}”？相同候选不会再次进入待审。`))
    return
  await reviewCandidate(candidate, { action: "REJECT", confirmed: true, reason })
}
async function reviewCandidate(
  candidate: Model.DiscoveryFacets.Candidate,
  payload: Model.DiscoveryFacets.CandidateReview,
) {
  processing.value = true
  try {
    await reviewDiscoveryCandidate(candidate.discoveryFacetCandidateId, payload)
    snackbar.success("候选处理完成。")
    await load()
  } finally {
    processing.value = false
  }
}
async function retry(failure: Model.DiscoveryFacets.Failure) {
  if (!window.confirm(`确认重试角色“${failure.profile.name}”的发现分类？`)) return
  processing.value = true
  try {
    await retryDiscoveryClassification(failure.characterProfileId)
    snackbar.success("已重新进入分类队列。")
    await load()
  } finally {
    processing.value = false
  }
}
async function correctProfile() {
  const codes = Object.fromEntries(
    dimensions.map(item => [
      item,
      correction[item]
        .split(",")
        .map(value => value.trim().toUpperCase())
        .filter(Boolean),
    ]),
  )
  if (!window.confirm("确认覆盖这个角色的自动标签？该操作将写入审计日志。")) return
  processing.value = true
  try {
    await correctDiscoveryProfile(correction.profileId, codes)
    snackbar.success("角色标签已纠正。")
    await load()
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
.page {
  padding: 28px;
  color: #2b3738;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}
.page-header h1,
h2 {
  margin: 0;
}
.page-header p,
.correction p {
  margin: 6px 0 0;
  color: #748083;
}
.page button {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid #d9e1e2;
  border-radius: 5px;
  background: #fff;
  color: #526063;
  cursor: pointer;
}
.page button:disabled {
  cursor: wait;
  opacity: 0.55;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}
.metrics article {
  padding: 14px;
  border: 1px solid #dce3e4;
  border-radius: 7px;
  background: #fff;
}
.metrics small,
.metrics strong {
  display: block;
}
.metrics small {
  color: #788487;
}
.metrics strong {
  margin-top: 6px;
  font-size: 18px;
}
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 18px;
  border-bottom: 1px solid #dce3e4;
}
.tabs button {
  border: 0;
  border-radius: 5px 5px 0 0;
}
.tabs button.active {
  background: var(--color-admin-accent);
  color: #fff;
}
.tabs span {
  margin-left: 5px;
  opacity: 0.7;
}
.filters {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
}
.filters label,
.correction label,
.dialog label {
  display: grid;
  gap: 6px;
  color: #687578;
  font-size: 13px;
}
.filters select,
input,
.dialog select {
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid #d7e0e1;
  border-radius: 4px;
  background: #fff;
}
.table-wrap {
  overflow: auto;
  border: 1px solid #dce3e4;
  border-radius: 7px;
  background: #fff;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 13px 15px;
  border-bottom: 1px solid #edf0f1;
  text-align: left;
  vertical-align: middle;
}
th {
  color: #748083;
  font-size: 12px;
}
td {
  font-size: 14px;
}
td strong,
td code {
  display: block;
}
td code {
  margin-top: 4px;
  color: #859093;
  font-size: 11px;
}
.labels small {
  display: block;
  margin-top: 4px;
  color: #7a8588;
}
.chip {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  background: #eef2f2;
  color: #647174;
  font-size: 11px;
}
.chip[data-status="ACTIVE"] {
  background: #dff3ec;
  color: #2e725d;
}
.actions {
  display: flex;
  gap: 6px;
}
.actions .danger {
  color: #b94b4b;
}
.link {
  border: 0 !important;
  color: var(--color-admin-accent) !important;
}
.empty {
  display: grid;
  min-height: 220px;
  place-items: center;
  color: #788487;
}
.correction {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 20px;
  padding: 22px;
  border: 1px solid #dce3e4;
  border-radius: 7px;
  background: #fff;
}
.correction h2,
.correction p {
  grid-column: 1/-1;
}
.correction button {
  justify-self: start;
  background: var(--color-admin-accent);
  color: #fff;
}
.overlay {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(20 29 30 / 45%);
}
.dialog {
  width: min(720px, 100%);
  padding: 24px;
  border-radius: 8px;
  background: #fff;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin: 20px 0;
}
.dialog footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.dialog .primary {
  background: var(--color-admin-accent);
  color: #fff;
}
@media (max-width: 1100px) {
  .metrics {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .page {
    padding: 18px;
  }
  .page-header {
    align-items: flex-start;
  }
  .filters {
    flex-wrap: wrap;
  }
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  .correction,
  .form-grid {
    grid-template-columns: 1fr;
  }
  th,
  td {
    white-space: nowrap;
  }
}
</style>
