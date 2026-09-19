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
  /** Spelled the way `sort` is, leading `-` included. Absent where the collection has none. */
  default_sort?: string | null
}

export type CollectionSearchResource = {
  fields: string[]
}

export type CollectionFilterResource = {
  field: string
  /**
   * The name the field is read under, in the language the request asked for. It may be reworded in
   * any release, so nothing branches on it.
   */
  name: string
  /**
   * One of the words [CollectionFieldType] holds, as a plain string: a server ahead of this panel
   * may publish one it does not know, and `knownCollectionFilters` is where that is decided.
   */
  type: string
  operators: string[]
  /**
   * The values the field holds, where its set is closed and belongs to this deployment. Absent
   * where the set is open, and a chip then offers an input of the field's own type.
   */
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
