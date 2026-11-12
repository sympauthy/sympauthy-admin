<script lang="ts" setup>
import { computed, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SaAlert,
  SaCard,
  SaField,
  SaListbox,
  type SaListboxOption,
  SaRadioGroup,
  SaSelect
} from '@sympauthy/design'
import { CommonButton } from '@/shared/ui'
import { availableLanguages } from '@/shared/i18n'
import { browserTimeZone, type DateFormat, timeZones } from '@/shared/lib'
import { type Preferences, type Theme, usePreferencesStore } from '@/entities/preference'

const { t } = useI18n()
const store = usePreferencesStore()
const languageFieldId = useId()

// What a select and a listbox hold for the browser's choice. Neither a language tag nor a zone is
// spelled this way, and an empty value would read as no choice at all.
const BROWSER = 'browser'

const theme = ref<Theme>('system')
const language = ref(BROWSER)
const dateFormat = ref<DateFormat>('iso')
const timeZone = ref(BROWSER)
const submitting = ref(false)
const saved = ref(false)

// The form starts from what is applied, and starts again when the account's copy replaces the
// browser's under it: a choice is only ever made against what the panel draws.
watch(
  () => store.preferences,
  (preferences) => {
    theme.value = preferences.theme
    language.value = preferences.language ?? BROWSER
    dateFormat.value = preferences.dateFormat
    timeZone.value = preferences.timeZone ?? BROWSER
  },
  { immediate: true }
)

// What was saved is no longer what the form holds once a choice changes.
watch([theme, language, dateFormat, timeZone], () => {
  saved.value = false
})

// Each option says why it cannot be chosen where the deployment draws light only, as the kit draws
// a disabled option: the group itself has no disabled state of its own.
const themeOptions = computed<{ value: Theme; label: string; disabledReason?: string }[]>(() => {
  const disabledReason = store.darkModeAvailable
    ? undefined
    : t('pages.preferences.theme.unavailable')
  return (['system', 'light', 'dark'] as const).map((value) => ({
    value,
    label: t(`pages.preferences.theme.values.${value}`),
    disabledReason
  }))
})

// Each language is named in itself, since an operator who cannot read the panel's current one has
// to find their own among them.
function languageName(language: string): string {
  const name = new Intl.DisplayNames([language], { type: 'language' }).of(language) ?? language
  return name.charAt(0).toLocaleUpperCase(language) + name.slice(1)
}

const languageOptions = computed(() =>
  availableLanguages().map((tag) => ({ value: tag, label: languageName(tag) }))
)

const dateFormatOptions = computed<{ value: DateFormat; label: string }[]>(() => [
  { value: 'iso', label: t('pages.preferences.dateFormat.values.iso') },
  { value: 'language', label: t('pages.preferences.dateFormat.values.language') }
])

const timeZoneOptions = computed<SaListboxOption[]>(() => [
  {
    value: BROWSER,
    label: t('pages.preferences.timeZone.browser', { zone: browserTimeZone() })
  },
  { value: 'UTC', label: 'UTC' },
  ...timeZones()
    .filter((zone) => zone !== 'UTC')
    .map((zone) => ({ value: zone, label: zone }))
])

function onTimeZoneSelect(values: string[]) {
  // A click on the chosen zone would clear it, and a zone is never left unchosen.
  if (values[0] !== undefined) {
    timeZone.value = values[0]
  }
}

async function onSave() {
  const next: Preferences = {
    theme: theme.value,
    language: language.value === BROWSER ? undefined : language.value,
    dateFormat: dateFormat.value,
    timeZone: timeZone.value === BROWSER ? undefined : timeZone.value
  }
  submitting.value = true
  saved.value = false
  try {
    saved.value = (await store.save(next)) === undefined
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-card-large space-y-4">
    <!-- From the startup that met it as from the Save, so the operator knows before choosing. -->
    <SaAlert v-if="store.notKeptReason" color="warning">
      {{ t(`pages.preferences.notKept.${store.notKeptReason}`) }}
    </SaAlert>

    <SaCard>
      <div class="space-y-6">
        <SaField :label="t('pages.preferences.theme.label')">
          <!-- Pulled into the padding of its rows, which are as tall as a target around a line of
               text, so its first option sits under the label as a select's box does and the next
               field is as far below its last. A row carrying a reason fills its height already. -->
          <SaRadioGroup
            v-model="theme"
            :class="{ '-my-3': store.darkModeAvailable }"
            :options="themeOptions"
            :aria-label="t('pages.preferences.theme.label')"
          />
        </SaField>

        <SaField :label="t('pages.preferences.language.label')" :for="languageFieldId">
          <SaSelect :id="languageFieldId" v-model="language">
            <option :value="BROWSER">{{ t('pages.preferences.language.browser') }}</option>
            <option v-for="option in languageOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </SaSelect>
        </SaField>

        <SaField :label="t('pages.preferences.dateFormat.label')">
          <SaRadioGroup
            v-model="dateFormat"
            class="-my-3"
            :options="dateFormatOptions"
            :aria-label="t('pages.preferences.dateFormat.label')"
          />
        </SaField>

        <SaField
          :label="t('pages.preferences.timeZone.label')"
          :hint="t('pages.preferences.timeZone.hint')"
        >
          <SaListbox
            :options="timeZoneOptions"
            :selected="[timeZone]"
            :search-placeholder="t('pages.preferences.timeZone.search')"
            :no-match-label="t('pages.preferences.timeZone.noMatch')"
            :aria-label="t('pages.preferences.timeZone.label')"
            @select="onTimeZoneSelect"
          />
        </SaField>

        <div class="flex flex-wrap items-center gap-3">
          <CommonButton
            variant="primary"
            :label="t('common.save')"
            :submitting="submitting"
            @click="onSave"
          />
          <p v-if="saved" role="status" class="text-sm text-gray-600">
            {{ t('pages.preferences.saved') }}
          </p>
        </div>
      </div>
    </SaCard>
  </div>
</template>
