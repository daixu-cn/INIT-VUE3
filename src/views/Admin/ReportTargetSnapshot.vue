<template>
  <section v-if="snapshot" class="target-snapshot">
    <div class="snapshot-heading">
      <div>
        <span>{{ isAuthorMessage ? "作者留言审核快照" : "真人社区审核快照" }}</span>
        <h3>{{ snapshot.characterName || (isAuthorMessage ? "作者留言" : "角色社区") }}</h3>
      </div>
      <span class="availability-chip" :data-status="snapshot.status">
        {{ snapshot.status }}
      </span>
    </div>
    <dl>
      <div v-if="!isAuthorMessage">
        <dt>角色</dt>
        <dd>{{ snapshot.characterName || "—" }}</dd>
      </div>
      <div>
        <dt>{{ isAuthorMessage ? "留言主页" : "社区" }}</dt>
        <dd>
          {{ snapshot.targetAuthorUserId || snapshot.characterCommunityId || report.targetId }}
        </dd>
      </div>
      <div v-if="snapshot.authorDisplayName">
        <dt>内容作者</dt>
        <dd>{{ snapshot.authorDisplayName }}</dd>
      </div>
      <div v-if="snapshot.postId">
        <dt>所在帖子</dt>
        <dd>{{ snapshot.postId }}</dd>
      </div>
    </dl>
    <div v-if="snapshot.title" class="snapshot-content">
      <h4>帖子标题</h4>
      <p>{{ snapshot.title }}</p>
    </div>
    <div v-if="snapshot.text" class="snapshot-content">
      <h4>内容正文</h4>
      <p>{{ snapshot.text }}</p>
    </div>
    <div v-if="snapshot.tags?.length" class="snapshot-content">
      <h4>帖子标签</h4>
      <p>{{ snapshot.tags.map(tag => `#${tag}`).join(" ") }}</p>
    </div>
    <div v-if="mediaLoading" role="status">正在加载附件…</div>
    <div v-if="mediaError" role="alert">
      附件加载失败。<button type="button" @click="reloadMedia">重新加载</button>
    </div>
    <div v-for="asset in media" :key="asset.mediaAssetId" class="snapshot-media">
      <a v-if="asset.kind === 'IMAGE'" :href="asset.url" target="_blank" rel="noopener noreferrer">
        <img
          :src="asset.url"
          alt="被举报内容的图片附件"
          loading="lazy"
          @error="mediaError = true"
        />
      </a>
      <template v-else>
        <audio
          :src="asset.url"
          controls
          preload="none"
          aria-label="被举报内容的语音附件"
          @error="mediaError = true"
        />
        <p v-if="asset.transcript">{{ asset.transcript }}</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"

import { getReportMedia } from "@/server/api/reports"

const props = defineProps<{ report: Model.Report.Item }>()
const snapshot = computed(() => props.report.targetSnapshot)
const isAuthorMessage = computed(() => props.report.targetType === "AUTHOR_MESSAGE")
const media = ref<Model.Report.Media[]>([])
const mediaLoading = ref(false)
const mediaError = ref(false)
const revision = ref(0)

function reloadMedia() {
  revision.value += 1
}

watch(
  () => [props.report.reportId, revision.value] as const,
  async (_, __, onCleanup) => {
    let current = true
    onCleanup(() => {
      current = false
    })
    media.value = []
    mediaError.value = false
    if (
      !["COMMUNITY_POST", "COMMUNITY_POST_COMMENT", "AUTHOR_MESSAGE"].includes(
        props.report.targetType,
      )
    )
      return
    mediaLoading.value = true
    try {
      const result = await getReportMedia(props.report.reportId)
      if (current) media.value = result.data
    } catch {
      if (current) mediaError.value = true
    } finally {
      if (current) mediaLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.target-snapshot {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid var(--color-admin-border);
  background: var(--color-admin-subtle);
}

.snapshot-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.snapshot-heading span {
  color: var(--color-admin-muted);
  font-size: 0.7rem;
}

.snapshot-heading h3 {
  margin: 0.3rem 0 0;
  font-size: 1.15rem;
}

.target-snapshot dl {
  margin: 1rem 0;
  background: var(--color-admin-surface);
}

.snapshot-content h4 {
  margin: 1rem 0 0.3rem;
  color: var(--color-admin-text-secondary);
  font-size: 0.72rem;
}

.snapshot-content p {
  margin: 0;
  color: var(--color-admin-text-secondary);
  line-height: 1.65;
}

.snapshot-content details {
  margin-top: 1rem;
}

.snapshot-content pre {
  max-height: 300px;
  padding: 0.8rem;
  overflow: auto;
  background: var(--color-admin-text);
  color: var(--color-admin-surface);
  font-size: 0.7rem;
  white-space: pre-wrap;
}

.availability-chip {
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  background: var(--color-admin-success-subtle);
  color: var(--color-admin-success) !important;
  white-space: nowrap;
}

.availability-chip[data-status="TAKEN_DOWN"] {
  background: var(--color-admin-danger-subtle);
  color: var(--color-admin-danger) !important;
}

.snapshot-media {
  margin-top: 12px;
}
.snapshot-media img {
  display: block;
  max-width: 100%;
  max-height: 320px;
  object-fit: contain;
}
.snapshot-media audio {
  width: 100%;
}
.snapshot-media p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
}
dt {
  color: var(--color-admin-muted);
  font-size: 12px;
}
dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
}
</style>
