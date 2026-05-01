<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore'
import CommonButton from '@/components/CommonButton.vue'
import { primaryColoredButton } from '@/styles/ButtonStyle'

const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const token = ref('')
const loading = ref(false)

onMounted(() => {
  const queryToken = route.query.invitation_token
  if (typeof queryToken === 'string' && queryToken) {
    token.value = queryToken
  }
})

async function onSubmit() {
  if (!token.value.trim()) return

  loading.value = true
  await authStore.signinRedirect('/', {
    invitation_token: token.value.trim()
  })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-bold text-gray-900 text-center mb-2">
        {{ t('register.title') }}
      </h1>
      <p class="text-sm text-gray-600 text-center mb-6">
        {{ t('register.description') }}
      </p>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('register.tokenLabel') }}
        </label>
        <input
          v-model="token"
          type="text"
          :placeholder="t('register.tokenPlaceholder')"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary) mb-4"
          @keydown.enter="onSubmit"
        />
        <CommonButton
          :button-style="primaryColoredButton"
          :submitting="loading"
          :disabled="!token.trim()"
          class="w-full"
          @click="onSubmit"
        >
          <template #submitting>
            {{ t('register.submit') }}
          </template>
          {{ t('register.submit') }}
        </CommonButton>
      </div>
    </div>
  </div>
</template>
