<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useUserDetailStore } from '@/stores/useUserDetailStore'
import HelpTooltip from '@/components/HelpTooltip.vue'
import PaginatedTable from '@/components/PaginatedTable.vue'
import CommonButton from '@/components/CommonButton.vue'
import Tag from '@/components/Tag.vue'
import { dangerColoredButton } from '@/styles/ButtonStyle'

const props = defineProps<{
  userId: string
}>()

const { t } = useI18n()
const store = useUserDetailStore()
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-4">
      {{ t('pages.userDetail.consents') }}
      <HelpTooltip>
        <i18n-t keypath="pages.userDetail.consentsHelp" tag="p">
          <template #link>
            <a
              :href="t('pages.userDetail.consentsHelpLinkUrl')"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              {{ t('pages.userDetail.consentsHelpLinkText') }}
            </a>
          </template>
        </i18n-t>
      </HelpTooltip>
    </h2>
    <PaginatedTable
      :loading="store.consentsLoading"
      :error="store.consentsError"
      :empty="store.consents.length === 0"
      :page="store.consentsPage"
      :total-pages="store.consentsTotalPages"
      @page-change="(page: number) => store.fetchConsents(userId, page)"
    >
      <template #header>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.userDetail.client') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.userDetail.scopes') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
          {{ t('pages.userDetail.actions') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="consent in store.consents" :key="consent.client_id">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ consent.client_id }}
          </td>
          <td class="px-6 py-4 text-sm">
            <div class="flex flex-wrap gap-1">
              <Tag v-for="scope in consent.scopes ?? []" :key="scope" color="blue">
                {{ scope }}
              </Tag>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <CommonButton
              :button-style="dangerColoredButton"
              @click="store.revokeConsent(userId, consent.client_id)"
            >
              {{ t('pages.userDetail.revoke') }}
            </CommonButton>
          </td>
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.userDetail.noConsents') }}</p>
      </template>
    </PaginatedTable>
  </div>
</template>
