import { computed, ref, watch, type Ref } from 'vue'
import { ClientApi, clientReturnUris, type ClientDetailResource } from '@/entities/client'
import { getErrorMessage, isSuccess } from '@/shared/api'

/**
 * The pages a flow started for the client `clientId` names may return the person to, read from its
 * record whenever the choice changes: the list of every client carries none of them.
 *
 * `defaultReturnUri` is the one the server returns to when the request names none, so a dialog
 * offering it sends nothing for it, and a change to the configuration reaches the next start.
 */
export function useClientReturnUris(clientId: Ref<string>) {
  const api = new ClientApi()

  const client = ref<ClientDetailResource | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const returnUris = computed(() => (client.value ? clientReturnUris(client.value) : []))
  const defaultReturnUri = computed(() => client.value?.return_uri ?? null)

  watch(clientId, async (id) => {
    client.value = null
    error.value = null
    if (!id) {
      loading.value = false
      return
    }

    loading.value = true
    const response = await api.getClient(id)
    // A second client chosen while the first was read answers for itself.
    if (id !== clientId.value) {
      return
    }
    if (isSuccess(response)) {
      client.value = response.content
    } else {
      error.value = getErrorMessage(response)
    }
    loading.value = false
  })

  return {
    returnUris,
    defaultReturnUri,
    loading,
    error
  }
}
