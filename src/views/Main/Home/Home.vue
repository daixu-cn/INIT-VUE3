<template>
  <main
    ref="marketingRoot"
    class="sound-site"
    :class="{ 'is-playing': isPlaying, 'is-en': locale === 'en' }"
  >
    <div class="intro-curtain" aria-hidden="true">
      <div class="intro-curtain__content">
        <img :src="BRAND_WORDMARK_URL" alt="" />
        <span
          ><VoiceWave
            :active="true"
            :density="76"
            :energy="0.82"
            :suspended="isScrolling"
            variant="line"
        /></span>
        <small>{{ t.intro }}</small>
      </div>
    </div>

    <header class="site-header" :class="{ 'site-header--solid': hasScrolled }">
      <button class="brand" type="button" aria-label="返回 Echo 首页" @click="scrollTo('home')">
        <img :src="BRAND_WORDMARK_URL" alt="Echo" />
      </button>

      <div class="header-actions">
        <nav class="desktop-nav" :aria-label="t.navigationLabel">
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            :class="{ active: activeSection === item.id }"
            @click="scrollTo(item.target)"
          >
            {{ item.label }}
            <i aria-hidden="true" />
          </button>
        </nav>

        <button
          class="language-switch"
          type="button"
          :aria-label="t.switchLanguage"
          @click="toggleLocale"
        >
          <span :class="{ active: locale === 'zh' }">中</span>
          <i aria-hidden="true">/</i>
          <span :class="{ active: locale === 'en' }">EN</span>
        </button>
      </div>

      <a class="header-download" :href="APP_STORE_URL" target="_blank" rel="noreferrer">
        {{ t.download }}
      </a>

      <button
        class="mobile-language-switch"
        type="button"
        :aria-label="t.switchLanguage"
        @click="toggleLocale"
      >
        {{ locale === "zh" ? "EN" : "中" }}
      </button>

      <button
        class="mobile-menu-toggle"
        type="button"
        :aria-expanded="mobileMenuOpen"
        aria-controls="mobile-menu"
        :aria-label="mobileMenuOpen ? t.closeMenu : t.openMenu"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <AppIcon :path="mobileMenuOpen ? mdiClose : mdiMenu" />
      </button>
    </header>

    <aside class="scene-progress" aria-hidden="true">
      <span>{{ activeSceneNumber }}</span>
      <i><b class="scene-progress__fill" /></i>
      <small>05</small>
    </aside>

    <Transition name="menu-fade">
      <nav
        v-if="mobileMenuOpen"
        id="mobile-menu"
        class="mobile-menu"
        :aria-label="t.mobileNavigationLabel"
      >
        <button
          v-for="(item, index) in navItems"
          :key="item.id"
          type="button"
          :class="{ active: activeSection === item.id }"
          @click="scrollTo(item.target)"
        >
          <span>0{{ index + 1 }}</span
          >{{ item.label }}
        </button>
      </nav>
    </Transition>

    <section id="home" class="hero scene" data-nav="home">
      <div class="hero__media" aria-hidden="true">
        <img
          src="/assets/marketing/hero-night-radio.jpg"
          alt=""
          decoding="async"
          fetchpriority="high"
        />
        <span class="hero__shade" />
      </div>

      <div class="hero__content">
        <h1 :aria-label="`${t.heroLead} ${t.heroAccent}`">
          <span class="motion-line" aria-hidden="true">
            <span class="hero-title-lead title-glyph-line">
              <span
                v-for="(glyph, index) in splitTitle(t.heroLead)"
                :key="`${locale}-hero-lead-${index}`"
                class="title-glyph"
                >{{ glyph === " " ? "\u00A0" : glyph }}</span
              >
            </span>
          </span>
          <span class="motion-line" aria-hidden="true">
            <em class="title-glyph-line">
              <span
                v-for="(glyph, index) in splitTitle(t.heroAccent)"
                :key="`${locale}-hero-accent-${index}`"
                class="title-glyph"
                >{{ glyph === " " ? "\u00A0" : glyph }}</span
              >
            </em>
          </span>
        </h1>
        <p>{{ t.heroSubline }}</p>
        <div class="store-actions">
          <a class="store-button" :href="APP_STORE_URL" target="_blank" rel="noreferrer">
            <AppIcon :path="mdiApple" />
            <span
              ><small>{{ t.appStoreAction }}</small
              >App Store</span
            >
          </a>
          <a class="store-button" :href="GOOGLE_PLAY_URL" target="_blank" rel="noreferrer">
            <AppIcon :path="mdiGooglePlay" />
            <span
              ><small>{{ t.googlePlayAction }}</small
              >Google Play</span
            >
          </a>
        </div>
      </div>

      <div class="hero-signal" aria-hidden="true">
        <VoiceWave
          :active="isPlaying"
          :density="170"
          :energy="1.12"
          :suspended="isScrolling"
          variant="line"
        />
      </div>
      <button
        class="scroll-cue"
        type="button"
        :aria-label="t.scrollToVoice"
        @click="scrollTo('voice')"
      >
        <span />
      </button>
    </section>

    <section id="voice" class="voice-scene scene" data-nav="about">
      <div class="voice-scene__inner">
        <h2 :aria-label="`${t.voiceLead}${t.voiceAccent}`">
          <span class="voice-title-line">{{ t.voiceLead }}</span>
          <span class="voice-title-line">{{ t.voiceAccent }}</span>
        </h2>
        <p class="voice-fragment voice-fragment--left">{{ t.voiceLeft }}</p>
        <p class="voice-fragment voice-fragment--center">{{ t.voiceCenter }}</p>
        <p class="voice-fragment voice-fragment--right">{{ t.voiceRight }}</p>

        <div class="voice-field" aria-hidden="true">
          <span class="voice-field__line voice-field__line--main">
            <VoiceWave
              :active="isPlaying"
              :density="108"
              :energy="1.18"
              :suspended="isScrolling"
              variant="hybrid"
            />
          </span>
        </div>

        <button class="voice-toggle" type="button" @click="isPlaying = !isPlaying">
          <AppIcon :path="isPlaying ? mdiPause : mdiPlay" />
          {{ isPlaying ? t.listening : t.continueListening }}
        </button>
      </div>
    </section>

    <section id="memory" class="memory-scene scene" data-nav="privacy">
      <div class="memory-scene__portrait" aria-hidden="true">
        <img src="/assets/marketing/character-susu.jpg" alt="" decoding="async" loading="lazy" />
        <span />
      </div>
      <div class="memory-scene__copy">
        <h2>
          <span class="motion-line"
            ><span>{{ t.memoryLead }}</span></span
          >
          <span class="motion-line"
            ><em>{{ t.memoryAccent }}</em></span
          >
        </h2>
        <blockquote>{{ t.memoryQuote }}</blockquote>
      </div>
      <div class="memory-thread" aria-hidden="true">
        <VoiceWave
          :active="isPlaying"
          :density="158"
          :energy="2"
          :suspended="isScrolling"
          variant="line"
        />
      </div>
    </section>

    <section id="characters" class="characters-scene scene" data-nav="aboutUs">
      <h2>{{ t.charactersTitle }}</h2>
      <div class="character-gallery" :aria-label="t.charactersLabel">
        <button
          v-for="(character, index) in characters"
          :key="character.image"
          type="button"
          class="character-card"
          :class="{ active: activeCharacter === index }"
          :aria-label="`${t.selectCharacter} ${character.name[locale]}`"
          @click="activeCharacter = index"
        >
          <img
            :src="character.image"
            :alt="character.name[locale]"
            decoding="async"
            loading="lazy"
          />
          <span>{{ character.name[locale] }}</span>
        </button>
      </div>
      <div class="character-controls">
        <button type="button" :aria-label="t.previousCharacter" @click="selectPreviousCharacter">
          <AppIcon :path="mdiChevronLeft" />
        </button>
        <span>{{ activeCharacter + 1 }} / {{ characters.length }}</span>
        <button type="button" :aria-label="t.nextCharacter" @click="selectNextCharacter">
          <AppIcon :path="mdiChevronRight" />
        </button>
      </div>
    </section>

    <section id="download" class="download-scene scene" data-nav="aboutUs">
      <div class="download-scene__content">
        <h2>
          <span class="download-title-line">
            {{ t.downloadLead }}<em>{{ t.downloadAccent }}</em>
          </span>
          <span class="download-title-line">{{ t.downloadTail }}</span>
        </h2>
        <div class="store-actions">
          <a class="store-button" :href="APP_STORE_URL" target="_blank" rel="noreferrer">
            <AppIcon :path="mdiApple" />
            <span
              ><small>{{ t.appStoreAction }}</small
              >App Store</span
            >
          </a>
          <a class="store-button" :href="GOOGLE_PLAY_URL" target="_blank" rel="noreferrer">
            <AppIcon :path="mdiGooglePlay" />
            <span
              ><small>{{ t.googlePlayAction }}</small
              >Google Play</span
            >
          </a>
        </div>
      </div>
      <div class="download-thread" aria-hidden="true">
        <VoiceWave
          :active="isPlaying"
          :density="170"
          :energy="2.5"
          :suspended="isScrolling"
          variant="line"
        />
      </div>
    </section>

    <footer class="site-footer">
      <img :src="BRAND_WORDMARK_URL" alt="Echo" />
      <nav :aria-label="t.footerNavigationLabel">
        <RouterLink to="/privacy">{{ t.privacyPolicy }}</RouterLink>
        <RouterLink to="/terms">{{ t.terms }}</RouterLink>
        <a href="mailto:support@yygo.tv">{{ t.aboutUs }}</a>
        <RouterLink to="/admin/login">{{ t.admin }}</RouterLink>
      </nav>
      <small>© 2026 Echo. All rights reserved.</small>
    </footer>
  </main>
</template>

<script setup lang="ts">
import {
  mdiApple,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiGooglePlay,
  mdiMenu,
  mdiPause,
  mdiPlay,
} from "@mdi/js"
import gsap from "gsap"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue"

import AppIcon from "@/components/AppIcon.vue"
import VoiceWave from "@/components/VoiceWave.vue"
import { APP_STORE_URL, BRAND_WORDMARK_URL, GOOGLE_PLAY_URL } from "@/global/env"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

type Locale = "zh" | "en"
type SceneId = "home" | "voice" | "memory" | "characters" | "download"

const sceneOrder: SceneId[] = ["home", "voice", "memory", "characters", "download"]

const copy = {
  zh: {
    intro: "别担心我在听",
    navigationLabel: "官网章节导航",
    mobileNavigationLabel: "移动端导航",
    navHome: "首页",
    navAbout: "关于 Echo",
    navPrivacy: "隐私",
    navAboutUs: "关于我们",
    switchLanguage: "切换到 English",
    download: "下载",
    openMenu: "打开导航菜单",
    closeMenu: "关闭导航菜单",
    heroLead: "在每一次回应里",
    heroAccent: "更懂彼此",
    heroSubline: "随时开口她正在听",
    appStoreAction: "下载",
    googlePlayAction: "立即获取",
    scrollToVoice: "滚动到实时通话",
    voiceLead: "自然打断",
    voiceAccent: "即时回应",
    voiceLeft: "你在听吗",
    voiceCenter: "其实我今天有点累",
    voiceRight: "那你觉得我该怎么办",
    listening: "正在聆听",
    continueListening: "继续聆听",
    memoryLead: "她记得",
    memoryAccent: "也尊重你的边界",
    memoryQuote: "下周一一起去听那场音乐会吗",
    charactersTitle: "遇见契合的声音",
    charactersLabel: "Echo 角色",
    selectCharacter: "选择角色",
    previousCharacter: "上一个角色",
    nextCharacter: "下一个角色",
    downloadLead: "开始一段会",
    downloadAccent: "延续",
    downloadTail: "的对话",
    privacyPolicy: "隐私政策",
    terms: "服务条款",
    aboutUs: "关于我们",
    admin: "管理员入口",
    footerNavigationLabel: "页脚导航",
  },
  en: {
    intro: "I'm listening.",
    navigationLabel: "Website sections",
    mobileNavigationLabel: "Mobile navigation",
    navHome: "Home",
    navAbout: "About Echo",
    navPrivacy: "Privacy",
    navAboutUs: "About Us",
    switchLanguage: "切换到中文",
    download: "Download",
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
    heroLead: "In every response,",
    heroAccent: "closer to you.",
    heroSubline: "Say anything. She's listening.",
    appStoreAction: "Download on",
    googlePlayAction: "Get it on",
    scrollToVoice: "Scroll to voice calls",
    voiceLead: "Interrupt naturally. ",
    voiceAccent: "Respond instantly.",
    voiceLeft: "“Are you listening?”",
    voiceCenter: "“Today felt a little heavy…”",
    voiceRight: "“What do you think I should do?”",
    listening: "Listening",
    continueListening: "Keep listening",
    memoryLead: "She remembers,",
    memoryAccent: "and respects your boundaries.",
    memoryQuote: "“Shall we hear that concert together next Monday?”",
    charactersTitle: "Meet a voice that feels right.",
    charactersLabel: "Echo characters",
    selectCharacter: "Select character",
    previousCharacter: "Previous character",
    nextCharacter: "Next character",
    downloadLead: "Begin a conversation that ",
    downloadAccent: "continues",
    downloadTail: ".",
    privacyPolicy: "Privacy",
    terms: "Terms",
    aboutUs: "About Us",
    admin: "Admin",
    footerNavigationLabel: "Footer navigation",
  },
} as const

const locale = ref<Locale>("zh")
const t = computed(() => copy[locale.value])
const navItems = computed(() => [
  { id: "home", target: "home", label: t.value.navHome },
  { id: "about", target: "voice", label: t.value.navAbout },
  { id: "privacy", target: "memory", label: t.value.navPrivacy },
  { id: "aboutUs", target: "characters", label: t.value.navAboutUs },
])

const characters = [
  { name: { zh: "苏禾", en: "Su He" }, image: "/assets/marketing/character-susu.jpg" },
  { name: { zh: "凛", en: "Rin" }, image: "/assets/marketing/hero-night-radio.jpg" },
  { name: { zh: "言澈", en: "Yan Che" }, image: "/assets/marketing/character-yanche.jpg" },
] as const

const marketingRoot = ref<HTMLElement>()
const activeSection = ref("home")
const activeScene = ref<SceneId>("home")
const activeSceneNumber = computed(() =>
  String(Math.max(0, sceneOrder.indexOf(activeScene.value)) + 1).padStart(2, "0"),
)
const activeCharacter = ref(1)
const hasScrolled = ref(false)
const isScrolling = ref(false)
const isPlaying = ref(true)
const mobileMenuOpen = ref(false)
let motionContext: gsap.Context | undefined
let motionMedia: ReturnType<typeof gsap.matchMedia> | undefined
let previousDocumentLanguage = ""
let scrollStopTimer = 0

function splitTitle(value: string) {
  return Array.from(value)
}

async function toggleLocale() {
  locale.value = locale.value === "zh" ? "en" : "zh"
  document.documentElement.lang = locale.value === "zh" ? "zh-CN" : "en"
  await nextTick()
  ScrollTrigger.refresh()
}

function scrollTo(id: string) {
  mobileMenuOpen.value = false
  const target = document.getElementById(id)
  if (!target) return

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.scrollIntoView({ block: "start" })
    return
  }

  const targetY = target.getBoundingClientRect().top + window.scrollY

  gsap.to(window, {
    duration: 1.1,
    scrollTo: { y: targetY, autoKill: true },
    ease: "power3.inOut",
  })
}

function handlePageScroll() {
  hasScrolled.value = window.scrollY > 24
  if (!isScrolling.value) isScrolling.value = true
  window.clearTimeout(scrollStopTimer)
  scrollStopTimer = window.setTimeout(() => {
    isScrolling.value = false
  }, 140)
}

function selectPreviousCharacter() {
  activeCharacter.value = (activeCharacter.value + characters.length - 1) % characters.length
}

function selectNextCharacter() {
  activeCharacter.value = (activeCharacter.value + 1) % characters.length
}

function initializeMotion() {
  const root = marketingRoot.value
  if (!root) return

  motionContext = gsap.context(() => {
    motionMedia = gsap.matchMedia()

    motionMedia.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ".scene-progress__fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            start: 0,
            end: () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      )

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.set(".intro-curtain", { display: "none" })
          gsap.set(".hero .title-glyph", { clearProps: "transform,opacity,visibility" })
        },
      })

      intro
        .from(".intro-curtain__content img", { y: 22, autoAlpha: 0, duration: 0.7 })
        .from(
          ".intro-curtain__content :is(span, small)",
          { y: 14, autoAlpha: 0, duration: 0.55, stagger: 0.12 },
          "-=0.36",
        )
        .to(".intro-curtain__content", { y: -24, autoAlpha: 0, duration: 0.55, delay: 0.28 })
        .to(
          ".intro-curtain",
          { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "power4.inOut" },
          "-=0.2",
        )
        .from(
          ".hero .title-glyph",
          {
            yPercent: 118,
            autoAlpha: 0,
            duration: 0.92,
            stagger: { amount: 0.3, from: "start" },
            ease: "power4.out",
          },
          "-=0.52",
        )
        .from(
          ".hero__content > :is(p, .store-actions)",
          { y: 24, autoAlpha: 0, duration: 0.72, stagger: 0.1 },
          "-=0.72",
        )
        .from(
          ".scene-progress",
          { x: 16, autoAlpha: 0, duration: 0.62, ease: "power3.out" },
          "-=0.56",
        )

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(".hero__media img", { xPercent: 2, scale: 1.1, ease: "none" }, 0)
        .to(".hero__shade", { opacity: 0.9, ease: "none" }, 0)
        .to(".hero__content", { yPercent: -20, autoAlpha: 0.14, ease: "none" }, 0)
        .to(".hero h1", { xPercent: -3, yPercent: -8, rotateX: 8, autoAlpha: 0.1 }, 0)
        .to(".hero .store-actions", { xPercent: 5, ease: "none" }, 0)
        .to(
          ".hero-signal",
          { xPercent: 4, yPercent: -28, scaleY: 1.5, autoAlpha: 0.42, ease: "none" },
          0,
        )
        .to(".scroll-cue", { autoAlpha: 0, y: 18, ease: "none" }, 0)

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".voice-scene",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          ".voice-scene h2",
          { y: 112, rotateX: -18, autoAlpha: 0 },
          { y: 0, rotateX: 0, autoAlpha: 1, duration: 0.32, ease: "power4.out" },
          0.06,
        )
        .to(".voice-scene h2", { y: -76, rotateX: 12, autoAlpha: 0.1, duration: 0.2 }, 0.81)
        .fromTo(
          ".voice-field",
          { yPercent: 24, scaleX: 0.22, scaleY: 0.28, rotateX: 68, autoAlpha: 0.04 },
          {
            yPercent: 0,
            scaleX: 1,
            scaleY: 1.28,
            rotateX: 0,
            autoAlpha: 1,
            duration: 0.54,
            ease: "power4.out",
          },
          0.12,
        )
        .to(
          ".voice-field",
          {
            yPercent: -12,
            scaleX: 0.82,
            scaleY: 0.7,
            rotateX: -16,
            autoAlpha: 0.38,
            duration: 0.23,
          },
          0.77,
        )
        .fromTo(
          ".voice-fragment--left",
          { x: -110, scale: 0.72, autoAlpha: 0 },
          { x: 0, scale: 1, autoAlpha: 1, duration: 0.32, ease: "power3.out" },
          0.28,
        )
        .fromTo(
          ".voice-fragment--center",
          { y: 48, scale: 0.76, autoAlpha: 0 },
          { y: 0, scale: 1, autoAlpha: 1, duration: 0.32, ease: "power3.out" },
          0.38,
        )
        .fromTo(
          ".voice-fragment--right",
          { x: 110, scale: 0.72, autoAlpha: 0 },
          { x: 0, scale: 1, autoAlpha: 1, duration: 0.32, ease: "power3.out" },
          0.32,
        )
        .fromTo(
          ".voice-toggle",
          { y: 30, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.26, ease: "power2.out" },
          0.38,
        )

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".memory-scene",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          ".memory-scene__portrait img",
          { xPercent: -4, scale: 1.17, yPercent: -5 },
          { xPercent: 1, scale: 1.015, yPercent: 5, ease: "none" },
          0,
        )
        .fromTo(
          ".memory-scene__copy",
          { xPercent: 24, scale: 0.86, rotateY: -14, autoAlpha: 0 },
          {
            xPercent: 0,
            scale: 1,
            rotateY: 0,
            autoAlpha: 1,
            duration: 0.38,
            ease: "power4.out",
          },
          0.17,
        )
        .fromTo(
          ".memory-scene .motion-line > *",
          { yPercent: 115 },
          { yPercent: 0, duration: 0.28, stagger: 0.08, ease: "power3.out" },
          0.26,
        )
        .fromTo(
          ".memory-scene blockquote",
          { x: 42, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out" },
          0.43,
        )
        .to(".memory-scene__copy", { yPercent: -12, autoAlpha: 0.26, duration: 0.2 }, 0.8)
        .fromTo(
          ".memory-thread",
          { xPercent: -18, scaleY: 0.7 },
          { xPercent: 12, scaleY: 1.25, ease: "none" },
          0,
        )

      const cards = gsap.utils.toArray<HTMLElement>(".character-card")
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".characters-scene",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: self => {
              activeCharacter.value = Math.min(
                characters.length - 1,
                Math.floor(self.progress * characters.length),
              )
            },
          },
        })
        .fromTo(
          ".characters-scene h2",
          { y: 96, rotateX: -16, autoAlpha: 0 },
          { y: 0, rotateX: 0, autoAlpha: 1, duration: 0.3, ease: "power4.out" },
          0.06,
        )
        .to(".characters-scene h2", { y: -62, rotateX: 10, autoAlpha: 0.1, duration: 0.2 }, 0.81)
        .fromTo(
          cards[0],
          { xPercent: 100, yPercent: 7, scale: 0.8, rotateY: 18, autoAlpha: 0.06 },
          {
            yPercent: 0,
            xPercent: 0,
            scale: 1,
            rotateY: 0,
            autoAlpha: 1,
            duration: 0.46,
            ease: "power2.inOut",
          },
          0.13,
        )
        .fromTo(
          cards[1],
          { yPercent: 8, scale: 1.07, autoAlpha: 0.62, zIndex: 3 },
          {
            yPercent: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.38,
            ease: "power3.out",
          },
          0.13,
        )
        .fromTo(
          cards[2],
          { xPercent: -100, yPercent: 7, scale: 0.8, rotateY: -18, autoAlpha: 0.06 },
          {
            yPercent: 0,
            xPercent: 0,
            scale: 1,
            rotateY: 0,
            autoAlpha: 1,
            duration: 0.46,
            ease: "power2.inOut",
          },
          0.13,
        )
        .to(cards, { yPercent: -5, autoAlpha: 0.48, duration: 0.23 }, 0.77)

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".download-scene",
            start: "top bottom",
            end: "center 38%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          ".download-scene__content",
          { y: 100, autoAlpha: 0.08 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
          0.08,
        )
        .fromTo(
          ".download-scene h2",
          { scale: 0.9 },
          { scale: 1, duration: 0.38, ease: "power2.out" },
          0.12,
        )
        .fromTo(
          ".download-scene .store-button",
          { y: 42, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.32, ease: "power3.out" },
          0.34,
        )
        .fromTo(
          ".download-thread",
          { xPercent: -12, scaleX: 0.28, scaleY: 0.72 },
          { xPercent: 0, scaleX: 1, scaleY: 1.25, duration: 0.72, ease: "none" },
          0,
        )

      gsap.from(".site-footer > *", {
        y: 24,
        autoAlpha: 0,
        duration: 0.62,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".site-footer", start: "top 94%", once: true },
      })
    })

    motionMedia.add("(max-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.set(".intro-curtain", { display: "none" })

      gsap.from(".hero .title-glyph", {
        yPercent: 116,
        autoAlpha: 0,
        duration: 0.9,
        stagger: { amount: 0.28, from: "start" },
        ease: "power4.out",
        onComplete: () =>
          gsap.set(".hero .title-glyph", { clearProps: "transform,opacity,visibility" }),
      })
      gsap.from(".hero__content > :is(p, .store-actions)", {
        y: 24,
        autoAlpha: 0,
        duration: 0.75,
        stagger: 0.1,
        delay: 0.25,
      })

      gsap
        .timeline({
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        })
        .to(".hero__media img", { yPercent: 4, scale: 1.09, ease: "none" }, 0)
        .to(".hero__content", { yPercent: -12, autoAlpha: 0.24, ease: "none" }, 0)
        .to(".hero-signal", { xPercent: 5, scaleY: 1.5, autoAlpha: 0.45, ease: "none" }, 0)

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".voice-scene",
            start: "top 94%",
            end: "bottom 12%",
            scrub: true,
          },
        })
        .fromTo(
          ".voice-scene h2",
          { y: 72, rotateX: -16, autoAlpha: 0 },
          { y: 0, rotateX: 0, autoAlpha: 1, duration: 0.28, ease: "power4.out" },
          0.05,
        )
        .to(".voice-scene h2", { y: -36, autoAlpha: 0.2, duration: 0.18 }, 0.82)
        .fromTo(
          ".voice-field",
          { yPercent: 18, scaleX: 0.28, scaleY: 0.34, rotateX: 58, autoAlpha: 0.08 },
          {
            yPercent: 0,
            scaleX: 1,
            scaleY: 1.2,
            rotateX: 0,
            autoAlpha: 1,
            duration: 0.48,
            ease: "power4.out",
          },
          0.12,
        )
        .to(".voice-field", { yPercent: -8, scaleY: 0.72, autoAlpha: 0.5, duration: 0.2 }, 0.8)
        .fromTo(
          ".voice-fragment--left",
          { x: -46, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.28 },
          0.3,
        )
        .fromTo(
          ".voice-fragment--right",
          { x: 46, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.28 },
          0.38,
        )
        .fromTo(
          ".voice-fragment--center, .voice-toggle",
          { y: 26, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.28, stagger: 0.06 },
          0.35,
        )

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".memory-scene",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })
        .fromTo(
          ".memory-scene__portrait img",
          { yPercent: -4, scale: 1.1 },
          { yPercent: 4, scale: 1.015, ease: "none" },
          0,
        )
        .fromTo(
          ".memory-scene__copy",
          { y: 48, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.3, ease: "power3.out" },
          0.32,
        )
        .to(".memory-scene__copy", { y: -30, autoAlpha: 0.28, duration: 0.18 }, 0.82)
        .fromTo(
          ".memory-thread",
          { xPercent: -16, scaleY: 0.66 },
          { xPercent: 12, scaleY: 1.3, ease: "none" },
          0,
        )

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".characters-scene",
            start: "top 94%",
            end: "center 26%",
            scrub: true,
          },
        })
        .fromTo(
          ".characters-scene h2",
          { y: 58, rotateX: -14, autoAlpha: 0 },
          { y: 0, rotateX: 0, autoAlpha: 1, duration: 0.32, ease: "power4.out" },
          0.05,
        )
        .fromTo(
          ".character-gallery",
          { y: 84, scale: 0.82, rotateX: 14, autoAlpha: 0.08 },
          {
            y: 0,
            scale: 1,
            rotateX: 0,
            autoAlpha: 1,
            duration: 0.54,
            ease: "power4.out",
          },
          0.22,
        )
        .fromTo(
          ".character-controls",
          { y: 22, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.26 },
          0.58,
        )

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".download-scene",
            start: "top 94%",
            end: "center 36%",
            scrub: true,
          },
        })
        .fromTo(
          ".download-scene__content",
          { y: 72, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.48, ease: "power3.out" },
          0.12,
        )
        .fromTo(
          ".download-scene .store-button",
          { x: 34, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.28, stagger: 0.08 },
          0.38,
        )
        .fromTo(
          ".download-thread",
          { xPercent: -14, scaleX: 0.3, scaleY: 0.7 },
          { xPercent: 0, scaleX: 1, scaleY: 1.25, duration: 0.74, ease: "none" },
          0,
        )
    })

    motionMedia.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".intro-curtain", { display: "none" })
    })

    gsap.utils.toArray<HTMLElement>("[data-nav]").forEach(section => {
      const id = section.dataset.nav
      if (!id) return
      const sceneId = section.id as SceneId
      const activateSection = () => {
        activeSection.value = id
        if (sceneOrder.includes(sceneId)) activeScene.value = sceneId
      }
      ScrollTrigger.create({
        trigger: section,
        start: "top 52%",
        end: "bottom 52%",
        onEnter: activateSection,
        onEnterBack: activateSection,
      })
    })

    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, root)
}

onMounted(async () => {
  previousDocumentLanguage = document.documentElement.lang
  document.documentElement.classList.add("echo-marketing-active")
  document.documentElement.lang = "zh-CN"
  window.addEventListener("scroll", handlePageScroll, { passive: true })
  await document.fonts.ready
  await nextTick()
  initializeMotion()
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove("echo-marketing-active")
  document.documentElement.lang = previousDocumentLanguage
  window.removeEventListener("scroll", handlePageScroll)
  window.clearTimeout(scrollStopTimer)
  motionMedia?.revert()
  motionContext?.revert()
})
</script>

<style scoped>
.sound-site {
  --ink: #020b0e;
  --ink-soft: #071317;
  --mint: #78c2b6;
  --mint-soft: #a9d9d1;
  --bone: #eeeae5;
  min-width: 0;
  overflow: clip;
  background: var(--ink);
  color: var(--bone);
  font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
}

:global(html.echo-marketing-active) {
  scroll-behavior: auto;
}

.sound-site :is(a, button):focus-visible {
  outline: 2px solid var(--mint-soft);
  outline-offset: 4px;
}

.intro-curtain {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  clip-path: inset(0 0 0 0);
  background: #02090b;
}

.intro-curtain__content {
  display: grid;
  justify-items: center;
  width: min(430px, calc(100% - 3rem));
}

.intro-curtain__content img {
  width: clamp(110px, 10vw, 155px);
  filter: invert(1);
}

.intro-curtain__content > span {
  width: min(310px, 72vw);
  height: 58px;
  margin-top: 1.2rem;
}

.intro-curtain__content small {
  margin-top: 0.65rem;
  color: rgb(255 255 255 / 48%);
  font-family: "Songti SC", STSong, serif;
  letter-spacing: 0.18em;
}

.site-header {
  position: fixed;
  z-index: 40;
  inset: 0 0 auto;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  height: 76px;
  padding: 0 clamp(1.5rem, 3.4vw, 3.5rem);
  color: #fff;
  transition:
    background-color 260ms ease,
    border-color 260ms ease;
}

.site-header--solid {
  border-bottom: 1px solid rgb(255 255 255 / 8%);
  background: rgb(2 11 14 / 94%);
}

.brand {
  justify-self: start;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.brand img,
.site-footer > img {
  display: block;
  width: clamp(78px, 6vw, 96px);
  filter: invert(1);
}

.header-actions {
  display: flex;
  justify-self: end;
  align-items: center;
  gap: clamp(1.35rem, 2.5vw, 2.8rem);
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: clamp(1.35rem, 2.7vw, 3rem);
}

.desktop-nav button {
  position: relative;
  padding: 1.25rem 0;
  border: 0;
  background: transparent;
  color: rgb(255 255 255 / 54%);
  cursor: pointer;
  font: inherit;
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  transition: color 220ms ease;
}

.desktop-nav button i {
  position: absolute;
  bottom: 0.65rem;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 9px var(--mint);
  opacity: 0;
  transform: translate(-50%, 6px);
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.desktop-nav button.active {
  color: #fff;
}

.desktop-nav button.active i {
  opacity: 1;
  transform: translate(-50%, 0);
}

.language-switch {
  display: flex;
  align-items: center;
  gap: 0.32rem;
  padding: 0.42rem 0;
  border: 0;
  background: transparent;
  color: rgb(255 255 255 / 30%);
  cursor: pointer;
  font: inherit;
  font-size: 0.66rem;
  letter-spacing: 0.04em;
}

.language-switch span {
  transition: color 180ms ease;
}

.language-switch span.active,
.language-switch:hover span {
  color: var(--mint-soft);
}

.language-switch i {
  color: rgb(255 255 255 / 20%);
  font-style: normal;
}

.header-download {
  display: none;
  justify-self: end;
  color: rgb(255 255 255 / 72%);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-decoration: none;
  transition: color 180ms ease;
}

.header-download:hover {
  color: var(--mint-soft);
}

.mobile-menu-toggle,
.mobile-language-switch,
.mobile-menu {
  display: none;
}

.scene-progress {
  position: fixed;
  z-index: 38;
  top: 50%;
  right: clamp(1rem, 2vw, 2.25rem);
  display: grid;
  justify-items: center;
  gap: 0.7rem;
  color: rgb(255 255 255 / 58%);
  pointer-events: none;
  transform: translateY(-50%);
}

.scene-progress span,
.scene-progress small {
  font-size: 0.58rem;
  font-weight: 500;
  letter-spacing: 0.12em;
}

.scene-progress small {
  color: rgb(255 255 255 / 24%);
}

.scene-progress > i {
  position: relative;
  width: 1px;
  height: 82px;
  overflow: hidden;
  background: rgb(255 255 255 / 16%);
}

.scene-progress__fill {
  position: absolute;
  inset: 0;
  display: block;
  background: var(--mint-soft);
  box-shadow: 0 0 10px var(--mint);
  transform: scaleY(0);
  transform-origin: top;
}

.scene {
  position: relative;
  scroll-margin-top: 64px;
}

.hero {
  left: 0 !important;
  width: 100vw !important;
  min-height: 100svh;
  overflow: hidden;
  background: #02090c;
}

.hero__media,
.hero__media img,
.hero__shade {
  position: absolute;
  inset: 0;
}

.hero__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 64% center;
  transform: scale(1.02);
}

.hero__shade {
  background:
    linear-gradient(90deg, rgb(2 9 12 / 92%) 0%, rgb(2 9 12 / 62%) 37%, rgb(2 9 12 / 13%) 71%),
    linear-gradient(0deg, #020b0e 0%, rgb(2 11 14 / 48%) 18%, transparent 48%);
  opacity: 0.76;
}

.hero__content {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: clamp(1.75rem, 5.6vw, 6.2rem);
  width: min(1100px, 58vw);
  transform: translateY(-48%);
}

.hero h1,
.voice-scene h2,
.memory-scene h2,
.characters-scene h2,
.download-scene h2 {
  margin: 0;
  font-family: "Songti SC", STSong, "Noto Serif SC", serif;
  font-weight: 400;
  letter-spacing: 0.01em;
}

.hero h1 {
  font-size: clamp(3.5rem, 5.5vw, 6.5rem);
  line-height: 1.12;
}

.hero h1 em,
.memory-scene h2 em,
.download-scene h2 em {
  color: var(--mint);
  font-style: normal;
}

.motion-line {
  display: block;
  overflow: hidden;
}

.hero .motion-line {
  white-space: nowrap;
}

.motion-line > * {
  display: block;
}

.title-glyph-line,
.title-glyph {
  display: inline-block;
}

.title-glyph-line {
  transform-origin: center bottom;
}

.title-glyph {
  transform-origin: center bottom;
}

.hero-title-lead {
  width: max-content;
  white-space: nowrap;
}

.hero__content > p {
  margin: 1.4rem 0 1.75rem;
  color: rgb(255 255 255 / 68%);
  font-size: clamp(0.9rem, 1vw, 1.05rem);
  letter-spacing: 0.12em;
}

.store-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.store-button {
  display: flex;
  align-items: center;
  min-width: 144px;
  gap: 0.65rem;
  padding: 0.66rem 1rem;
  border: 1px solid rgb(255 255 255 / 32%);
  border-radius: 0.35rem;
  background: rgb(0 0 0 / 25%);
  color: #fff;
  text-decoration: none;
  backdrop-filter: blur(12px);
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease;
}

.store-button:hover {
  border-color: var(--mint);
  background: rgb(120 194 182 / 10%);
  transform: translateY(-3px);
}

.store-button .app-icon {
  flex: 0 0 auto;
  font-size: 1.7rem;
}

.store-button span {
  display: flex;
  flex-direction: column;
  font-size: 0.92rem;
  line-height: 1.05;
}

.store-button small {
  margin-bottom: 0.17rem;
  color: rgb(255 255 255 / 58%);
  font-size: 0.56rem;
  letter-spacing: 0.08em;
}

.hero-signal {
  position: absolute;
  z-index: 2;
  right: -8%;
  bottom: -4%;
  left: -8%;
  height: 22vh;
  min-height: 120px;
  color: var(--mint);
  opacity: 0.78;
}

.scroll-cue {
  position: absolute;
  z-index: 3;
  bottom: 1.25rem;
  left: 50%;
  width: 24px;
  height: 42px;
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 999px;
  background: rgb(0 0 0 / 18%);
  cursor: pointer;
  transform: translateX(-50%);
}

.scroll-cue span {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 3px;
  height: 8px;
  border-radius: 999px;
  background: var(--mint-soft);
  animation: scroll-cue 1.8s ease-in-out infinite;
}

.voice-scene {
  left: 0 !important;
  width: 100vw !important;
  min-height: 100svh;
  overflow: hidden;
  background: radial-gradient(circle at 50% 56%, rgb(47 107 101 / 15%), transparent 45%), #020b0e;
}

.voice-scene__inner {
  position: relative;
  min-height: 100svh;
  perspective: 1200px;
}

.voice-scene h2 {
  position: absolute;
  z-index: 3;
  top: 15%;
  left: 50%;
  width: min(860px, calc(100% - 3rem));
  font-size: clamp(2.7rem, 4.2vw, 5rem);
  white-space: nowrap;
  text-align: center;
  transform: translateX(-50%);
  transform-origin: center bottom;
}

.voice-scene h2 > .voice-title-line {
  display: inline-block;
  color: var(--bone);
}

.voice-title-line + .voice-title-line {
  margin-inline-start: 0.2em;
}

.voice-fragment {
  position: absolute;
  z-index: 3;
  margin: 0;
  color: rgb(238 234 229 / 54%);
  font-family: "Songti SC", STSong, serif;
  font-size: clamp(0.78rem, 1vw, 1rem);
  letter-spacing: 0.08em;
}

.voice-fragment--left {
  top: 36%;
  left: 10%;
}

.voice-fragment--center {
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
}

.voice-fragment--right {
  top: 36%;
  right: 9%;
}

.voice-field {
  position: absolute;
  z-index: 1;
  top: 31%;
  right: -8%;
  bottom: 11%;
  left: -8%;
  backface-visibility: hidden;
  transform-origin: center;
}

.voice-field__line {
  position: absolute;
  inset: 0;
  color: var(--mint-soft);
}

.voice-toggle {
  position: absolute;
  z-index: 3;
  right: 4vw;
  bottom: 3rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgb(255 255 255 / 54%);
  cursor: pointer;
  font: inherit;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
}

.voice-toggle .app-icon {
  font-size: 1rem;
}

.memory-scene {
  display: grid;
  grid-template-columns: 58% 42%;
  height: 100svh;
  min-height: 100svh;
  overflow: hidden;
  background: #030b0d;
  perspective: 1400px;
}

.memory-scene__portrait {
  position: relative;
  height: 100svh;
  min-height: 100svh;
  overflow: hidden;
}

.memory-scene__portrait img {
  width: 100%;
  height: 112%;
  object-fit: cover;
  object-position: 51% 40%;
}

.memory-scene__portrait span {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent 54%, #030b0d 100%),
    linear-gradient(0deg, rgb(3 11 13 / 92%) 0%, transparent 25%);
}

.memory-scene__copy {
  position: relative;
  z-index: 2;
  align-self: center;
  padding: 0 clamp(2rem, 5vw, 6.4rem) 0 clamp(1rem, 3vw, 3rem);
  backface-visibility: hidden;
  transform-origin: left center;
}

.memory-scene h2 {
  font-size: clamp(2.8rem, 3.7vw, 4.5rem);
  line-height: 1.3;
}

.memory-scene .motion-line {
  white-space: nowrap;
}

.memory-scene blockquote {
  margin: 2rem 0 0;
  color: rgb(238 234 229 / 58%);
  font-family: "Songti SC", STSong, serif;
  font-size: clamp(0.92rem, 1.25vw, 1.25rem);
  letter-spacing: 0.05em;
  line-height: 1.8;
}

.memory-thread {
  position: absolute;
  z-index: 3;
  right: -20%;
  bottom: 0;
  left: -20%;
  height: 17%;
  color: var(--mint);
  opacity: 0.7;
}

.characters-scene {
  left: 0 !important;
  width: 100vw !important;
  min-height: 100svh;
  overflow: hidden;
  background: #020b0e;
}

.characters-scene h2 {
  position: absolute;
  z-index: 4;
  top: 12.5%;
  left: 50%;
  font-size: clamp(2.4rem, 3.6vw, 4.4rem);
  white-space: nowrap;
  transform: translateX(-50%);
  transform-origin: center bottom;
}

.character-gallery {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  perspective: 1300px;
}

.character-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 0;
  border: 0;
  border-right: 1px solid rgb(255 255 255 / 7%);
  background: #071012;
  color: #fff;
  cursor: pointer;
  backface-visibility: hidden;
  transform-origin: center;
}

.character-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgb(2 11 14 / 88%) 0%, transparent 42%), rgb(2 11 14 / 24%);
  transition: background-color 320ms ease;
}

.character-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  transform: scale(1.035);
  transition:
    opacity 480ms ease,
    transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
}

.character-card:nth-child(2) img {
  object-position: 66% center;
}

.character-card span {
  position: absolute;
  z-index: 2;
  bottom: 8%;
  left: 50%;
  color: rgb(255 255 255 / 78%);
  font-family: "Songti SC", STSong, serif;
  font-size: clamp(1.5rem, 2vw, 2.35rem);
  letter-spacing: 0.12em;
  transform: translateX(-50%);
}

.character-card span::after {
  content: "";
  display: block;
  width: 28px;
  height: 1px;
  margin: 0.55rem auto 0;
  background: var(--mint);
  box-shadow: 0 0 8px var(--mint);
}

.character-card:hover img,
.character-card.active img {
  opacity: 1;
  transform: scale(1);
}

.character-controls {
  display: none;
}

.download-scene {
  display: grid;
  place-items: center;
  min-height: 58svh;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 110%, rgb(69 147 139 / 22%), transparent 45%), #020b0e;
}

.download-scene__content {
  position: relative;
  z-index: 2;
  display: grid;
  justify-items: center;
}

.download-scene h2 {
  margin-bottom: 2rem;
  font-size: clamp(2.7rem, 4.2vw, 5rem);
  white-space: nowrap;
  text-align: center;
}

.download-title-line {
  display: inline;
}

.download-scene .store-actions {
  justify-content: center;
  align-items: stretch;
}

.download-scene .store-button {
  min-width: 164px;
  justify-content: flex-start;
}

.download-thread {
  position: absolute;
  z-index: 1;
  right: -7%;
  bottom: 2%;
  left: -7%;
  height: 17%;
  color: var(--mint);
  opacity: 0.68;
  transform-origin: center;
}

.site-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 82px;
  gap: 2rem;
  padding: 1.4rem clamp(1.5rem, 3.4vw, 3.5rem);
  border-top: 1px solid rgb(255 255 255 / 7%);
  background: #020b0e;
}

.site-footer nav {
  display: flex;
  gap: clamp(1.2rem, 2.8vw, 2.8rem);
}

.site-footer a,
.site-footer small {
  color: rgb(255 255 255 / 34%);
  font-size: 0.66rem;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition: color 180ms ease;
}

.site-footer a:hover {
  color: var(--mint-soft);
}

.site-footer small {
  justify-self: end;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity 260ms ease,
    transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@keyframes scroll-cue {
  0%,
  100% {
    opacity: 0.3;
    transform: translate(-50%, 0);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, 12px);
  }
}

@media (max-width: 900px) {
  .scene-progress {
    display: none;
  }

  .site-header {
    grid-template-columns: 1fr auto auto auto;
    gap: 0.55rem;
    height: 62px;
    padding-inline: 1rem;
  }

  .header-actions {
    display: none;
  }

  .brand img {
    width: 72px;
  }

  .header-download {
    display: block;
    padding: 0.48rem 0.78rem;
    border: 1px solid rgb(255 255 255 / 22%);
    border-radius: 999px;
    font-size: 0.65rem;
  }

  .mobile-language-switch {
    display: grid;
    place-items: center;
    min-width: 32px;
    height: 34px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--mint-soft);
    cursor: pointer;
    font: inherit;
    font-size: 0.67rem;
    letter-spacing: 0.05em;
  }

  .mobile-menu-toggle {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #fff;
    cursor: pointer;
    font-size: 1.4rem;
  }

  .mobile-menu {
    position: fixed;
    z-index: 35;
    inset: 0;
    display: flex;
    justify-content: center;
    flex-direction: column;
    gap: 0.45rem;
    padding: 5rem 1.5rem 2rem;
    background: rgb(2 11 14 / 96%);
    backdrop-filter: blur(18px);
  }

  .mobile-menu button {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 0.75rem 0;
    border: 0;
    background: transparent;
    color: rgb(255 255 255 / 48%);
    cursor: pointer;
    font-family: "Songti SC", STSong, serif;
    font-size: clamp(2.3rem, 10vw, 4rem);
    text-align: left;
  }

  .mobile-menu button span {
    color: var(--mint);
    font-family: Inter, sans-serif;
    font-size: 0.65rem;
  }

  .mobile-menu button.active {
    color: #fff;
  }

  .hero {
    min-height: 100svh;
  }

  .hero__media {
    height: 62%;
  }

  .hero__media img {
    object-position: 66% center;
  }

  .hero__shade {
    background:
      linear-gradient(0deg, #020b0e 4%, rgb(2 11 14 / 20%) 46%, rgb(2 11 14 / 8%) 78%),
      linear-gradient(90deg, rgb(2 11 14 / 48%) 0%, transparent 70%);
    opacity: 1;
  }

  .hero__content {
    top: 43%;
    left: 1.25rem;
    width: calc(100% - 2.5rem);
    transform: none;
  }

  .hero h1 {
    font-size: clamp(2.5rem, 10.7vw, 4.4rem);
    line-height: 1.1;
  }

  .hero__content > p {
    margin-top: 1.2rem;
  }

  .hero .store-actions {
    align-items: stretch;
    flex-direction: column;
    width: min(230px, 100%);
  }

  .hero .store-button {
    justify-content: flex-start;
  }

  .hero-signal {
    bottom: 0;
    height: 15%;
  }

  .scroll-cue {
    display: none;
  }

  .voice-scene,
  .voice-scene__inner {
    min-height: 100svh;
  }

  .voice-scene h2 {
    top: 12%;
    width: calc(100% - 2.5rem);
    font-size: clamp(2.65rem, 11vw, 4.5rem);
    line-height: 1.28;
    white-space: normal;
  }

  .voice-scene h2 > .voice-title-line {
    display: block;
  }

  .voice-title-line + .voice-title-line {
    margin-inline-start: 0;
  }

  .voice-field {
    top: 28%;
    right: -30%;
    bottom: 13%;
    left: -30%;
  }

  .voice-fragment {
    font-size: 0.72rem;
  }

  .voice-fragment--left {
    top: 35%;
    left: 1.25rem;
  }

  .voice-fragment--right {
    top: 68%;
    right: 1.25rem;
  }

  .voice-fragment--center {
    bottom: 8.5rem;
    width: 100%;
    text-align: center;
  }

  .voice-toggle {
    right: 1.25rem;
    bottom: 2rem;
  }

  .memory-scene {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
  }

  .memory-scene__portrait {
    height: 60svh;
    min-height: 0;
  }

  .memory-scene__portrait img {
    height: 100%;
    object-position: 48% 34%;
  }

  .memory-scene__portrait span {
    background: linear-gradient(0deg, #030b0d 0%, transparent 38%);
  }

  .memory-scene__copy {
    min-height: 0;
    padding: 1.5rem 1.25rem 6rem;
  }

  .memory-scene h2 {
    font-size: clamp(2.25rem, 9.6vw, 4rem);
  }

  .memory-scene blockquote {
    max-width: 22rem;
    margin-top: 1.5rem;
  }

  .memory-thread {
    bottom: 0;
    height: 12%;
  }

  .characters-scene {
    min-height: 100svh;
  }

  .characters-scene h2 {
    top: 6.8rem;
    width: calc(100% - 2.5rem);
    font-size: clamp(2.1rem, 8.9vw, 3.45rem);
    white-space: nowrap;
    text-align: center;
  }

  .character-gallery {
    top: 12.5rem;
    right: auto;
    bottom: 5.5rem;
    left: 50%;
    display: block;
    width: min(74vw, 340px);
    overflow: visible;
    transform: translateX(-50%);
  }

  .character-card {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 1px solid rgb(255 255 255 / 10%);
    opacity: 0;
    pointer-events: none;
    transform: translateX(0) scale(0.88);
    transition:
      opacity 450ms ease,
      transform 650ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .character-card.active {
    z-index: 2;
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0) scale(1);
  }

  .character-card:has(+ .character-card.active) {
    z-index: 1;
    opacity: 0.34;
    transform: translateX(-73%) scale(0.84);
  }

  .character-card.active + .character-card {
    z-index: 1;
    opacity: 0.34;
    transform: translateX(73%) scale(0.84);
  }

  .character-card img {
    opacity: 0.9;
  }

  .character-controls {
    position: absolute;
    z-index: 5;
    right: 0;
    bottom: 1.8rem;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  .character-controls button {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 1px solid rgb(255 255 255 / 18%);
    border-radius: 50%;
    background: transparent;
    color: #fff;
    cursor: pointer;
    font-size: 1.15rem;
  }

  .character-controls span {
    color: rgb(255 255 255 / 42%);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
  }

  .download-scene {
    align-content: start;
    min-height: min(620px, 82svh);
    padding-top: clamp(4.5rem, 10svh, 6.25rem);
    padding-inline: 1.25rem;
  }

  .download-scene__content {
    width: 100%;
  }

  .download-scene h2 {
    max-width: none;
    font-size: clamp(2.55rem, 10.5vw, 4.2rem);
    line-height: 1.25;
    white-space: normal;
  }

  .download-title-line {
    display: block;
    white-space: nowrap;
  }

  .is-en .download-title-line {
    white-space: normal;
  }

  .download-scene .store-actions {
    flex-direction: column;
    width: min(240px, 100%);
  }

  .download-scene .store-button {
    justify-content: flex-start;
  }

  .site-footer {
    grid-template-columns: 1fr;
    min-height: auto;
    gap: 1.3rem;
    padding: 2.2rem 1.25rem;
  }

  .site-footer nav {
    flex-wrap: wrap;
    gap: 1rem 1.35rem;
  }

  .site-footer small {
    justify-self: start;
  }
}

@media (max-width: 420px) {
  .hero__content {
    top: 42%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro-curtain {
    display: none;
  }

  .sound-site *,
  .sound-site *::before,
  .sound-site *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
