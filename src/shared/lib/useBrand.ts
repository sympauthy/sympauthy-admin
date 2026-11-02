import type { Brand } from '@sympauthy/design'
import type { InjectionKey } from 'vue'
import { injectRequired } from './VueUtils'

export const SYMPAUTHY_NAME = 'SympAuthy'

/** What the server answers at `/branding/brand.json`, read once by `main.ts` before it mounts. */
export const brandKey = Symbol() as InjectionKey<Brand>

/** The name this deployment goes by: the server leaves it out where none is configured. */
export function brandName(brand: Brand): string {
  return brand.displayName ?? SYMPAUTHY_NAME
}

export function useBrand() {
  return { name: brandName(injectRequired(brandKey)) }
}
