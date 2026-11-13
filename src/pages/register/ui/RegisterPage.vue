<script lang="ts" setup>
import { ref, onMounted, useId } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/shared/auth'
import { usePreferencesStore } from '@/entities/preference'
import { SaBrandLogo, SaCard, SaField, SaInput } from '@sympauthy/design'
import { BrandWordmark, CommonButton, DocLink } from '@/shared/ui'

/**
 * Where an invitation is claimed. It is drawn as the flow's auth card, since it opens the sign-up
 * the flow goes on with: the deployment's brand over the card, and the product under it.
 */
const route = useRoute()
const authStore = useAuthStore()
const preferencesStore = usePreferencesStore()
const { t } = useI18n()
const tokenFieldId = useId()

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
  <div class="flex min-h-screen flex-col items-center gap-6 px-4 pt-8 pb-6">
    <!-- Named as the sidebar's head names the panel: the wordmark, then what this is of it. -->
    <header class="flex items-baseline gap-3 sm:mt-16">
      <SaBrandLogo :dark="preferencesStore.dark" size="lg" class="self-center" />
      <p class="text-3xl tracking-tight text-gray-900"><BrandWordmark /></p>
      <span class="text-sm font-medium tracking-wider text-gray-500 uppercase">
        {{ t('nav.panel') }}
      </span>
    </header>

    <!-- The flow's auth card, and so its width rather than a form page's `card-large`. -->
    <SaCard class="w-full max-w-card text-base">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-extrabold tracking-tight text-gray-900">
            {{ t('register.title') }}
          </h1>
          <p class="text-gray-700">{{ t('register.description') }}</p>
        </div>

        <form class="flex flex-col gap-5" @submit.prevent="onSubmit">
          <SaField :for="tokenFieldId" :label="t('register.tokenLabel')">
            <SaInput
              :id="tokenFieldId"
              v-model="token"
              mono
              autocomplete="one-time-code"
              spellcheck="false"
              :placeholder="t('register.tokenPlaceholder')"
            />
          </SaField>
          <CommonButton
            type="submit"
            size="large"
            :label="t('register.submit')"
            :submitting="loading"
            :disabled="!token.trim()"
          />
        </form>

        <!-- The panel's root is where the guard sends a signed-out operator to sign in. -->
        <i18n-t
          keypath="register.haveAccount"
          tag="p"
          scope="global"
          class="border-t border-gray-200 pt-4 text-center text-sm text-gray-700"
        >
          <template #signIn>
            <RouterLink to="/" class="sa-link font-semibold">{{ t('register.signIn') }}</RouterLink>
          </template>
        </i18n-t>
      </div>
    </SaCard>

    <i18n-t
      keypath="register.poweredBy"
      tag="p"
      scope="global"
      class="mt-auto text-sm text-gray-500"
    >
      <template #link>
        <DocLink href="https://sympauthy.github.io/">SympAuthy</DocLink>
      </template>
    </i18n-t>
  </div>
</template>
