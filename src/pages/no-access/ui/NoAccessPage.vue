<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/shared/auth'
import { ArrowRightStartOnRectangleIcon, Cog6ToothIcon } from '@heroicons/vue/20/solid'
import { SaTag } from '@sympauthy/design'
import { usePreferencesStore } from '@/entities/preference'
import { CommonButton, StandalonePage } from '@/shared/ui'

/**
 * Where a signed-in operator lands when their token opens no page of the panel — the granting
 * rules gave them `openid` and nothing this console reads.
 *
 * It is drawn outside the panel shell because there is nothing for the shell to draw: every entry
 * of the navigation would be disabled, and signing out is the only thing left to do.
 */
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const preferencesStore = usePreferencesStore()

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

// The preferences are read and written under no admin scope, so they are the one page of the panel
// this operator opens. It is drawn in the shell, whose sidebar leads back here.
function openPreferences() {
  router.push({ name: 'preferences' })
}

async function logout() {
  await authStore.signout()
}
</script>

<template>
  <StandalonePage :dark="preferencesStore.dark">
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-extrabold tracking-tight text-gray-900">
        {{ t('pages.noAccess.title') }}
      </h1>
      <p class="text-gray-700">
        {{ t('pages.noAccess.description', { account: authStore.userName }) }}
      </p>
    </div>

    <div class="flex flex-col gap-3">
      <p class="text-gray-700">{{ t('pages.noAccess.scopes') }}</p>
      <div class="flex flex-wrap gap-1">
        <SaTag v-for="scope in consoleScopes" :key="scope" color="blue">
          {{ scope }}
        </SaTag>
      </div>
    </div>

    <div class="flex flex-col gap-3 border-t border-gray-200 pt-6">
      <CommonButton
        variant="secondary"
        size="large"
        :icon="Cog6ToothIcon"
        :label="t('nav.preferences')"
        @click="openPreferences"
      />
      <CommonButton
        variant="secondary"
        size="large"
        :icon="ArrowRightStartOnRectangleIcon"
        :label="t('auth.logout')"
        @click="logout"
      />
    </div>
  </StandalonePage>
</template>
