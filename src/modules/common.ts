import type { AxiosInstance } from "axios";

export abstract class ApiGroup {
   protected axios: AxiosInstance

    constructor(axios: AxiosInstance) {
       this.axios = axios
    }
}

export interface Entity {
    readonly id: string

    readonly created_at: string | Date

    readonly updated_at: string | Date
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
    trash: QueryBoolean
}

export interface SortableQuery<T> {
    sort?: T

    order?: 'asc' | 'desc'

}

export type ReorderCommand = 'up' | 'down' | 'first' | 'last'

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
