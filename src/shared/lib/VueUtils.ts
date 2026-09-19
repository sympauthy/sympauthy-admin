import { inject, type InjectionKey } from 'vue'

export function injectRequired<T>(key: InjectionKey<T> | string): T {
  const injected = inject(key)
  if (injected === undefined) {
    throw new Error('Failed to inject required dependencies.')
  }
  return injected
}
