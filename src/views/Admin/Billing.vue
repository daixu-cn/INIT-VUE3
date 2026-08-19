<template>
  <section class="billing-page">
    <header class="page-header">
      <div>
        <h1>退款与支付风控</h1>
        <p>核对商店事件、追回构成、欠点与人工处置；所有写操作都需要原因和二次确认。</p>
      </div>
      <button type="button" :disabled="loading" @click="refreshActive">
        <AppIcon :class="{ spinning: loading }" :path="mdiRefresh" />刷新
      </button>
    </header>

    <div class="summary-grid">
      <article>
        <span>当前案件</span><strong>{{ cases.length }}</strong>
      </article>
      <article>
        <span>未追回欠点</span><strong>{{ totalDebt }}</strong>
      </article>
      <article>
        <span>需人工关注</span><strong>{{ manualReviewCount }}</strong>
      </article>
      <article>
        <span>死信 / 未匹配</span><strong>{{ exceptionalEventCount }}</strong>
      </article>
    </div>

    <div class="tabs" role="tablist">
      <button :class="{ active: tab === 'cases' }" type="button" @click="tab = 'cases'">
        退款案件
      </button>
      <button :class="{ active: tab === 'events' }" type="button" @click="openEvents">
        商店事件
      </button>
    </div>

    <template v-if="tab === 'cases'">
      <div class="filters">
        <label
          >平台<select v-model="caseFilters.platform">
            <option value="">全部</option>
            <option value="APPLE">Apple</option>
            <option value="GOOGLE">Google</option>
          </select></label
        >
        <label
          >状态<select v-model="caseFilters.state">
            <option value="">全部</option>
            <option v-for="state in refundStates" :key="state" :value="state">
              {{ stateLabel(state) }}
            </option>
          </select></label
        >
        <label>用户编号<input v-model.trim="caseFilters.userId" placeholder="精确用户 ID" /></label>
        <button type="button" :disabled="loading" @click="loadCases">查询</button>
      </div>
      <div class="data-surface">
        <table>
          <thead>
            <tr>
              <th>状态</th>
              <th>平台 / 类型</th>
              <th>账号</th>
              <th>点数守恒</th>
              <th>更新时间</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cases" :key="item.refundCaseId" @click="openCase(item.refundCaseId)">
              <td>
                <span class="status" :data-status="item.state">{{ stateLabel(item.state) }}</span>
              </td>
              <td>
                <strong>{{ item.platform }}</strong
                ><small>{{ item.kind }}</small>
              </td>
              <td>
                <strong>{{ item.user?.email || "未匹配账号" }}</strong
                ><small>{{ item.userId || item.storeTransactionId }}</small>
              </td>
              <td>
                <strong
                  >{{ item.recoveredPoints }} 已追回 · {{ item.debtCreatedPoints }} 欠点</strong
                ><small>退款 {{ item.refundedPoints || item.requestedPoints }} 点</small>
              </td>
              <td>{{ formatDate(item.updatedAt) }}</td>
              <td><AppIcon :path="mdiChevronRight" /></td>
            </tr>
          </tbody>
        </table>
        <div v-if="!loading && !cases.length" class="empty">当前筛选下没有退款案件</div>
      </div>
    </template>

    <template v-else>
      <div class="filters">
        <label
          >处理状态<select v-model="eventFilters.status">
            <option value="">全部</option>
            <option v-for="status in eventStatuses" :key="status" :value="status">
              {{ eventStatusLabel(status) }}
            </option>
          </select></label
        >
        <button type="button" :disabled="loading" @click="loadEvents">查询</button>
      </div>
      <div class="data-surface">
        <table>
          <thead>
            <tr>
              <th>状态</th>
              <th>平台 / 事件</th>
              <th>事件编号</th>
              <th>尝试</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in events" :key="event.storeEventInboxId">
              <td>
                <span class="status" :data-status="event.status">{{
                  eventStatusLabel(event.status)
                }}</span>
              </td>
              <td>
                <strong>{{ event.platform }}</strong
                ><small>{{ event.eventType }}</small>
              </td>
              <td>
                <code>{{ event.eventId }}</code
                ><small v-if="event.lastError">{{ event.lastError }}</small>
              </td>
              <td>{{ event.attemptCount }}</td>
              <td>{{ formatDate(event.eventAt) }}</td>
              <td>
                <button class="link-button" type="button" @click="prepareEventReprocess(event)">
                  重新处理
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!loading && !events.length" class="empty">当前筛选下没有商店事件</div>
      </div>
    </template>

    <div v-if="selectedCase" class="drawer-layer" @click.self="selectedCase = undefined">
      <aside class="case-drawer">
        <header>
          <div>
            <span class="status" :data-status="selectedCase.state">{{
              stateLabel(selectedCase.state)
            }}</span>
            <h2>退款案件</h2>
            <code>{{ selectedCase.refundCaseId }}</code>
          </div>
          <button type="button" aria-label="关闭" @click="selectedCase = undefined">
            <AppIcon :path="mdiClose" />
          </button>
        </header>
        <section class="invariant">
          <span>退款点数</span
          ><strong>{{ selectedCase.refundedPoints || selectedCase.requestedPoints }}</strong
          ><span
            >= 已追回 {{ selectedCase.recoveredPoints }} + 累计欠点
            {{ selectedCase.debtCreatedPoints }}</span
          >
        </section>
        <dl>
          <div>
            <dt>账号</dt>
            <dd>
              {{ selectedCase.user?.email || "未匹配" }}<small>{{ selectedCase.userId }}</small>
            </dd>
          </div>
          <div>
            <dt>商店交易</dt>
            <dd>{{ selectedCase.storeTransactionId }}</dd>
          </div>
          <div>
            <dt>平台 / 商品</dt>
            <dd>{{ selectedCase.platform }} · {{ selectedCase.productId || "—" }}</dd>
          </div>
          <div>
            <dt>风险事件</dt>
            <dd>
              {{ selectedCase.riskEvent ? "是" : "否"
              }}<small v-if="selectedCase.confirmedCollusion">已确认串谋</small>
            </dd>
          </div>
        </dl>
        <section>
          <h3>追回构成</h3>
          <div v-if="!selectedCase.recoveries.length" class="muted">暂无追回记录</div>
          <ul class="timeline">
            <li v-for="item in selectedCase.recoveries" :key="item.refundRecoveryAllocationId">
              <strong>{{ item.source }}</strong
              ><span>{{ item.points }} 点 · {{ formatDate(item.createdAt) }}</span>
            </li>
          </ul>
        </section>
        <section>
          <h3>债务批次</h3>
          <div v-if="!selectedCase.debtLots.length" class="muted">无退款欠点</div>
          <ul class="timeline">
            <li v-for="lot in selectedCase.debtLots" :key="lot.pointDebtLotId">
              <strong>剩余 {{ lot.remainingPoints }} / 原始 {{ lot.originalPoints }}</strong
              ><span>现金偿还 {{ lot.paidPoints }} · 豁免 {{ lot.waivedPoints }}</span>
            </li>
          </ul>
        </section>
        <section>
          <h3>事件时间线</h3>
          <ul class="timeline">
            <li v-for="event in selectedCase.events" :key="event.refundCaseEventId">
              <strong>{{ event.eventType }} · {{ stateLabel(event.state) }}</strong
              ><span>{{ formatDate(event.occurredAt) }} · {{ event.platformEventId }}</span>
            </li>
          </ul>
        </section>
        <section>
          <h3>人工审计</h3>
          <div v-if="!selectedCase.adminActions.length" class="muted">暂无人工操作</div>
          <ul class="timeline">
            <li v-for="item in selectedCase.adminActions" :key="item.billingAdminActionId">
              <strong>{{ item.action }}</strong
              ><span>{{ item.reason }} · {{ formatDate(item.createdAt) }}</span>
            </li>
          </ul>
        </section>
        <footer>
          <button type="button" @click="prepareCaseAction('waive')">纠错 / 豁免欠点</button>
          <button type="button" @click="prepareCaseAction('compromise')">账号盗用例外</button>
          <button type="button" @click="prepareCaseAction('collusion')">确认串谋</button>
          <button type="button" @click="prepareCaseAction('risk')">调整限制状态</button>
        </footer>
      </aside>
    </div>

    <div v-if="action" class="modal-layer" @click.self="action = undefined">
      <form class="action-dialog" @submit.prevent="submitAction">
        <h2>{{ actionTitle }}</h2>
        <p>这是敏感财务操作。提交后会写入操作者、原因和时间，且不会静默覆盖原记录。</p>
        <label v-if="action.kind === 'waive'"
          >豁免点数（留空表示全部）<input v-model.number="action.points" min="1" type="number"
        /></label>
        <template v-if="action.kind === 'collusion'"
          ><label>收礼人用户 ID<input v-model.trim="action.recipientUserId" required /></label
          ><label
            >迁移欠点<input v-model.number="action.points" min="1" required type="number" /></label
        ></template>
        <label v-if="action.kind === 'risk'"
          >支付状态<select v-model="action.riskState">
            <option v-for="state in riskStates" :key="state" :value="state">{{ state }}</option>
          </select></label
        >
        <label
          >操作原因（至少 5 个字符）<textarea
            v-model.trim="action.reason"
            maxlength="1000"
            required
          />
        </label>
        <label class="confirm"
          ><input
            v-model="action.confirmed"
            type="checkbox"
          />我已核对交易、追回构成和影响账号，并确认执行</label
        >
        <footer>
          <button type="button" @click="action = undefined">取消</button
          ><button class="danger" type="submit" :disabled="!actionValid || processing">
            {{ processing ? "处理中…" : "确认并记录" }}
          </button>
        </footer>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { mdiChevronRight, mdiClose, mdiRefresh } from "@mdi/js"
import { computed, onMounted, reactive, ref } from "vue"

import AppIcon from "@/components/AppIcon.vue"
import {
  confirmRefundCollusion,
  getRefundCase,
  listRefundCases,
  listStoreEvents,
  markAccountCompromise,
  reprocessStoreEvent,
  setPaymentRiskState,
  waiveRefundDebt,
} from "@/server/api/billing"
import { snackbar } from "@/tools/snackbar"

const refundStates: Model.Billing.RefundState[] = [
  "REQUESTED",
  "EVIDENCE_SENT",
  "APPROVED",
  "DECLINED",
  "REVERSED",
  "UNMATCHED",
  "MANUAL_REVIEW",
  "CLOSED",
]
const eventStatuses: Model.Billing.EventStatus[] = [
  "PENDING",
  "PROCESSING",
  "APPLIED",
  "RETRY",
  "DEAD_LETTER",
  "UNMATCHED",
  "MANUAL_REVIEW",
]
const riskStates: Model.Billing.RiskState[] = [
  "GOOD_STANDING",
  "PAYMENT_DEBT",
  "UNDER_REVIEW",
  "PAYMENT_SUSPENDED",
]
const tab = ref<"cases" | "events">("cases")
const cases = ref<Model.Billing.RefundSummary[]>([])
const events = ref<Model.Billing.StoreEvent[]>([])
const selectedCase = ref<Model.Billing.RefundDetail>()
const loading = ref(false)
const processing = ref(false)
const caseFilters = reactive<Model.Billing.RefundListParams>({
  limit: 100,
  platform: "",
  state: "",
  userId: "",
})
const eventFilters = reactive<Model.Billing.EventListParams>({ limit: 100, status: "" })
type ActionKind = "collusion" | "compromise" | "reprocess" | "risk" | "waive"
interface ActionState {
  kind: ActionKind
  targetId: string
  reason: string
  confirmed: boolean
  points?: number
  recipientUserId?: string
  riskState?: Model.Billing.RiskState
}
const action = ref<ActionState>()
const totalDebt = computed(() =>
  cases.value.reduce(
    (sum, item) => sum + item.debtLots.reduce((lotSum, lot) => lotSum + lot.remainingPoints, 0),
    0,
  ),
)
const manualReviewCount = computed(
  () => cases.value.filter(item => ["MANUAL_REVIEW", "UNMATCHED"].includes(item.state)).length,
)
const exceptionalEventCount = computed(
  () =>
    events.value.filter(item => ["DEAD_LETTER", "MANUAL_REVIEW", "UNMATCHED"].includes(item.status))
      .length,
)
const actionTitle = computed(
  () =>
    ({
      collusion: "确认串谋并迁移欠点",
      compromise: "标记账号盗用例外",
      reprocess: "重新处理商店事件",
      risk: "调整支付限制状态",
      waive: "纠错 / 豁免退款欠点",
    })[action.value?.kind ?? "waive"],
)
const actionValid = computed(() => {
  const value = action.value
  if (!value?.confirmed || value.reason.length < 5) return false
  if (value.kind === "collusion")
    return Boolean(value.recipientUserId && value.points && value.points > 0)
  return true
})

function stateLabel(value: Model.Billing.RefundState) {
  return {
    REQUESTED: "待商店决定",
    EVIDENCE_SENT: "证据已发送",
    APPROVED: "退款已批准",
    DECLINED: "退款已拒绝",
    REVERSED: "退款已撤销",
    UNMATCHED: "交易未匹配",
    MANUAL_REVIEW: "人工复核",
    CLOSED: "已关闭",
  }[value]
}
function eventStatusLabel(value: Model.Billing.EventStatus) {
  return {
    PENDING: "待处理",
    PROCESSING: "处理中",
    APPLIED: "已处理",
    RETRY: "等待重试",
    DEAD_LETTER: "死信",
    UNMATCHED: "未匹配",
    MANUAL_REVIEW: "人工复核",
  }[value]
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  )
}
async function loadCases() {
  loading.value = true
  try {
    cases.value = (await listRefundCases(caseFilters)).data
  } finally {
    loading.value = false
  }
}
async function loadEvents() {
  loading.value = true
  try {
    events.value = (await listStoreEvents(eventFilters)).data
  } finally {
    loading.value = false
  }
}
function refreshActive() {
  return tab.value === "cases" ? loadCases() : loadEvents()
}
async function openEvents() {
  tab.value = "events"
  if (!events.value.length) await loadEvents()
}
async function openCase(id: string) {
  selectedCase.value = (await getRefundCase(id)).data
}
function prepareEventReprocess(event: Model.Billing.StoreEvent) {
  action.value = {
    kind: "reprocess",
    targetId: event.storeEventInboxId,
    reason: "",
    confirmed: false,
  }
}
function prepareCaseAction(kind: Exclude<ActionKind, "reprocess">) {
  if (!selectedCase.value) return
  action.value = {
    kind,
    targetId: selectedCase.value.refundCaseId,
    reason: "",
    confirmed: false,
    riskState: "PAYMENT_DEBT",
  }
}
async function submitAction() {
  const value = action.value
  if (!value || !actionValid.value || processing.value) return
  processing.value = true
  try {
    if (value.kind === "reprocess") await reprocessStoreEvent(value.targetId, value.reason)
    if (value.kind === "waive") await waiveRefundDebt(value.targetId, value.reason, value.points)
    if (value.kind === "compromise") await markAccountCompromise(value.targetId, value.reason)
    if (value.kind === "collusion")
      await confirmRefundCollusion(value.targetId, {
        points: value.points!,
        reason: value.reason,
        recipientUserId: value.recipientUserId!,
      })
    if (value.kind === "risk" && selectedCase.value?.userId)
      await setPaymentRiskState(selectedCase.value.userId, value.riskState!, value.reason)
    snackbar.success("操作已记录")
    action.value = undefined
    await refreshActive()
    if (selectedCase.value) await openCase(selectedCase.value.refundCaseId)
  } finally {
    processing.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadCases(), loadEvents()])
})
</script>

<style scoped src="./billing.css"></style>
