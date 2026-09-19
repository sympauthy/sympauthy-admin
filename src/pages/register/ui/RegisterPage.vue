<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/shared/auth'
import { CommonButton, CommonCard, FormField, FormInput, primaryColoredButton } from '@/shared/ui'

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
      <h1 class="mb-2 text-center text-2xl font-bold text-gray-900">
        {{ t('register.title') }}
      </h1>
      <p class="mb-6 text-center text-sm text-gray-600">
        {{ t('register.description') }}
      </p>

      <CommonCard>
        <FormField :label="t('register.tokenLabel')">
          <FormInput
            v-model="token"
            mono
            :placeholder="t('register.tokenPlaceholder')"
            @keydown.enter="onSubmit"
          />
        </FormField>
        <CommonButton
          class="mt-4 w-full"
          :button-style="primaryColoredButton"
          :label="t('register.submit')"
          :submitting="loading"
          :disabled="!token.trim()"
          @click="onSubmit"
        />
      </CommonCard>
    </div>
  </div>
</template>
