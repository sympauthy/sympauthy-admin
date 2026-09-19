<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/auth'
import { useI18n } from 'vue-i18n'
import { CommonSpinner, CommonAlert } from '@/shared/ui'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const targetUrl = await authStore.signinRedirectCallback()
    await router.replace(targetUrl)
  } catch (e) {
    console.error('OIDC callback failed.', e)
    error.value = t('auth.callbackError')
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <CommonAlert v-if="error" color="danger">
      {{ error }}
    </CommonAlert>
    <div v-else class="flex flex-col items-center gap-4">
      <CommonSpinner size="lg" />
      <p class="text-sm text-gray-600">{{ t('auth.signingIn') }}</p>
    </div>
  </div>
</template>
