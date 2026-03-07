<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useI18n } from 'vue-i18n'
import CommonSpinner from '@/components/CommonSpinner.vue'
import CommonAlert from '@/components/CommonAlert.vue'

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
      <CommonSpinner class="h-8 w-8 border-4" />
      <p class="text-gray-600">{{ t('auth.signingIn') }}</p>
    </div>
  </div>
</template>
