<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/shared/auth'
import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/20/solid'
import { CommonButton, CommonCard, CommonTag, secondaryColoredButton } from '@/shared/ui'

/**
 * Where a signed-in operator lands when their token opens no page of the panel — the granting
 * rules gave them `openid` and nothing this console reads.
 *
 * It is drawn outside the panel shell because there is nothing for the shell to draw: every entry
 * of the navigation would be hidden, and signing out is the only thing left to do.
 */
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

// The scopes that open a page on their own, read off the routes rather than listed here, so a page
// joining the panel names what it needs once and this screen tells an operator to ask for it.
//
// A route needing a set of them is not one to ask for half of: the consents tab is read under
// `admin:consent:read` beside the `admin:users:read` its record opens on, so granting that scope
// alone opens nothing and it is not offered as something to ask for.
const consoleScopes = [
  ...new Set(
    router
      .getRoutes()
      .map((route) => route.meta.requiredScopes ?? [])
      .filter((scopes) => scopes.length === 1)
      .map(([scope]) => scope)
  )
].sort()

async function logout() {
  await authStore.signout()
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md">
      <h1 class="mb-2 text-center text-2xl font-bold text-gray-900">
        {{ t('pages.noAccess.title') }}
      </h1>
      <p class="mb-6 text-center text-sm text-gray-600">
        {{ t('pages.noAccess.description', { account: authStore.userName }) }}
      </p>

      <CommonCard>
        <p class="text-sm text-gray-700">{{ t('pages.noAccess.scopes') }}</p>
        <div class="mt-3 flex flex-wrap gap-1">
          <CommonTag v-for="scope in consoleScopes" :key="scope" color="blue">
            {{ scope }}
          </CommonTag>
        </div>
        <CommonButton
          class="mt-4 w-full"
          :button-style="secondaryColoredButton"
          :icon="ArrowRightStartOnRectangleIcon"
          :label="t('auth.logout')"
          @click="logout"
        />
      </CommonCard>
    </div>
  </div>
</template>
