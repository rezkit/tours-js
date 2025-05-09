import type { AxiosInstance } from 'axios'
import type { FieldData } from './fields.js'

export abstract class ApiGroup {
  protected axios: AxiosInstance
  constructor (axios: AxiosInstance) {
    this.axios = axios
  }
}

export interface Fields {
  fields: FieldData
}

export interface ID {
  readonly id: string
}

export interface Slugged {
  slug: string
}

export interface SEO {
  seo?: SEOProperties
}

export interface SEOProperties {
  meta_title: string | null
  meta_description: string | null
}

export interface Entity extends ID {
  readonly created_at: Date

  readonly updated_at: Date
}

export interface FieldsQuery {
  fields?: Record<string, string | string[]>
}

/**
 * A paginated response
 */
export interface Paginated<T> {
  /**
     * Total number of results
     */
  total: number
  /**
     * Current page number
     */
  current_page: number
  /**
     * Total number of pages
     */
  last_page: number
  /**
     * Index of first item in `data`
     */
  from: number
  /**
     * Index of last item in `data`
     */
  to: number
  /**
     * Page of results
     */
  data: T[]
}

export interface PaginatedQuery {
  page?: number
  limit?: number
  trash?: QueryBoolean
}

/**
 * Query which allows for sort. Order may be ascending or descending.
 * Attributes which can be sorted are given by the type-param T
 */
export interface SortableQuery<T> {
  sort?: T

  order?: 'asc' | 'desc'

}

/**
 * AttachmentResponse represents the result of an attachment/replacement
 * operation
 */
export interface AttachmentResponse {
  /**
     * IDs of items which were attached
     */
  attached: string[]

  /**
     * IDs of items which were detached
     */
  detached: string[]

  /**
     * IDs of items which were updated
     */
  updated: string[]
}

/**
 * Command words to re-order items in ordered sets.
 */
export type ReorderCommand = string | number

/**
 * A type which represents the possible values for a boolean parameter in a URL query
 */
export type QueryBoolean = QueryBooleanTrue | QueryBooleanFalse | QueryBooleanUndefined

/**
 * The values that resolve to true in a URL boolean
 */
export type QueryBooleanTrue = 1 | '1'

/**
 * The values that resolve to false in a URL boolean
 */
export type QueryBooleanFalse = 0 | '0'

/**
 * The values that resolve to an undefined value in a URL boolean
 */
export type QueryBooleanUndefined = null | ''

/**
 * The names of entity types
 */
export type EntityType =
    'holiday' |
    'category' |
    'holiday_version' |
    'element' |
    'element_option' |
    'departure' |
    'content' |
    'image' |
    'itinerary' |
    'location' |
    'accommodation' |
    'room_type' |
    'extra' |
    'cake'

/**
 * Inventory Interface
 */
export interface Inventory {
  type: string
}

/**
 * Allocation Inventory has a type of 'allocation'
 * and a capacity value.
 *
 * Allocation is depleted from capacity as reservations are made and
 * a reservation cannot be made if the remaining allocation is too low.
 */
export interface AllocationInventory extends Inventory {
  type: 'allocation'
  capacity: number
}

/**
 * On Request Inventory  has a type of 'on_request' and an
 * errata string.
 *
 * Reservations cannot be confirmed automatically and instead are entered
 * into a queue of reservations to be verified and updated.
 */
export interface OnRequestInventory extends Inventory {
  type: 'on_request'
  errata: string
}

/**
 * Free-sell inventory has a type of 'free_sell' and no additional properties.
 */
export interface FreeSellInventory extends Inventory {
  type: 'free_sell'
}
