import type { JSONSchemaType } from 'ajv'

/**
 * What one collection accepts: the fields it filters on, the fields it orders on, the fields a free
 * text `q` matches against, and the order it takes when the caller names none.
 *
 * A field absent from it is a field the collection refuses, and a field present in it is admitted
 * under every operator it lists — which is what lets a filter bar be built from it rather than
 * compiled into the panel. The sets it enumerates are the deployment's own, so it is a request and
 * not a constant.
 */
export type CollectionCapabilitiesResource = {
  search?: CollectionSearchResource | null
  filters: CollectionFilterResource[]
  sorts: CollectionSortResource[]
  default_sort?: string | null
}

export type CollectionSearchResource = {
  fields: string[]
}

/**
 * One field a collection filters on.
 *
 * `type` is a plain string and not [CollectionFieldType]: a server ahead of this panel may publish
 * a word it does not know, and `knownCollectionFilters` is where that is decided rather than here,
 * where it would blank the screen.
 */
export type CollectionFilterResource = {
  field: string
  name: string
  type: string
  operators: string[]
  values?: CollectionFilterValueResource[] | null
}

export type CollectionFilterValueResource = {
  value: string
  name: string
}

export type CollectionSortResource = {
  field: string
  name: string
}

const collectionSearchResourceSchema: JSONSchemaType<CollectionSearchResource> = {
  type: 'object',
  properties: {
    fields: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['fields'],
  additionalProperties: true
}

const collectionFilterValueResourceSchema: JSONSchemaType<CollectionFilterValueResource> = {
  type: 'object',
  properties: {
    value: {
      type: 'string'
    },
    name: {
      type: 'string'
    }
  },
  required: ['value', 'name'],
  additionalProperties: true
}

const collectionFilterResourceSchema: JSONSchemaType<CollectionFilterResource> = {
  type: 'object',
  properties: {
    field: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    operators: {
      type: 'array',
      items: { type: 'string' }
    },
    values: {
      type: 'array',
      items: { ...collectionFilterValueResourceSchema },
      nullable: true
    }
  },
  required: ['field', 'name', 'type', 'operators'],
  additionalProperties: true
}

const collectionSortResourceSchema: JSONSchemaType<CollectionSortResource> = {
  type: 'object',
  properties: {
    field: {
      type: 'string'
    },
    name: {
      type: 'string'
    }
  },
  required: ['field', 'name'],
  additionalProperties: true
}

export const collectionCapabilitiesResourceSchema: JSONSchemaType<CollectionCapabilitiesResource> =
  {
    type: 'object',
    properties: {
      search: {
        ...collectionSearchResourceSchema,
        nullable: true
      },
      filters: {
        type: 'array',
        items: { ...collectionFilterResourceSchema }
      },
      sorts: {
        type: 'array',
        items: { ...collectionSortResourceSchema }
      },
      default_sort: {
        type: 'string',
        nullable: true
      }
    },
    required: ['filters', 'sorts'],
    additionalProperties: true
  }
