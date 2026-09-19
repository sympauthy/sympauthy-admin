export function isString(value: any): value is string {
  return typeof value === 'string'
}

export function isStringNotEmpty(value: string | undefined | null): value is string {
  return value !== undefined && value !== null && value.length > 0
}

export function isStringNotBlankNorEmpty(value: string | undefined | null): value is string {
  if (isStringNotEmpty(value)) {
    const trimmedValue = value.trim()
    return trimmedValue.length > 0
  } else {
    return false
  }
}
