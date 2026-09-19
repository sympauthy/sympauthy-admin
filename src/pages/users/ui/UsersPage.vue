<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/entities/user'
import { useClaimStore } from '@/entities/claim'
import {
  CollectionPage,
  CollectionSortHeader,
  CommonAlert,
  CommonButton,
  EmptyValue,
  TableCell,
  TableHeader,
  Tag,
  dangerColoredButton,
  primaryColoredButton
} from '@/shared/ui'
import { LogoutDialog } from '@/features/logout-user'
import { EyeIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/vue/20/solid'
import { formatDate } from '@/shared/lib'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
// The claims an account is identified by are this table's columns and what `claims=` asks the
// server to embed in each row. They are read rather than taken from the capability document: that
// document says which claims the collection can be *filtered* on, which is every configured one,
// and a column is a different question.
const claimStore = useClaimStore()

const logoutUserId = ref<string | null>(null)

onMounted(async () => {
  await claimStore.fetchIdentifierClaims()
  userStore.setSelectedClaimIds(claimStore.identifierClaims.map((c) => c.id))
  await userStore.users.fetch()
})
</script>

<template>
  <CollectionPage :collection="userStore.users" :search-placeholder="t('pages.users.search')">
    <template v-if="claimStore.identifierClaimsError" #notice>
      <CommonAlert color="warning">
        {{ t('pages.users.identifierClaimsFailed') }}
      </CommonAlert>
    </template>

    <template #header>
      <CollectionSortHeader
        fit
        :collection="userStore.users"
        :label="t('pages.users.status')"
        field="status"
      />
      <CollectionSortHeader
        v-for="claim in claimStore.identifierClaims"
        :key="claim.id"
        :collection="userStore.users"
        :label="claim.id"
        :field="claim.id"
      />
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="userStore.users"
        :label="t('pages.users.createdAt')"
        field="created_at"
      />
      <TableHeader fit>{{ t('pages.users.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="user in userStore.users.items" :key="user.user_id">
        <TableCell :label="t('pages.users.status')" fit>
          <Tag v-if="user.status === 'enabled'" color="green">
            {{ t('pages.users.enabled') }}
          </Tag>
          <Tag v-else color="red">
            {{ t('pages.users.disabled') }}
          </Tag>
        </TableCell>
        <!-- The first identifier is what names the account, so it titles the card rather than
             being another labelled line of it. -->
        <TableCell
          v-for="(claim, index) in claimStore.identifierClaims"
          :key="claim.id"
          truncate
          :primary="index === 0"
          :label="index === 0 ? undefined : claim.id"
        >
          <span v-if="user.claims?.[claim.id]">{{ user.claims[claim.id] }}</span>
          <EmptyValue v-else />
        </TableCell>
        <TableCell :label="t('pages.users.createdAt')" fit hidden-below="sm">
          {{ formatDate(user.created_at) }}
        </TableCell>
        <TableCell fit>
          <div class="flex gap-2">
            <CommonButton
              :button-style="primaryColoredButton"
              :label="t('pages.users.view')"
              :icon="EyeIcon"
              @click="router.push({ name: 'userDetail', params: { userId: user.user_id } })"
            />
            <CommonButton
              :button-style="dangerColoredButton"
              :label="t('pages.users.logout')"
              :icon="ArrowRightStartOnRectangleIcon"
              @click="logoutUserId = user.user_id"
            />
          </div>
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.users.empty') }}</p>
    </template>
  </CollectionPage>

  <LogoutDialog
    :user-id="logoutUserId"
    :open="logoutUserId !== null"
    @close="logoutUserId = null"
  />
</template>
