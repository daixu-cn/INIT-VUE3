<template>
  <main class="admin-login">
    <div class="login-glow" aria-hidden="true" />
    <section class="login-card">
      <header>
        <RouterLink class="brand" to="/" aria-label="返回 Echo 官网">
          <img :src="BRAND_WORDMARK_URL" alt="Echo" />
        </RouterLink>
        <span>管理后台</span>
      </header>

      <Transition name="login-step" mode="out-in">
        <form v-if="!pending" key="email" @submit.prevent="submitEmail">
          <div class="heading">
            <p>ADMIN CONSOLE</p>
            <h1>管理员登录</h1>
            <span>输入已配置管理员权限的邮箱，我们会发送一封确认邮件。</span>
          </div>

          <label class="email-field">
            <span>邮箱地址</span>
            <input
              v-model.trim="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="name@example.com"
              maxlength="254"
              :disabled="loading"
              required
              autofocus
            />
          </label>

          <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

          <button class="primary-button" type="submit" :disabled="loading">
            <AppIcon v-if="loading" class="spinning" :path="mdiLoading" />
            <AppIcon v-else :path="mdiEmailOutline" />
            {{ loading ? "正在发送" : "发送确认邮件" }}
          </button>
          <small>只有数据库角色为 ADMIN 的账号才能完成登录。</small>
        </form>

        <div v-else key="pending" class="pending-step">
          <div class="mail-mark" aria-hidden="true">
            <AppIcon :path="mdiEmailCheckOutline" />
          </div>
          <div class="heading">
            <p>CHECK YOUR INBOX</p>
            <h1>确认登录邮件</h1>
            <span>确认链接已发送至</span>
            <strong>{{ pending.email }}</strong>
          </div>

          <div class="waiting-status" aria-live="polite">
            <i />
            {{ checking ? "正在确认登录状态" : "等待你在邮件中确认" }}
          </div>

          <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

          <button class="primary-button" type="button" :disabled="checking" @click="checkStatus">
            <AppIcon :class="{ spinning: checking }" :path="checking ? mdiLoading : mdiRefresh" />
            {{ checking ? "正在检查" : "我已确认" }}
          </button>
          <button
            class="text-button"
            type="button"
            :disabled="resendSeconds > 0"
            @click="resendEmail"
          >
            {{ resendSeconds > 0 ? `${resendSeconds} 秒后可重新发送` : "重新发送邮件" }}
          </button>
          <button class="change-button" type="button" @click="changeEmail">
            <AppIcon :path="mdiArrowLeft" />
            更换邮箱
          </button>
        </div>
      </Transition>

      <footer>
        <span>登录身份与管理员权限均由 Echo 服务端校验</span>
        <RouterLink to="/">返回官网</RouterLink>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  mdiArrowLeft,
  mdiEmailCheckOutline,
  mdiEmailOutline,
  mdiLoading,
  mdiRefresh,
} from "@mdi/js"
import { onBeforeUnmount, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

import AppIcon from "@/components/AppIcon.vue"
import { BRAND_WORDMARK_URL } from "@/global/env"
import { getAdminEmailLinkStatus, requestAdminEmailLink } from "@/server/api/auth"
import useStore from "@/store"
import { snackbar } from "@/tools/snackbar"

type PendingAdminLogin = {
  email: string
  expiresAt: number
  pollToken: string
  requestId: string
  resendAt: number
}

const PENDING_KEY = "echo.admin.pending-email-login"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u

const route = useRoute()
const router = useRouter()
const { user } = useStore()
const email = ref("")
const pending = ref<PendingAdminLogin | null>(null)
const loading = ref(false)
const checking = ref(false)
const resendSeconds = ref(0)
const errorMessage = ref("")
let pollTimer: number | undefined
let countdownTimer: number | undefined

onMounted(() => {
  const restored = restorePending()
  if (!restored) return
  email.value = restored.email
  pending.value = restored
  startPolling()
})

onBeforeUnmount(stopPolling)

async function submitEmail() {
  const normalizedEmail = email.value.trim().toLocaleLowerCase()
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errorMessage.value = "请输入有效的邮箱地址"
    return
  }

  loading.value = true
  errorMessage.value = ""
  try {
    const response = await requestAdminEmailLink({ email: normalizedEmail })
    if (response.data.session) return completeLogin(response.data.session)
    if (!response.data.requestId || !response.data.pollToken) throw new Error("发送登录邮件失败")

    const now = Date.now()
    pending.value = {
      email: normalizedEmail,
      expiresAt: now + response.data.expiresIn * 1000,
      pollToken: response.data.pollToken,
      requestId: response.data.requestId,
      resendAt: now + response.data.resendAfter * 1000,
    }
    persistPending()
    startPolling()
  } catch (error) {
    errorMessage.value = errorText(error)
  } finally {
    loading.value = false
  }
}

async function checkStatus() {
  const current = pending.value
  if (!current || checking.value) return
  if (current.expiresAt <= Date.now()) return expirePending()

  checking.value = true
  try {
    const response = await getAdminEmailLinkStatus({
      requestId: current.requestId,
      pollToken: current.pollToken,
    })
    if (response.data.status === "EXPIRED") return expirePending()
    if (response.data.status === "CONFIRMED" && response.data.session) {
      await completeLogin(response.data.session)
    }
  } catch (error) {
    errorMessage.value = errorText(error)
    const status = (error as { response?: { status?: number } }).response?.status
    if (status === 401 || status === 403) clearPending()
  } finally {
    checking.value = false
  }
}

async function completeLogin(session: Model.Auth.Data) {
  if (session.user.role !== "ADMIN") {
    clearPending()
    errorMessage.value = "该邮箱没有管理员权限"
    return
  }
  user.setSession(session)
  clearPending()
  snackbar.success("登录成功")
  const redirect =
    typeof route.query.redirect === "string" && route.query.redirect.startsWith("/admin/")
      ? route.query.redirect
      : "/admin/reports"
  await router.replace(redirect)
}

function resendEmail() {
  if (!pending.value || resendSeconds.value > 0) return
  email.value = pending.value.email
  clearPending()
  void submitEmail()
}

function changeEmail() {
  if (pending.value) email.value = pending.value.email
  clearPending()
  errorMessage.value = ""
}

function startPolling() {
  stopPolling()
  updateCountdown()
  void checkStatus()
  pollTimer = window.setInterval(() => void checkStatus(), 2_000)
  countdownTimer = window.setInterval(updateCountdown, 1_000)
}

function stopPolling() {
  if (pollTimer) window.clearInterval(pollTimer)
  if (countdownTimer) window.clearInterval(countdownTimer)
  pollTimer = undefined
  countdownTimer = undefined
}

function updateCountdown() {
  const resendAt = pending.value?.resendAt ?? Date.now()
  resendSeconds.value = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000))
}

function expirePending() {
  clearPending()
  errorMessage.value = "确认链接已过期，请重新发送"
}

function clearPending() {
  stopPolling()
  pending.value = null
  sessionStorage.removeItem(PENDING_KEY)
}

function persistPending() {
  if (pending.value) sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending.value))
}

function restorePending() {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(PENDING_KEY) ?? "null",
    ) as PendingAdminLogin | null
    if (!value?.requestId || !value.pollToken || value.expiresAt <= Date.now()) {
      sessionStorage.removeItem(PENDING_KEY)
      return null
    }
    return value
  } catch {
    sessionStorage.removeItem(PENDING_KEY)
    return null
  }
}

function errorText(error: unknown) {
  return error instanceof Error && error.message ? error.message : "操作失败，请稍后重试"
}
</script>

<style scoped>
.admin-login {
  position: relative;
  display: grid;
  min-height: 100svh;
  place-items: center;
  overflow: hidden;
  padding: 32px 20px;
  background:
    linear-gradient(rgba(247, 250, 249, 0.92), rgba(242, 247, 246, 0.98)),
    radial-gradient(circle at 50% 0%, #c7ebe5, transparent 48%);
  color: #263331;
}

.login-glow {
  position: absolute;
  width: min(720px, 90vw);
  height: 360px;
  border-radius: 50%;
  background: rgba(57, 171, 159, 0.12);
  filter: blur(80px);
  transform: translateY(-42%);
  pointer-events: none;
}

.login-card {
  position: relative;
  width: min(100%, 430px);
  overflow: hidden;
  border: 1px solid rgba(37, 75, 69, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 28px 80px rgba(27, 64, 59, 0.12);
  backdrop-filter: blur(18px);
}

.login-card > header,
.login-card > footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
}

.login-card > header {
  border-bottom: 1px solid #edf1f0;
}

.brand {
  display: inline-flex;
}

.brand img {
  width: 78px;
  height: auto;
}

.login-card > header span {
  color: #81908d;
  font-size: 12px;
  letter-spacing: 0.08em;
}

form,
.pending-step {
  padding: 38px 36px 34px;
}

.heading {
  margin-bottom: 28px;
}

.heading p {
  margin: 0 0 8px;
  color: #229b91;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.heading h1 {
  margin: 0;
  font-size: 27px;
  letter-spacing: -0.04em;
}

.heading span,
.heading strong {
  display: block;
  margin-top: 10px;
  color: #75817f;
  font-size: 14px;
  line-height: 1.65;
}

.heading strong {
  margin-top: 2px;
  overflow-wrap: anywhere;
  color: #34423f;
  font-weight: 600;
}

.email-field {
  display: grid;
  gap: 8px;
}

.email-field span {
  color: #4e5c59;
  font-size: 13px;
  font-weight: 600;
}

.email-field input {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #d8e0de;
  border-radius: 7px;
  outline: none;
  background: #fff;
  color: #263331;
  font: inherit;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.email-field input:focus {
  border-color: #269c92;
  box-shadow: 0 0 0 3px rgba(38, 156, 146, 0.12);
}

.primary-button,
.text-button,
.change-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  font: inherit;
}

.primary-button {
  width: 100%;
  height: 48px;
  gap: 8px;
  margin-top: 22px;
  border-radius: 7px;
  background: #1d9790;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  transition:
    background 160ms ease,
    transform 160ms ease;
}

.primary-button:hover:not(:disabled) {
  background: #16867f;
  transform: translateY(-1px);
}

.primary-button:disabled,
.text-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.primary-button :deep(svg),
.change-button :deep(svg) {
  width: 18px;
  height: 18px;
}

form > small {
  display: block;
  margin-top: 14px;
  color: #929c9a;
  font-size: 11px;
  text-align: center;
}

.form-error {
  margin: 14px 0 0;
  color: #bd4b50;
  font-size: 12px;
  line-height: 1.5;
}

.mail-mark {
  display: grid;
  width: 52px;
  height: 52px;
  margin-bottom: 22px;
  place-items: center;
  border-radius: 50%;
  background: #e8f6f3;
  color: #1f988f;
}

.mail-mark :deep(svg) {
  width: 26px;
  height: 26px;
}

.waiting-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  border: 1px solid #e1e9e7;
  border-radius: 7px;
  background: #f8faf9;
  color: #5f6e6b;
  font-size: 13px;
}

.waiting-status i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2aa397;
  box-shadow: 0 0 0 5px rgba(42, 163, 151, 0.12);
  animation: pulse 1.8s ease-in-out infinite;
}

.text-button,
.change-button {
  width: 100%;
  min-height: 38px;
  background: transparent;
  color: #65716f;
  font-size: 12px;
}

.text-button {
  margin-top: 6px;
}

.change-button {
  gap: 4px;
  margin-top: 4px;
  color: #228f87;
}

.login-card > footer {
  border-top: 1px solid #edf1f0;
  color: #929b99;
  font-size: 10px;
}

.login-card > footer a {
  color: #5b6966;
  text-decoration: none;
}

.login-step-enter-active,
.login-step-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.login-step-enter-from,
.login-step-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.spinning {
  animation: spin 850ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  50% {
    opacity: 0.45;
    transform: scale(0.8);
  }
}

@media (max-width: 520px) {
  .admin-login {
    padding: 16px;
  }

  .login-card {
    border-radius: 12px;
  }

  form,
  .pending-step {
    padding: 32px 24px 28px;
  }

  .login-card > header,
  .login-card > footer {
    padding-inline: 22px;
  }

  .login-card > footer span {
    max-width: 220px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
