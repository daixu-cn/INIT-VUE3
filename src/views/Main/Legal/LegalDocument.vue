<template>
  <main class="legal-page">
    <div class="legal-page__glow legal-page__glow--top" aria-hidden="true" />
    <div class="legal-page__glow legal-page__glow--bottom" aria-hidden="true" />

    <header class="legal-header">
      <RouterLink class="legal-brand" to="/" aria-label="返回 Echo 首页">
        <img :src="BRAND_WORDMARK_URL" alt="Echo" />
      </RouterLink>

      <div class="legal-header__actions">
        <RouterLink class="legal-back" to="/">
          <span aria-hidden="true">←</span>
          {{ documentCopy.backHome }}
        </RouterLink>
        <button class="legal-language" type="button" @click="toggleLocale">
          {{ locale === "zh" ? "EN" : "中" }}
        </button>
      </div>
    </header>

    <div class="legal-layout">
      <section class="legal-hero" aria-labelledby="legal-title">
        <p class="legal-eyebrow">ECHO / LEGAL</p>
        <h1 id="legal-title">{{ documentCopy.title }}</h1>
        <p class="legal-hero__summary">{{ documentCopy.summary }}</p>
        <div class="legal-meta">
          <span>{{ documentCopy.lastUpdatedLabel }}</span>
          <strong>{{ documentCopy.lastUpdated }}</strong>
        </div>
      </section>

      <div class="legal-content">
        <aside class="legal-aside" :aria-label="documentCopy.contentsLabel">
          <p>{{ documentCopy.contentsLabel }}</p>
          <nav>
            <a v-for="section in documentCopy.sections" :key="section.id" :href="`#${section.id}`">
              {{ section.title }}
            </a>
          </nav>
          <RouterLink class="legal-related" :to="documentCopy.relatedPath">
            <span>{{ documentCopy.relatedLabel }}</span>
            <span aria-hidden="true">↗</span>
          </RouterLink>
        </aside>

        <article class="legal-article">
          <section
            v-for="section in documentCopy.sections"
            :id="section.id"
            :key="section.id"
            class="legal-section"
          >
            <div class="legal-section__index" aria-hidden="true">{{ section.number }}</div>
            <div>
              <h2>{{ section.title }}</h2>
              <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
              <ul v-if="section.bullets?.length">
                <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
              </ul>
            </div>
          </section>

          <div class="legal-contact">
            <p class="legal-eyebrow">{{ documentCopy.contactEyebrow }}</p>
            <h2>{{ documentCopy.contactTitle }}</h2>
            <p>{{ documentCopy.contactBody }}</p>
            <a href="mailto:support@yygo.tv">support@yygo.tv</a>
          </div>
        </article>
      </div>
    </div>

    <footer class="legal-footer">
      <span>© 2026 Echo</span>
      <nav :aria-label="documentCopy.footerLabel">
        <RouterLink to="/privacy">{{ documentCopy.privacyLink }}</RouterLink>
        <RouterLink to="/terms">{{ documentCopy.termsLink }}</RouterLink>
      </nav>
      <span>{{ documentCopy.footerNote }}</span>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"

import { BRAND_WORDMARK_URL } from "@/global/env"

type DocumentKind = "privacy" | "terms"
type Locale = "en" | "zh"

interface LegalSection {
  id: string
  number: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

interface LegalCopy {
  title: string
  summary: string
  lastUpdatedLabel: string
  lastUpdated: string
  contentsLabel: string
  backHome: string
  relatedPath: `/${DocumentKind}`
  relatedLabel: string
  contactEyebrow: string
  contactTitle: string
  contactBody: string
  footerLabel: string
  privacyLink: string
  termsLink: string
  footerNote: string
  sections: LegalSection[]
}

const props = defineProps<{ documentType: DocumentKind }>()
const locale = ref<Locale>("zh")
const previousDocumentLanguage = ref("")

const documents: Record<DocumentKind, Record<Locale, LegalCopy>> = {
  terms: {
    zh: {
      title: "服务条款",
      summary: "使用 Echo 前，请花一点时间了解你与 Echo 之间的约定。",
      lastUpdatedLabel: "最后更新",
      lastUpdated: "2026 年 8 月 12 日",
      contentsLabel: "本页内容",
      backHome: "返回首页",
      relatedPath: "/privacy",
      relatedLabel: "查看隐私政策",
      contactEyebrow: "KEEP IN TOUCH",
      contactTitle: "对这些条款有疑问？",
      contactBody: "如果你需要帮助，或希望反馈与账号、内容或服务有关的问题，请联系我们。",
      footerLabel: "法律文档导航",
      privacyLink: "隐私政策",
      termsLink: "服务条款",
      footerNote: "Relationships that remember and grow.",
      sections: [
        {
          id: "agreement",
          number: "01",
          title: "接受条款",
          paragraphs: [
            "欢迎使用 Echo。访问或使用 Echo 的网站、移动应用及相关服务，即表示你已阅读、理解并同意受本服务条款约束。如果你不同意这些条款，请不要使用 Echo。",
            "如果你代表未成年人或其他个人使用 Echo，你需要确保自己拥有相应的授权，并对其使用行为负责。",
          ],
        },
        {
          id: "service",
          number: "02",
          title: "服务说明",
          paragraphs: [
            "Echo 提供以 AI 角色、文字交流、语音交流、记忆和个性化互动为核心的陪伴服务。具体功能可能因地区、设备、版本、账号状态或技术条件而有所不同。",
            "Echo 中的 AI 回复由自动化系统生成，可能存在错误、不完整或不符合预期的内容。Echo 不替代医疗、心理、法律、财务或其他专业意见，也不应被用于处理紧急情况。",
          ],
        },
        {
          id: "account",
          number: "03",
          title: "账号与使用责任",
          paragraphs: [
            "你应提供真实、准确且保持最新的信息，并妥善保管用于登录 Echo 的凭据。通过你的账号发生的活动，通常由你承担责任；如果你发现账号存在未经授权的使用，请尽快联系我们。",
            "你只能以合法方式使用 Echo，并应尊重其他用户、角色创作者和服务提供方的权利。",
          ],
          bullets: [
            "不得利用 Echo 进行欺诈、骚扰、威胁、诽谤、歧视、违法或危害他人的行为。",
            "不得上传或传播侵犯他人知识产权、隐私权或其他合法权益的内容。",
            "不得尝试绕过安全措施、干扰服务运行、抓取服务数据或对服务进行逆向工程。",
            "不得将 Echo 的输出误称为真人、专业机构或其他第三方的意见。",
          ],
        },
        {
          id: "content",
          number: "04",
          title: "你的内容与 AI 输出",
          paragraphs: [
            "你保留对自己提交到 Echo 的内容所拥有的权利。为了提供、维护、保护和改进服务，你授予 Echo 一项在服务所需范围内使用、存储、处理和展示该内容的非独占许可。具体的数据处理方式请参阅隐私政策。",
            "你应确保自己拥有提交内容所需的权利。对于你提交的内容以及由此产生的后果，你承担相应责任。",
            "AI 输出可能不唯一，也不一定准确。你应自行判断是否依赖、保存、分享或采取基于 AI 输出的行动。",
          ],
        },
        {
          id: "payments",
          number: "05",
          title: "订阅、购买与退款",
          paragraphs: [
            "Echo 的部分功能可能需要订阅或购买点数。价格、计费周期、自动续订和可用权益会在购买页面或相关应用商店页面展示，并以你确认购买时显示的内容为准。",
            "通过 Apple App Store 或 Google Play 发起的交易，还受相应应用商店的付款条款、退款规则和订阅管理机制约束。你可以在购买平台管理或取消订阅；取消通常不会撤销当前计费周期已生效的权益。",
            "如果购买状态、权益发放或退款出现问题，请先通过购买平台的订单渠道处理，并可同时联系我们协助核查。",
          ],
        },
        {
          id: "intellectual-property",
          number: "06",
          title: "知识产权",
          paragraphs: [
            "Echo 的软件、品牌、界面、视觉素材、文字、音频、技术和其他服务内容，均受适用的知识产权法律或其他法律保护。除非获得明确授权，你不得复制、修改、分发、出售或创建其衍生作品。",
            "本条款不影响你对自己内容的权利，也不代表 Echo 取得超出提供服务所需范围的所有权。",
          ],
        },
        {
          id: "availability",
          number: "07",
          title: "服务可用性与终止",
          paragraphs: [
            "Echo 会持续维护和改进服务，但无法保证服务始终不中断、无错误或适用于所有设备和网络环境。我们可能因维护、升级、安全、法律要求或其他合理原因调整、暂停或终止部分功能。",
            "如果你违反本条款，或我们有合理理由认为继续提供服务会带来风险，我们可能限制或终止你的访问。你也可以停止使用 Echo，并根据应用内提供的功能申请删除账号或相关数据。",
          ],
        },
        {
          id: "liability",
          number: "08",
          title: "责任范围",
          paragraphs: [
            "在适用法律允许的最大范围内，Echo 不对因你使用或无法使用服务、依赖 AI 输出、网络或第三方服务故障而产生的间接、附带、特殊或后果性损失承担责任。任何不能依法排除或限制的责任，不受本条款影响。",
            "本条款中的任何内容都不限制你依法享有的消费者权利，或排除法律规定不得排除的责任。",
          ],
        },
        {
          id: "changes",
          number: "09",
          title: "条款更新",
          paragraphs: [
            "我们可能根据服务变化、法律要求或运营需要更新本条款。更新后的版本会在本页发布，并通过更新日期反映变更时间。重大变更在适用法律要求的范围内会以适当方式提醒你。",
            "更新生效后继续使用 Echo，即表示你接受更新后的条款。如果你不接受更新，请停止使用服务。",
          ],
        },
      ],
    },
    en: {
      title: "Terms of Service",
      summary:
        "Please take a moment to understand the agreement between you and Echo before using the service.",
      lastUpdatedLabel: "Last updated",
      lastUpdated: "August 12, 2026",
      contentsLabel: "On this page",
      backHome: "Back home",
      relatedPath: "/privacy",
      relatedLabel: "Read the privacy policy",
      contactEyebrow: "KEEP IN TOUCH",
      contactTitle: "Questions about these terms?",
      contactBody:
        "If you need help or want to raise a question about your account, content, or the service, get in touch.",
      footerLabel: "Legal document navigation",
      privacyLink: "Privacy policy",
      termsLink: "Terms of Service",
      footerNote: "Relationships that remember and grow.",
      sections: [
        {
          id: "agreement",
          number: "01",
          title: "Accepting these terms",
          paragraphs: [
            "Welcome to Echo. By visiting or using the Echo website, mobile applications, or related services, you confirm that you have read, understood, and agree to these Terms of Service. If you do not agree, please do not use Echo.",
            "If you use Echo on behalf of a minor or another person, you are responsible for having the required authorization and for their use of the service.",
          ],
        },
        {
          id: "service",
          number: "02",
          title: "The service",
          paragraphs: [
            "Echo provides companionship features centered on AI characters, text conversations, voice conversations, memory, and personalized interaction. Features may vary by region, device, version, account status, or technical conditions.",
            "Echo responses are generated by automated systems and may be wrong, incomplete, or unexpected. Echo is not a substitute for medical, mental-health, legal, financial, or other professional advice, and should not be used for emergencies.",
          ],
        },
        {
          id: "account",
          number: "03",
          title: "Accounts and responsible use",
          paragraphs: [
            "You should provide information that is accurate and current, and keep the credentials used to access Echo secure. You are generally responsible for activity through your account. Contact us promptly if you discover unauthorized use.",
            "You may use Echo only lawfully and must respect the rights of other users, character creators, and service providers.",
          ],
          bullets: [
            "Do not use Echo for fraud, harassment, threats, defamation, discrimination, unlawful conduct, or harm to others.",
            "Do not upload or distribute content that infringes another person's intellectual-property, privacy, or other legal rights.",
            "Do not bypass security controls, disrupt the service, scrape service data, or reverse engineer the service.",
            "Do not present Echo output as the opinion of a real person, professional institution, or other third party.",
          ],
        },
        {
          id: "content",
          number: "04",
          title: "Your content and AI output",
          paragraphs: [
            "You retain the rights you have in content you submit to Echo. To provide, maintain, protect, and improve the service, you grant Echo a non-exclusive license to use, store, process, and display that content to the extent needed for the service. See the Privacy Policy for more about data processing.",
            "You are responsible for ensuring that you have the rights needed to submit your content and for the consequences of doing so.",
            "AI output may not be unique and may not be accurate. You are responsible for deciding whether to rely on, save, share, or act on that output.",
          ],
        },
        {
          id: "payments",
          number: "05",
          title: "Subscriptions, purchases, and refunds",
          paragraphs: [
            "Some Echo features may require a subscription or point purchase. Prices, billing periods, renewal behavior, and included benefits are shown at checkout or in the relevant app-store listing and apply as displayed when you confirm the purchase.",
            "Transactions made through the Apple App Store or Google Play are also subject to the applicable store's payment terms, refund rules, and subscription-management tools. You can manage or cancel a subscription through the platform where you purchased it; cancellation generally does not remove benefits already active for the current billing period.",
            "For purchase, entitlement, or refund issues, contact the relevant store first and contact us as needed so we can help investigate.",
          ],
        },
        {
          id: "intellectual-property",
          number: "06",
          title: "Intellectual property",
          paragraphs: [
            "Echo software, branding, interfaces, visual materials, text, audio, technology, and other service materials are protected by applicable intellectual-property and other laws. Unless expressly authorized, you may not copy, modify, distribute, sell, or create derivative works from them.",
            "This section does not affect your rights in your own content and does not give Echo ownership beyond what is needed to provide the service.",
          ],
        },
        {
          id: "availability",
          number: "07",
          title: "Availability and termination",
          paragraphs: [
            "Echo works to maintain and improve the service, but cannot promise that it will always be uninterrupted, error-free, or suitable for every device and network. We may adjust, suspend, or end features for maintenance, upgrades, security, legal requirements, or other reasonable reasons.",
            "If you violate these terms, or we reasonably believe continued access creates a risk, we may limit or terminate your access. You may stop using Echo and request deletion of your account or applicable data through the features available in the app.",
          ],
        },
        {
          id: "liability",
          number: "08",
          title: "Limits of liability",
          paragraphs: [
            "To the maximum extent permitted by applicable law, Echo is not responsible for indirect, incidental, special, or consequential losses arising from your use of or inability to use the service, reliance on AI output, or failures of networks or third-party services. Nothing in these terms limits a liability that cannot legally be limited or excluded.",
            "Nothing in these terms limits consumer rights or other protections that apply to you by law.",
          ],
        },
        {
          id: "changes",
          number: "09",
          title: "Changes to these terms",
          paragraphs: [
            "We may update these terms as the service changes, laws develop, or our operations require. The updated version will be posted on this page and identified by its updated date. Where required by law, we will provide additional notice for material changes.",
            "Continuing to use Echo after an update takes effect means you accept the updated terms. If you do not accept them, stop using the service.",
          ],
        },
      ],
    },
  },
  privacy: {
    zh: {
      title: "隐私政策",
      summary: "我们希望你清楚知道 Echo 收集哪些信息、为什么需要，以及你可以如何管理它们。",
      lastUpdatedLabel: "最后更新",
      lastUpdated: "2026 年 8 月 12 日",
      contentsLabel: "本页内容",
      backHome: "返回首页",
      relatedPath: "/terms",
      relatedLabel: "查看服务条款",
      contactEyebrow: "YOUR DATA, YOUR CHOICE",
      contactTitle: "想了解更多？",
      contactBody: "如果你对隐私、数据访问或账号删除有疑问，请通过以下邮箱联系我们。",
      footerLabel: "法律文档导航",
      privacyLink: "隐私政策",
      termsLink: "服务条款",
      footerNote: "Relationships that remember and grow.",
      sections: [
        {
          id: "scope",
          number: "01",
          title: "适用范围",
          paragraphs: [
            "本隐私政策适用于 Echo 的网站、移动应用和相关服务。它说明我们如何收集、使用、保存、共享和保护与 Echo 用户有关的信息。",
            "不同功能可能有额外的提示或设置；当具体功能的说明与本政策存在差异时，以更具体的说明为准。",
          ],
        },
        {
          id: "collect",
          number: "02",
          title: "我们收集的信息",
          paragraphs: [
            "我们只在提供和改进服务所需的范围内处理信息。根据你使用的功能，信息可能包括：",
          ],
          bullets: [
            "账号信息：邮箱、第三方登录标识、显示名称、头像和账号设置。",
            "你主动提供的内容：聊天消息、角色设定、反馈、上传的图片或其他媒体，以及你选择保存的记忆。",
            "语音功能信息：为实现语音对话而处理的音频、转写文本或相关技术数据；实际处理内容取决于你使用的功能。",
            "设备与日志信息：设备型号、操作系统、应用版本、语言、时区、IP 地址、崩溃记录和服务访问日志。",
            "交易信息：订阅或点数购买的产品、平台、订单标识和验证结果。支付卡号等支付凭据由相应应用商店或支付服务商处理。",
          ],
        },
        {
          id: "use",
          number: "03",
          title: "我们如何使用信息",
          paragraphs: [
            "我们使用这些信息来提供你请求的功能，并维护 Echo 的安全、可靠和个性化体验，具体包括：",
          ],
          bullets: [
            "创建和管理账号，完成登录、身份验证和账号安全保护。",
            "提供聊天、语音、记忆、角色和个性化推荐等功能。",
            "处理订阅、点数、权益发放、订单核验和客户支持。",
            "诊断故障、分析使用情况、改进模型与产品，并防止滥用、欺诈和安全事件。",
            "发送与你的账号、交易、服务运行或安全有关的必要通知；营销信息会在适用法律要求的情况下提供管理方式。",
          ],
        },
        {
          id: "sharing",
          number: "04",
          title: "信息如何共享",
          paragraphs: [
            "我们不会出售你的个人信息。我们可能在以下情形共享必要的信息，并要求接收方按照适当的安全和保密义务处理：",
          ],
          bullets: [
            "与为 Echo 提供云基础设施、身份验证、消息发送、语音处理、内容存储、分析或客户支持的服务商共享。",
            "与 Apple App Store、Google Play 等平台共享完成购买验证和权益同步所需的信息。",
            "在法律要求、保护用户和公众安全、调查滥用或维护 Echo 权利时，向监管机构、执法机关或专业顾问提供必要信息。",
            "在合并、收购、融资或资产转让等公司交易中，按照法律要求采取适当保护措施后转移相关信息。",
          ],
        },
        {
          id: "retention",
          number: "05",
          title: "保存与删除",
          paragraphs: [
            "我们会在提供服务、履行法律义务、解决争议、执行协议和保护安全所需的期间保存信息。保存时间会根据数据类型、功能用途和法律要求而变化。",
            "你可以通过 Echo 提供的功能管理部分内容、删除单条对话或申请删除账号。删除后，信息可能需要一段合理时间从备份、日志或依法需要保留的记录中清除。",
            "如果你需要访问、更正、导出或删除个人信息，可以发送邮件至 support@yygo.tv。我们可能需要验证你的身份，以保护账号安全。",
          ],
        },
        {
          id: "security",
          number: "06",
          title: "安全措施",
          paragraphs: [
            "我们采用与信息风险相匹配的技术和组织措施保护信息，包括访问控制、传输保护、日志监控和必要的安全审查。但没有任何互联网传输或存储系统能够保证绝对安全。",
            "请妥善保管账号凭据，不要在不必要的情况下提交敏感个人信息。如果你发现疑似安全事件，请尽快联系我们。",
          ],
        },
        {
          id: "rights",
          number: "07",
          title: "你的选择与权利",
          paragraphs: [
            "在适用法律范围内，你可能有权访问、更正、删除或导出个人信息，限制或反对某些处理，并撤回此前作出的同意。某些请求可能受法律例外、服务必要性或身份验证要求限制。",
            "你也可以关闭通知、管理记忆和内容设置，或停止使用某项需要额外信息的功能。关闭功能可能会影响对应体验，但不会影响其他不依赖该信息的功能。",
          ],
        },
        {
          id: "children",
          number: "08",
          title: "未成年人",
          paragraphs: [
            "Echo 不面向未达到所在地区法定年龄的儿童提供独立注册使用。如果你认为未成年人未经适当授权向我们提供了个人信息，请通过 support@yygo.tv 联系我们，我们会根据适用法律处理。",
          ],
        },
        {
          id: "updates",
          number: "09",
          title: "政策更新",
          paragraphs: [
            "我们可能因功能、技术、法律或运营变化更新本政策。更新后的版本会发布在本页，并通过更新日期反映生效时间。对于重大变更，我们会在适用法律要求的范围内提供适当通知。",
            "如果你在更新生效后继续使用 Echo，即表示你了解更新后的政策。",
          ],
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      summary:
        "We want you to understand what Echo collects, why it is needed, and how you can manage it.",
      lastUpdatedLabel: "Last updated",
      lastUpdated: "August 12, 2026",
      contentsLabel: "On this page",
      backHome: "Back home",
      relatedPath: "/terms",
      relatedLabel: "Read the Terms of Service",
      contactEyebrow: "YOUR DATA, YOUR CHOICE",
      contactTitle: "Want to know more?",
      contactBody:
        "For questions about privacy, data access, or account deletion, contact us at the address below.",
      footerLabel: "Legal document navigation",
      privacyLink: "Privacy policy",
      termsLink: "Terms of Service",
      footerNote: "Relationships that remember and grow.",
      sections: [
        {
          id: "scope",
          number: "01",
          title: "Scope",
          paragraphs: [
            "This Privacy Policy applies to the Echo website, mobile applications, and related services. It explains how we collect, use, retain, share, and protect information connected with Echo users.",
            "Some features may include additional notices or controls. If a feature-specific notice differs from this policy, the more specific notice applies to that feature.",
          ],
        },
        {
          id: "collect",
          number: "02",
          title: "Information we collect",
          paragraphs: [
            "We process information only to the extent needed to provide and improve the service. Depending on the features you use, this may include:",
          ],
          bullets: [
            "Account information: email address, third-party sign-in identifiers, display name, avatar, and account settings.",
            "Content you provide: chat messages, character settings, feedback, uploaded images or other media, and memories you choose to save.",
            "Voice-feature information: audio, transcripts, or related technical data processed to provide voice conversations; the exact processing depends on the feature you use.",
            "Device and log information: device model, operating system, app version, language, time zone, IP address, crash reports, and service-access logs.",
            "Transaction information: purchased products, platform, order identifiers, and verification results for subscriptions or points. Payment credentials such as card numbers are handled by the relevant app store or payment provider.",
          ],
        },
        {
          id: "use",
          number: "03",
          title: "How we use information",
          paragraphs: [
            "We use this information to provide the features you request and to keep Echo secure, reliable, and personalized, including to:",
          ],
          bullets: [
            "Create and manage accounts, complete sign-in and verification, and protect account security.",
            "Provide chat, voice, memory, character, and personalized-recommendation features.",
            "Process subscriptions, points, entitlement delivery, order verification, and support requests.",
            "Diagnose issues, understand usage, improve models and products, and prevent abuse, fraud, and security incidents.",
            "Send necessary account, transaction, service, or security communications. Where required by law, marketing messages include a way to manage them.",
          ],
        },
        {
          id: "sharing",
          number: "04",
          title: "How information is shared",
          paragraphs: [
            "We do not sell your personal information. We may share necessary information in the following situations and require recipients to handle it with appropriate security and confidentiality obligations:",
          ],
          bullets: [
            "With providers that support Echo infrastructure, authentication, messaging, voice processing, content storage, analytics, or customer support.",
            "With Apple App Store, Google Play, and similar platforms as needed to verify purchases and synchronize entitlements.",
            "With regulators, law enforcement, or professional advisers when required by law, needed to protect people or public safety, investigate abuse, or defend Echo's rights.",
            "As part of a merger, acquisition, financing, or asset transfer, with appropriate safeguards and as required by law.",
          ],
        },
        {
          id: "retention",
          number: "05",
          title: "Retention and deletion",
          paragraphs: [
            "We retain information for as long as needed to provide the service, meet legal obligations, resolve disputes, enforce agreements, and protect security. Retention periods vary by data type, feature, purpose, and legal requirement.",
            "You can use available Echo controls to manage some content, delete individual conversation turns, or request account deletion. After deletion, it may take a reasonable period to remove information from backups, logs, or records we must keep by law.",
            "To request access, correction, export, or deletion of personal information, email support@yygo.tv. We may need to verify your identity to protect the account.",
          ],
        },
        {
          id: "security",
          number: "06",
          title: "Security",
          paragraphs: [
            "We use technical and organizational safeguards appropriate to the risks of the information, including access controls, protection in transit, logging and monitoring, and security reviews where appropriate. No internet transmission or storage system can be guaranteed completely secure.",
            "Keep your account credentials secure and avoid submitting sensitive personal information unless it is needed. Contact us promptly if you suspect a security incident.",
          ],
        },
        {
          id: "rights",
          number: "07",
          title: "Your choices and rights",
          paragraphs: [
            "Depending on applicable law, you may have rights to access, correct, delete, or export personal information; restrict or object to certain processing; and withdraw consent previously given. Some requests may be limited by legal exceptions, service necessities, or identity-verification requirements.",
            "You can also turn off notifications, manage memory and content settings, or stop using a feature that requires additional information. Disabling a feature may affect that experience but will not affect unrelated features.",
          ],
        },
        {
          id: "children",
          number: "08",
          title: "Children",
          paragraphs: [
            "Echo is not intended for independent registration or use by children below the legal age in their region. If you believe a child provided personal information without appropriate authorization, contact us at support@yygo.tv and we will respond as required by applicable law.",
          ],
        },
        {
          id: "updates",
          number: "09",
          title: "Policy updates",
          paragraphs: [
            "We may update this policy as features, technology, laws, or operations change. The updated version will be posted on this page and identified by its effective date. Where required by law, we will provide appropriate notice of material changes.",
            "Continuing to use Echo after an update takes effect means you acknowledge the updated policy.",
          ],
        },
      ],
    },
  },
}

const documentCopy = computed(() => documents[props.documentType][locale.value])

function toggleLocale() {
  locale.value = locale.value === "zh" ? "en" : "zh"
  document.documentElement.lang = locale.value === "zh" ? "zh-CN" : "en"
}

onMounted(() => {
  previousDocumentLanguage.value = document.documentElement.lang
  document.documentElement.lang = "zh-CN"
})

onBeforeUnmount(() => {
  document.documentElement.lang = previousDocumentLanguage.value
})
</script>

<style scoped>
.legal-page {
  --legal-ink: #020b0e;
  --legal-ink-soft: #07171a;
  --legal-bone: #eeeae5;
  --legal-muted: rgb(238 234 229 / 58%);
  --legal-faint: rgb(238 234 229 / 36%);
  --legal-line: rgb(169 217 209 / 17%);
  --legal-mint: #78c2b6;
  --legal-mint-soft: #b6e1da;
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 6%, rgb(74 153 142 / 15%), transparent 30rem), var(--legal-ink);
  color: var(--legal-bone);
  font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.legal-page :is(a, button):focus-visible {
  outline: 2px solid var(--legal-mint-soft);
  outline-offset: 4px;
}

.legal-page__glow {
  position: absolute;
  z-index: 0;
  width: 32rem;
  height: 32rem;
  pointer-events: none;
  border: 1px solid rgb(120 194 182 / 9%);
  border-radius: 50%;
}

.legal-page__glow::after {
  position: absolute;
  inset: 4.5rem;
  border: 1px solid rgb(120 194 182 / 7%);
  border-radius: inherit;
  content: "";
}

.legal-page__glow--top {
  top: 11rem;
  right: -19rem;
}

.legal-page__glow--bottom {
  bottom: 7rem;
  left: -24rem;
  opacity: 0.7;
}

.legal-header,
.legal-layout,
.legal-footer {
  position: relative;
  z-index: 1;
}

.legal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 84px;
  padding: 0 clamp(1.25rem, 5vw, 5.5rem);
  border-bottom: 1px solid var(--legal-line);
}

.legal-brand {
  display: block;
  width: clamp(6rem, 9vw, 8rem);
}

.legal-brand img {
  display: block;
  width: 100%;
  filter: brightness(0) invert(1);
}

.legal-header__actions {
  display: flex;
  align-items: center;
  gap: 1.4rem;
}

.legal-back,
.legal-language,
.legal-related,
.legal-footer a {
  color: var(--legal-muted);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-decoration: none;
  transition: color 180ms ease;
}

.legal-back:hover,
.legal-related:hover,
.legal-footer a:hover {
  color: var(--legal-mint-soft);
}

.legal-back span {
  display: inline-block;
  margin-right: 0.4rem;
  color: var(--legal-mint);
  font-size: 1rem;
  transition: transform 180ms ease;
}

.legal-back:hover span {
  transform: translateX(-3px);
}

.legal-language {
  min-width: 2.4rem;
  padding: 0.4rem 0.2rem;
  border: 1px solid var(--legal-line);
  border-radius: 999px;
  background: transparent;
  color: var(--legal-mint-soft);
  cursor: pointer;
  font-size: 0.65rem;
}

.legal-language:hover {
  border-color: rgb(169 217 209 / 40%);
  background: rgb(120 194 182 / 9%);
}

.legal-layout {
  width: min(1200px, calc(100% - 2.5rem));
  margin: 0 auto;
}

.legal-hero {
  max-width: 790px;
  padding: clamp(5rem, 12vw, 10.5rem) 0 clamp(4rem, 8vw, 7rem);
}

.legal-eyebrow {
  margin: 0 0 1.6rem;
  color: var(--legal-mint);
  font-size: 0.66rem;
  letter-spacing: 0.22em;
  line-height: 1.4;
}

.legal-hero h1 {
  margin: 0;
  font-size: clamp(3.2rem, 8vw, 7.5rem);
  font-weight: 400;
  letter-spacing: -0.06em;
  line-height: 0.98;
}

.legal-hero__summary {
  max-width: 31rem;
  margin: 2.2rem 0 0;
  color: var(--legal-muted);
  font-size: clamp(1rem, 1.6vw, 1.2rem);
  line-height: 1.8;
}

.legal-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 2.8rem;
  color: var(--legal-faint);
  font-size: 0.67rem;
  letter-spacing: 0.08em;
}

.legal-meta::before {
  width: 2.8rem;
  height: 1px;
  background: var(--legal-mint);
  content: "";
}

.legal-meta strong {
  color: var(--legal-muted);
  font-weight: 400;
}

.legal-content {
  display: grid;
  grid-template-columns: 220px minmax(0, 720px);
  justify-content: space-between;
  gap: clamp(3rem, 9vw, 9rem);
  padding-bottom: clamp(5rem, 10vw, 9rem);
}

.legal-aside {
  position: sticky;
  top: 2rem;
  align-self: start;
  padding-top: 0.3rem;
}

.legal-aside > p {
  margin: 0 0 1.25rem;
  color: var(--legal-faint);
  font-size: 0.63rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.legal-aside nav {
  display: grid;
  gap: 0.75rem;
}

.legal-aside nav a {
  color: var(--legal-muted);
  font-size: 0.76rem;
  line-height: 1.45;
  text-decoration: none;
  transition:
    color 180ms ease,
    transform 180ms ease;
}

.legal-aside nav a:hover {
  color: var(--legal-mint-soft);
  transform: translateX(3px);
}

.legal-related {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2.2rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--legal-line);
  color: var(--legal-mint);
  font-size: 0.68rem;
}

.legal-article {
  min-width: 0;
}

.legal-section {
  display: grid;
  grid-template-columns: 2.3rem minmax(0, 1fr);
  gap: 1rem;
  padding: 0 0 3.8rem;
}

.legal-section + .legal-section {
  padding-top: 3.8rem;
  border-top: 1px solid var(--legal-line);
}

.legal-section__index {
  padding-top: 0.35rem;
  color: var(--legal-mint);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.legal-section h2,
.legal-contact h2 {
  margin: 0 0 1.25rem;
  color: var(--legal-bone);
  font-size: clamp(1.45rem, 2.5vw, 2rem);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.legal-section p,
.legal-section li,
.legal-contact p {
  margin: 0;
  color: var(--legal-muted);
  font-size: 0.94rem;
  line-height: 1.95;
}

.legal-section p + p {
  margin-top: 1rem;
}

.legal-section ul {
  display: grid;
  gap: 0.75rem;
  margin: 1.25rem 0 0;
  padding: 0;
  list-style: none;
}

.legal-section li {
  position: relative;
  padding-left: 1.2rem;
}

.legal-section li::before {
  position: absolute;
  top: 0.75em;
  left: 0;
  width: 0.35rem;
  height: 0.35rem;
  border: 1px solid var(--legal-mint);
  border-radius: 50%;
  content: "";
}

.legal-contact {
  margin-top: 1rem;
  padding: 2.3rem clamp(1.4rem, 4vw, 2.6rem);
  border: 1px solid var(--legal-line);
  background: linear-gradient(135deg, rgb(120 194 182 / 8%), rgb(7 23 26 / 50%));
}

.legal-contact .legal-eyebrow {
  margin-bottom: 1.15rem;
}

.legal-contact h2 {
  margin-bottom: 0.8rem;
}

.legal-contact a {
  display: inline-block;
  margin-top: 1.4rem;
  color: var(--legal-mint-soft);
  font-size: 0.88rem;
  text-decoration: none;
}

.legal-contact a:hover {
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

.legal-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
  min-height: 84px;
  padding: 1.4rem clamp(1.25rem, 5vw, 5.5rem);
  border-top: 1px solid var(--legal-line);
  color: var(--legal-faint);
  font-size: 0.65rem;
  letter-spacing: 0.04em;
}

.legal-footer nav {
  display: flex;
  gap: 2rem;
}

.legal-footer > :last-child {
  justify-self: end;
}

@media (max-width: 800px) {
  .legal-content {
    display: block;
  }

  .legal-aside {
    position: static;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: 1rem 0;
    border-top: 1px solid var(--legal-line);
    border-bottom: 1px solid var(--legal-line);
  }

  .legal-aside > p {
    flex: 0 0 auto;
    margin: 0;
  }

  .legal-aside nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem 1rem;
  }

  .legal-related {
    flex: 0 0 auto;
    margin: 0 0 0 auto;
    padding: 0;
    border: 0;
  }

  .legal-related span:first-child {
    display: none;
  }
}

@media (max-width: 560px) {
  .legal-header {
    min-height: 72px;
  }

  .legal-header__actions {
    gap: 0.8rem;
  }

  .legal-back {
    font-size: 0;
  }

  .legal-back span {
    margin: 0;
    font-size: 1rem;
  }

  .legal-layout {
    width: min(100% - 2rem, 1200px);
  }

  .legal-hero {
    padding-top: 4.6rem;
    padding-bottom: 3.5rem;
  }

  .legal-hero h1 {
    font-size: clamp(3.1rem, 16vw, 5rem);
  }

  .legal-hero__summary {
    margin-top: 1.6rem;
    font-size: 0.95rem;
  }

  .legal-meta {
    margin-top: 2rem;
  }

  .legal-aside {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
  }

  .legal-aside nav {
    order: 3;
    width: 100%;
  }

  .legal-related {
    margin-left: auto;
  }

  .legal-section {
    grid-template-columns: 1.8rem minmax(0, 1fr);
    gap: 0.7rem;
    padding-bottom: 3rem;
  }

  .legal-section:first-child {
    padding-top: 3rem;
  }

  .legal-section + .legal-section {
    padding-top: 3rem;
  }

  .legal-section p,
  .legal-section li,
  .legal-contact p {
    font-size: 0.88rem;
    line-height: 1.85;
  }

  .legal-footer {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding-block: 2rem;
  }

  .legal-footer > :last-child {
    justify-self: start;
  }
}
</style>
